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
}
