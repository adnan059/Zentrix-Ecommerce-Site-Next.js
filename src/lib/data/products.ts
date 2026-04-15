import { SortOrder } from "mongoose";
import { connectDB } from "../db/connect";
import { Product } from "../db/models/product.model";
import { PopulatedProduct, ProductSortOption } from "@/types";
import "../db/models/vendor.model";
import "../db/models/category.model";

export interface IGetProductsOptions {
  categorySlug?: string;
  page?: number;
  limit?: number;
  sort?: ProductSortOption;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  search?: string;
}

export interface IProductsResult {
  products: PopulatedProduct[];
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

  const sortMap: Record<ProductSortOption, Record<string, SortOrder>> = {
    newest: { createdAt: -1 },
    "price-asc": { basePrice: 1 },
    "price-desc": { basePrice: -1 },
    rating: { rating: -1 },
  };

  const sortQuery = sortMap[sort] ?? { createdAt: -1 };
  const skip = (page - 1) * limit;

  const [rawProducts, totalCount] = await Promise.all([
    Product.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .populate("categoryId", "name slug")
      .populate("vendorId", "storeName storeSlug rating totalReviews")
      .lean(),
    Product.countDocuments(query),
  ]);

  return {
    products: JSON.parse(JSON.stringify(rawProducts)) as PopulatedProduct[],
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

/* ───────────────── fetch single product by slug ───────────────── */

export async function getProductBySlug(
  slug: string,
): Promise<PopulatedProduct | null> {
  await connectDB();
  const product = await Product.findOne({ slug, status: "published" })
    .populate("categoryId", "name slug specSchema")
    .populate("vendorId", "storeName storeSlug rating totalReviews")
    .lean();

  if (!product) return null;
  return JSON.parse(JSON.stringify(product)) as PopulatedProduct;
}

/* ───────────────── fetch featured products for home page ───────────────── */

export async function getFeaturedProducts(
  limit = 8,
): Promise<PopulatedProduct[]> {
  await connectDB();
  const products = await Product.find({
    status: "published",
    isFeatured: true,
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("categoryId", "name slug")
    .populate("vendorId", "storeName storeSlug rating totalReviews")
    .lean();

  return JSON.parse(JSON.stringify(products)) as PopulatedProduct[];
}

/* ───────────────── fetch related products ───────────────── */

export async function getRelatedProducts(
  categoryId: string,
  excludeSlug: string,
  limit = 4,
): Promise<PopulatedProduct[]> {
  await connectDB();
  const products = await Product.find({
    categoryId,
    slug: { $ne: excludeSlug },
    status: "published",
  })
    .sort({ rating: -1 })
    .limit(limit)
    .populate("categoryId", "name slug")
    .populate("vendorId", "storeName storeSlug rating totalReviews")
    .lean();

  return JSON.parse(JSON.stringify(products)) as PopulatedProduct[];
}
