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

export type ProductSortOption =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "rating";

export interface IProductVariant {
  _id: string;
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

export type PlainCategory = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  specSchema: Array<{
    key: string;
    label: string;
    type: "text" | "number" | "select";
    options?: string[];
    unit?: string;
    filterable: boolean;
  }>;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type PlainWishlistProduct = {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  variants: Array<{ price: number; [key: string]: unknown }>;

  status: ProductStatus;
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

export interface IPopulatedVendor {
  _id: string;
  storeName: string;
  storeSlug: string;
  rating: number;
  totalReviews: number;
}

export interface IPopulatedCategory {
  _id: string;
  name: string;
  slug: string;
}

export type PopulatedProduct = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  images: string[];
  basePrice: number;
  rating: number;
  totalReviews: number;
  totalSales: number;
  tags: string[];
  warranty?: string;
  status: ProductStatus;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  variants: IProductVariant[];
  vendorId: IPopulatedVendor;
  categoryId: IPopulatedCategory;
};

export type PlainVendor = {
  _id: string;
  userId: string;
  storeName: string;
  storeSlug: string;
  description?: string;
  logo?: string;
  banner?: string;
  email: string;
  phone?: string;
  address?: string;
  status: VendorStatus;
  rating: number;
  totalReviews: number;
  totalSales: number;
  commissionRate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PlainProduct = {
  _id: string;
  vendorId: string;
  categoryId: string | IPopulatedCategory;
  name: string;
  slug: string;
  description: string;
  brand: string;
  images: string[];
  variants: IProductVariant[];
  basePrice: number;
  status: ProductStatus;
  isFeatured: boolean;
  rating: number;
  totalReviews: number;
  totalSales: number;
  tags: string[];
  warranty?: string;
  createdAt: string;
  updatedAt: string;
};

export type VendorOrderItem = {
  _id: string;
  productId: string;
  variantId: string;
  name: string;
  variantLabel: string;
  sku: string;
  image: string;
  price: number;
  quantity: number;
  subtotal: number;
  status: OrderStatus;
  trackingNumber?: string;
};

export type VendorOrder = {
  _id: string;
  userId: { _id: string; name: string; email: string } | string;
  items: VendorOrderItem[]; // only this vendor's items
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    district: string;
    postalCode?: string;
  };
  total: number;
  paymentStatus: PaymentStatus;
  paymentMethod: "aamarpay" | "cod";
  createdAt: string;
};

export type VendorEarningsSummary = {
  totalRevenue: number;
  platformFee: number;
  netEarnings: number;
  totalOrders: number;
  totalItemsSold: number;
  commissionRate: number;
};
