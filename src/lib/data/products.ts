import { SortOrder } from "mongoose";
import { connectDB } from "../db/connect";
import { IProduct, Product } from "../db/models/product.model";
import "../db/models/vendor.model";
import "../db/models/category.model";

export interface IGetProductsOptions {
  categorySlug?: string;
  page?: number;
  limit?: number;
  sort?: "newest" | "price-asc" | "price-desc" | "rating";
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  search?: string;
}

export interface IProductsResult {
  products: IProduct[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

/* ───────────────── fetch products with filters ───────────────── */

export async function getProducts(
  options: IGetProductsOptions = {},
): Promise<IProductsResult> {
  await connectDB();

  const {
    categorySlug,
    page = 1,
    limit = 6,
    sort = "newest",
    minPrice,
    maxPrice,
    brand,
    search,
  } = options;

  const query: Record<string, unknown> = { status: "published" };

  if (categorySlug) {
    // Look up category ID from slug
    const { Category } = await import("@/lib/db/models/category.model");
    const category = await Category.findOne({ slug: categorySlug }).lean();

    if (category) query.categoryId = category._id;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.basePrice = {};

    if (minPrice !== undefined) {
      (query.basePrice as Record<string, number>).$gte = minPrice;
    }

    if (maxPrice !== undefined) {
      (query.basePrice as Record<string, number>).$lte = maxPrice;
    }
  }

  if (brand) {
    query.brand = { $regex: brand, $options: "i" };
  }

  if (search) {
    query.$text = { $search: search };
  }

  /* ───────────────── sorting ───────────────── */

  const sortMap: Record<string, Record<string, SortOrder>> = {
    newest: { createdAt: -1 },
    "price-asc": { basePrice: 1 },
    "price-desc": { basePrice: -1 },
    rating: { rating: -1 },
  };

  const sortQuery = sortMap[sort] ?? { createdAt: -1 };

  const skip = (page - 1) * limit;

  const [products, totalCount] = await Promise.all([
    Product.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .populate("categoryId", "name slug")
      .populate("vendorId", "storeName storeSlug rating")
      .lean(),
    Product.countDocuments(query),
  ]);

  return {
    products: JSON.parse(JSON.stringify(products)),
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

/* ───────────────── fetch single product by slug ───────────────── */

export async function getProductBySlug(slug: string): Promise<IProduct | null> {
  await connectDB();
  const product = await Product.findOne({ slug, status: "published" })
    .populate("categoryId", "name slug specSchema")
    .populate("vendorId", "storeName storeSlug rating totalReviews")
    .lean();

  if (!product) return null;
  return JSON.parse(JSON.stringify(product));
}

/* ───────────────── fetch featured products for home page ───────────────── */
export async function getFeaturedProducts(limit = 8): Promise<IProduct[]> {
  await connectDB();
  const products = await Product.find({
    status: "published",
    isFeatured: true,
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("categoryId", "name slug")
    .populate("vendorId", "storeName storeSlug")
    .lean();
  return JSON.parse(JSON.stringify(products));
}

/* ───────────────── fetch related products ───────────────── */

export async function getRelatedProducts(
  categoryId: string,
  excludeSlug: string,
  limit = 4,
): Promise<IProduct[]> {
  await connectDB();
  const products = await Product.find({
    categoryId,
    slug: { $ne: excludeSlug },
    status: "published",
  })
    .sort({ rating: -1 })
    .limit(limit)
    .populate("categoryId", "name slug")
    .populate("vendorId", "storeName storeSlug")
    .lean();

  return JSON.parse(JSON.stringify(products));
}
