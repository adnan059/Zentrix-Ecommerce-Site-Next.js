import ProductFilters from "@/components/products/product-filters";
import ProductGrid from "@/components/products/product-grid";
import ProductSort from "@/components/products/product-sort";
import Pagination from "@/components/shared/pagination";
import { getAllCategories } from "@/lib/data/categories";
import { getProducts } from "@/lib/data/products";
import { ProductSortOption } from "@/types";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Products",
  description:
    "Browse all PC components — processors, motherboards, RAM, storage, monitors and more.",
};

// Allowed sort values — used to safely narrow the URL param
const VALID_SORT_OPTIONS: ProductSortOption[] = [
  "newest",
  "price-asc",
  "price-desc",
  "rating",
];

function parseSortParam(raw: string | undefined): ProductSortOption {
  if (raw && (VALID_SORT_OPTIONS as string[]).includes(raw)) {
    return raw as ProductSortOption;
  }
  return "newest";
}

interface IProductsPageProps {
  searchParams: Promise<{
    page?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    brand?: string;
    search?: string;
  }>;
}

export default async function ProductsPage({
  searchParams,
}: IProductsPageProps) {
  const params = await searchParams;

  const page = Math.max(1, Number(params.page) || 1);
  // ✅ No more "as any" — properly validated against the allowed union
  const sort = parseSortParam(params.sort);
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;

  const [{ products, totalCount, totalPages }, categories] = await Promise.all([
    getProducts({
      page,
      sort,
      minPrice,
      maxPrice,
      brand: params.brand,
      search: params.search,
    }),
    getAllCategories(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
        <p className="text-sm text-gray-500 mt-1">
          {totalCount} product{totalCount !== 1 ? "s" : ""} found
        </p>
      </div>
      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className="hidden lg:block w-56 shrink-0">
          <ProductFilters categories={categories} />
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-6">
          <div className="flex items-center justify-between">
            <ProductSort />
          </div>
          {/* ✅ products is now PopulatedProduct[] — matches ProductGrid prop type */}
          <ProductGrid products={products} />

          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} />
          )}
        </div>
      </div>
    </div>
  );
}
