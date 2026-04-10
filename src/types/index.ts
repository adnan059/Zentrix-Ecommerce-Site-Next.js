import { IOrder } from "@/lib/db/models/order.model";

export type UserRole = "buyer" | "vendor" | "admin";

export type VendorStatus = "pending" | "approved" | "suspended";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type ProductStatus = "draft" | "published" | "archived";

export type PaymentStatus = "unpaid" | "paid" | "refunded";

export interface IProductVariant {
  _id?: string;
  label: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  specs: Record<string, string>;
}

export interface ICartItem {
  productId: string;
  variantId: string;
  vendorId: string;
  name: string;
  variantLabel: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
  sku: string;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode?: string;
}

export type PlainOrder = Omit<
  IOrder,
  "_id" | "userId" | "items" | "createdAt" | "updatedAt" | "paidAt"
> & {
  _id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  items: Array<
    Omit<
      IOrder["items"][number],
      "_id" | "productId" | "variantId" | "vendorId"
    > & {
      _id: string;
      productId: string;
      variantId: string;
      vendorId: string;
    }
  >;
};

export type PlainWishlistProduct = {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  variants: Array<{ price: number; [key: string]: unknown }>;
  status: "draft" | "published" | "archived";
};

export type PlainReview = {
  _id: string;
  productId: string;
  userId: { _id: string; name: string; image?: string } | string;
  orderId: string;
  rating: number;
  title: string;
  body: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PlainReviewWithProduct = Omit<PlainReview, "productId"> & {
  productId: { _id: string; name: string; slug: string; images: string[] };
};

export type PlainReviewWithUser = Omit<PlainReview, "userId"> & {
  userId: { _id: string; name: string; image?: string };
};

export type PlainUser = {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  isActive: boolean;
  emailVerified?: string;
  createdAt: string;
  updatedAt: string;
  hasPassword: boolean;
};
