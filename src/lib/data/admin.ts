// src/lib/data/admin.ts
import { connectDB } from "../db/connect";
import { User } from "../db/models/user.model";
import { Vendor } from "../db/models/vendor.model";
import { Product } from "../db/models/product.model";
import { Order } from "../db/models/order.model";
import { Review } from "../db/models/review.model";
import "../db/models/category.model";
import { Types, PipelineStage } from "mongoose";
import type {
  AdminDashboardStats,
  AdminAnalyticsMonth,
  AdminVendorRow,
  AdminVendorDetail,
  AdminProductRow,
  AdminUserRow,
  AdminOrderRow,
  AdminOrderDetail,
  AdminReviewRow,
} from "@/types/admin.types";

/* ─── Dashboard stats ─────────────────────────────────────────────────────── */

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  await connectDB();

  const [
    totalUsers,
    totalVendors,
    pendingVendors,
    totalProducts,
    publishedProducts,
    pendingReviews,
    orderAgg,
    platformRevenueAgg,
  ] = await Promise.all([
    User.countDocuments(),
    Vendor.countDocuments(),
    Vendor.countDocuments({ status: "pending" }),
    Product.countDocuments(),
    Product.countDocuments({ status: "published" }),
    Review.countDocuments({ isApproved: false }),
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalOrders: { $sum: 1 },
        },
      },
    ]),
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "vendors",
          localField: "items.vendorId",
          foreignField: "_id",
          as: "vendor",
        },
      },
      { $unwind: { path: "$vendor", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: null,
          platformRevenue: {
            $sum: {
              $multiply: [
                "$items.subtotal",
                {
                  $divide: [{ $ifNull: ["$vendor.commissionRate", 10] }, 100],
                },
              ],
            },
          },
        },
      },
    ]),
  ]);

  return {
    totalUsers,
    totalVendors,
    pendingVendors,
    totalProducts,
    publishedProducts,
    totalOrders: orderAgg[0]?.totalOrders ?? 0,
    totalRevenue: orderAgg[0]?.totalRevenue ?? 0,
    platformRevenue: platformRevenueAgg[0]?.platformRevenue ?? 0,
    pendingReviews,
  };
}

/* ─── Analytics — last 12 months ─────────────────────────────────────────── */

export async function getAdminAnalytics(): Promise<AdminAnalyticsMonth[]> {
  await connectDB();

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const raw = await Order.aggregate([
    { $match: { paymentStatus: "paid", createdAt: { $gte: twelveMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const now = new Date();
  const result: AdminAnalyticsMonth[] = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const found = raw.find((r) => r._id.year === year && r._id.month === month);
    const revenue = found?.revenue ?? 0;
    result.push({
      month: `${monthNames[month - 1]} ${year}`,
      revenue,
      orders: found?.orders ?? 0,
      platformFee: Math.round(revenue * 0.1 * 100) / 100,
    });
  }

  return result;
}

/* ─── Vendors ─────────────────────────────────────────────────────────────── */

export async function getAdminVendors(options: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}): Promise<{
  vendors: AdminVendorRow[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}> {
  await connectDB();
  const { page = 1, limit = 15, status, search } = options;

  const query: Record<string, unknown> = {};
  if (status && status !== "all") query.status = status;
  if (search) {
    query.$or = [
      { storeName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [rawVendors, totalCount] = await Promise.all([
    Vendor.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Vendor.countDocuments(query),
  ]);

  return {
    vendors: JSON.parse(JSON.stringify(rawVendors)) as AdminVendorRow[],
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

export async function getAdminVendorById(
  vendorId: string,
): Promise<AdminVendorDetail | null> {
  await connectDB();

  const vendorObjectId = new Types.ObjectId(vendorId);

  const [vendor, productCount, orderCount, revenueAgg] = await Promise.all([
    Vendor.findById(vendorId).lean(),
    Product.countDocuments({ vendorId }),
    Order.countDocuments({
      "items.vendorId": vendorObjectId,
      paymentStatus: "paid",
    }),
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $unwind: "$items" },
      { $match: { "items.vendorId": vendorObjectId } },
      { $group: { _id: null, totalRevenue: { $sum: "$items.subtotal" } } },
    ]),
  ]);

  if (!vendor) return null;

  return JSON.parse(
    JSON.stringify({
      ...vendor,
      productCount,
      orderCount,
      totalRevenue: revenueAgg[0]?.totalRevenue ?? 0,
    }),
  ) as AdminVendorDetail;
}

/* ─── Products ────────────────────────────────────────────────────────────── */

export async function getAdminProducts(options: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  vendorId?: string;
}): Promise<{
  products: AdminProductRow[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}> {
  await connectDB();
  const { page = 1, limit = 15, status, search, vendorId } = options;

  const query: Record<string, unknown> = {};
  if (status && status !== "all") query.status = status;
  if (vendorId) query.vendorId = vendorId;
  if (search) query.$text = { $search: search };

  const skip = (page - 1) * limit;

  const [rawProducts, totalCount] = await Promise.all([
    Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("vendorId", "storeName storeSlug")
      .populate("categoryId", "name slug")
      .lean(),
    Product.countDocuments(query),
  ]);

  return {
    products: JSON.parse(JSON.stringify(rawProducts)) as AdminProductRow[],
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

/* ─── Users ───────────────────────────────────────────────────────────────── */

export async function getAdminUsers(options: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}): Promise<{
  users: AdminUserRow[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}> {
  await connectDB();
  const { page = 1, limit = 15, role, search } = options;

  const query: Record<string, unknown> = {};
  if (role && role !== "all") query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [rawUsers, totalCount] = await Promise.all([
    User.find(query)
      .select("name email image role isActive emailVerified createdAt vendorId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  return {
    users: JSON.parse(JSON.stringify(rawUsers)) as AdminUserRow[],
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

/* ─── Orders ──────────────────────────────────────────────────────────────── */

export async function getAdminOrders(options: {
  page?: number;
  limit?: number;
  paymentStatus?: string;
  search?: string;
}): Promise<{
  orders: AdminOrderRow[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}> {
  await connectDB();
  const { page = 1, limit = 15, paymentStatus, search } = options;

  const matchStage: Record<string, unknown> = {};
  if (paymentStatus && paymentStatus !== "all")
    matchStage.paymentStatus = paymentStatus;

  const skip = (page - 1) * limit;

  const basePipeline: PipelineStage[] = [
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userId",
        pipeline: [{ $project: { name: 1, email: 1 } }],
      },
    },
    { $unwind: "$userId" },
  ];

  if (search) {
    basePipeline.push({
      $match: {
        $or: [
          { "userId.name": { $regex: search, $options: "i" } },
          { "userId.email": { $regex: search, $options: "i" } },
          { transactionId: { $regex: search, $options: "i" } },
        ],
      },
    });
  }

  const [rawOrders, countResult] = await Promise.all([
    Order.aggregate([
      ...basePipeline,
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          userId: 1,
          itemCount: { $size: "$items" },
          total: 1,
          status: 1,
          paymentStatus: 1,
          paymentMethod: 1,
          createdAt: 1,
        },
      },
    ]),
    Order.aggregate([...basePipeline, { $count: "total" }]),
  ]);

  const totalCount = countResult[0]?.total ?? 0;

  return {
    orders: JSON.parse(JSON.stringify(rawOrders)) as AdminOrderRow[],
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

export async function getAdminOrderById(
  orderId: string,
): Promise<AdminOrderDetail | null> {
  await connectDB();

  const order = await Order.findById(orderId)
    .populate("userId", "name email")
    .populate("items.vendorId", "storeName")
    .lean();

  if (!order) return null;

  return JSON.parse(JSON.stringify(order)) as AdminOrderDetail;
}

/* ─── Reviews ─────────────────────────────────────────────────────────────── */

export async function getAdminReviews(options: {
  page?: number;
  limit?: number;
  isApproved?: boolean;
}): Promise<{
  reviews: AdminReviewRow[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}> {
  await connectDB();
  const { page = 1, limit = 15, isApproved } = options;

  const query: Record<string, unknown> =
    isApproved !== undefined ? { isApproved } : {};
  const skip = (page - 1) * limit;

  const [rawReviews, totalCount] = await Promise.all([
    Review.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("productId", "name slug images")
      .populate("userId", "name image")
      .lean(),
    Review.countDocuments(query),
  ]);

  return {
    reviews: JSON.parse(JSON.stringify(rawReviews)) as AdminReviewRow[],
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}
