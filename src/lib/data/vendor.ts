import { connectDB } from "../db/connect";
import { Vendor } from "../db/models/vendor.model";
import { Order } from "../db/models/order.model";
import { Product } from "../db/models/product.model";
import "../db/models/user.model";
import { Types } from "mongoose";
import {
  PlainVendor,
  PlainProduct,
  VendorOrder,
  VendorEarningsSummary,
} from "@/types";

/* ─── Get vendor by userId ─────────────────────────────── */

export async function getVendorByUserId(
  userId: string,
): Promise<PlainVendor | null> {
  await connectDB();
  const vendor = await Vendor.findOne({ userId }).lean();
  if (!vendor) return null;
  return JSON.parse(JSON.stringify(vendor));
}

/* ─── Get vendor products ────────────────────────────── */

export interface IGetVendorProductsOptions {
  vendorId: string;
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export async function getVendorProducts(
  options: IGetVendorProductsOptions,
): Promise<{
  products: PlainProduct[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}> {
  await connectDB();
  const { vendorId, page = 1, limit = 10, status, search } = options;

  const query: Record<string, unknown> = { vendorId };
  if (status && status !== "all") query.status = status;
  if (search) query.$text = { $search: search };

  const skip = (page - 1) * limit;

  const [rawProducts, totalCount] = await Promise.all([
    Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("categoryId", "name slug")
      .lean(),
    Product.countDocuments(query),
  ]);

  return {
    products: JSON.parse(JSON.stringify(rawProducts)) as PlainProduct[],
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

/* ─── Get single vendor product (ownership check) ──────── */

export async function getVendorProductById(
  productId: string,
  vendorId: string,
): Promise<PlainProduct | null> {
  await connectDB();
  const product = await Product.findOne({ _id: productId, vendorId })
    .populate("categoryId", "name slug specSchema")
    .lean();
  if (!product) return null;
  return JSON.parse(JSON.stringify(product));
}

/* ─── Get vendor orders (only their items) ─────────────── */

export async function getVendorOrders(
  vendorId: string,
  page = 1,
  limit = 10,
  status?: string,
): Promise<{
  orders: VendorOrder[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}> {
  await connectDB();

  const vendorObjectId = new Types.ObjectId(vendorId);

  // Build the match query using $elemMatch when status filter is active
  // to ensure BOTH conditions apply to the SAME array element
  let matchQuery: Record<string, unknown>;

  if (status && status !== "all") {
    matchQuery = {
      items: {
        $elemMatch: {
          vendorId: vendorObjectId,
          status,
        },
      },
      paymentStatus: "paid",
    };
  } else {
    matchQuery = {
      "items.vendorId": vendorObjectId,
      paymentStatus: "paid",
    };
  }

  const skip = (page - 1) * limit;

  const [rawOrders, totalCount] = await Promise.all([
    Order.find(matchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email")
      .lean(),
    Order.countDocuments(matchQuery),
  ]);

  // Filter items to only this vendor's items
  const vendorOrders: VendorOrder[] = rawOrders.map((order) => ({
    _id: order._id.toString(),
    userId: JSON.parse(JSON.stringify(order.userId)),
    items: order.items
      .filter((item) => item.vendorId.toString() === vendorId)
      .map((item) => ({
        _id: item._id.toString(),
        productId: item.productId.toString(),
        variantId: item.variantId.toString(),
        name: item.name,
        variantLabel: item.variantLabel,
        sku: item.sku,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal,
        status: item.status,
        trackingNumber: item.trackingNumber,
      })),
    shippingAddress: order.shippingAddress,
    total: order.items
      .filter((item) => item.vendorId.toString() === vendorId)
      .reduce((sum, item) => sum + item.subtotal, 0),
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt.toISOString(),
  }));

  return {
    orders: vendorOrders,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

/* ─── Get single vendor order ────────────────────────── */

export async function getVendorOrderById(
  orderId: string,
  vendorId: string,
): Promise<VendorOrder | null> {
  await connectDB();

  const order = await Order.findOne({
    _id: orderId,
    "items.vendorId": new Types.ObjectId(vendorId),
    paymentStatus: "paid",
  })
    .populate("userId", "name email")
    .lean();

  if (!order) return null;

  return {
    _id: order._id.toString(),
    userId: JSON.parse(JSON.stringify(order.userId)),
    items: order.items
      .filter((item) => item.vendorId.toString() === vendorId)
      .map((item) => ({
        _id: item._id.toString(),
        productId: item.productId.toString(),
        variantId: item.variantId.toString(),
        name: item.name,
        variantLabel: item.variantLabel,
        sku: item.sku,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal,
        status: item.status,
        trackingNumber: item.trackingNumber,
      })),
    shippingAddress: order.shippingAddress,
    total: order.items
      .filter((item) => item.vendorId.toString() === vendorId)
      .reduce((sum, item) => sum + item.subtotal, 0),
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt.toISOString(),
  };
}

/* ─── Get earnings summary ────────────────────────────── */

export async function getVendorEarnings(
  vendorId: string,
  commissionRate: number,
): Promise<VendorEarningsSummary> {
  await connectDB();

  const orders = await Order.find({
    "items.vendorId": new Types.ObjectId(vendorId),
    paymentStatus: "paid",
  })
    .select("items")
    .lean();

  let totalRevenue = 0;
  let totalItemsSold = 0;
  let ordersWithSales = 0;

  for (const order of orders) {
    let orderHasSale = false;
    for (const item of order.items) {
      if (
        item.vendorId.toString() === vendorId &&
        item.status !== "cancelled"
      ) {
        totalRevenue += item.subtotal;
        totalItemsSold += item.quantity;
        orderHasSale = true;
      }
    }
    if (orderHasSale) ordersWithSales++;
  }

  const platformFee = (totalRevenue * commissionRate) / 100;
  const netEarnings = totalRevenue - platformFee;

  return {
    totalRevenue,
    platformFee,
    netEarnings,
    totalOrders: ordersWithSales,
    totalItemsSold,
    commissionRate,
  };
}

/* ─── Dashboard stats ─────────────────────────────────── */

export async function getVendorDashboardStats(vendorId: string) {
  await connectDB();

  const [totalProducts, publishedProducts, pendingOrders, vendor] =
    await Promise.all([
      Product.countDocuments({ vendorId }),
      Product.countDocuments({ vendorId, status: "published" }),
      Order.countDocuments({
        items: {
          $elemMatch: {
            vendorId: new Types.ObjectId(vendorId),
            status: "pending",
          },
        },
        paymentStatus: "paid",
      }),
      Vendor.findById(vendorId)
        .select("totalSales rating totalReviews commissionRate")
        .lean(),
    ]);

  return {
    totalProducts,
    publishedProducts,
    pendingOrders,
    totalSales: vendor?.totalSales ?? 0,
    rating: vendor?.rating ?? 0,
    totalReviews: vendor?.totalReviews ?? 0,
    commissionRate: vendor?.commissionRate ?? 10,
  };
}
