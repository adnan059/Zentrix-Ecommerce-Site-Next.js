// src/types/admin.types.ts
import type {
  OrderStatus,
  PaymentStatus,
  ProductStatus,
  UserRole,
  VendorStatus,
} from "./index";

export type AdminDashboardStats = {
  totalUsers: number;
  totalVendors: number;
  pendingVendors: number;
  totalProducts: number;
  publishedProducts: number;
  totalOrders: number;
  totalRevenue: number;
  platformRevenue: number;
  pendingReviews: number;
};

export type AdminAnalyticsMonth = {
  month: string; // e.g. "Jan 2025"
  revenue: number;
  orders: number;
  platformFee: number;
};

export type AdminVendorRow = {
  _id: string;
  storeName: string;
  storeSlug: string;
  email: string;
  status: VendorStatus;
  commissionRate: number;
  totalSales: number;
  rating: number;
  totalReviews: number;
  isActive: boolean;
  createdAt: string;
  userId: string;
};

export type AdminVendorDetail = AdminVendorRow & {
  description?: string;
  logo?: string;
  banner?: string;
  phone?: string;
  address?: string;
  productCount: number;
  orderCount: number;
  totalRevenue: number;
};

export type AdminProductRow = {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  images: string[];
  basePrice: number;
  status: ProductStatus;
  isFeatured: boolean;
  rating: number;
  totalReviews: number;
  totalSales: number;
  createdAt: string;
  vendorId: { _id: string; storeName: string; storeSlug: string } | string;
  categoryId: { _id: string; name: string; slug: string } | string;
};

export type AdminUserRow = {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  isActive: boolean;
  emailVerified?: string;
  createdAt: string;
  vendorId?: string;
};

export type AdminOrderRow = {
  _id: string;
  userId: { _id: string; name: string; email: string } | string;
  itemCount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: "aamarpay" | "cod";
  createdAt: string;
};

export type AdminOrderDetail = {
  _id: string;
  userId: { _id: string; name: string; email: string };
  items: Array<{
    _id: string;
    productId: string;
    variantId: string;
    vendorId: { _id: string; storeName: string } | string;
    name: string;
    variantLabel: string;
    sku: string;
    image: string;
    price: number;
    quantity: number;
    subtotal: number;
    status: OrderStatus;
    trackingNumber?: string;
  }>;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    district: string;
    postalCode?: string;
  };
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: "aamarpay" | "cod";
  transactionId?: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminReviewRow = {
  _id: string;
  productId: { _id: string; name: string; slug: string; images: string[] };
  userId: { _id: string; name: string; image?: string };
  orderId: string;
  rating: number;
  title: string;
  body: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
};
