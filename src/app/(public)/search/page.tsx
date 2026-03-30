import ProductFilters from "@/components/products/product-filters";
import ProductGrid from "@/components/products/product-grid";
import ProductSort from "@/components/products/product-sort";
import Pagination from "@/components/shared/pagination";
import { getAllCategories } from "@/lib/data/categories";
import { getProducts } from "@/lib/data/products";
import { Search } from "lucide-react";
import { Metadata } from "next";

interface ISearchPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: ISearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search results for "${q}"` : "Search",
    description: q
      ? `Browse search results for ${q} on Zentrix`
      : "Search for PC components on Zentrix",
  };
}

export default async function SearchPage({ searchParams }: ISearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const page = Number(params.page) || 1;
  const sort = (params.sort as any) || "newest";
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  const [{ products, totalCount, totalPages }, categories] = await Promise.all([
    getProducts({
      search: query || undefined,
      page,
      sort,
      minPrice,
      maxPrice,
    }),
    getAllCategories(),
  ]);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        {query ? (
          <>
            <div className="flex items-center gap-2 mb-1">
              <Search className="w-5 h-5 text-gray-400" />
              <h1 className="text-2xl font-bold text-gray-900">
                Results for{" "}
                <span className="text-blue-600">&quot;{query}&quot;</span>
              </h1>
            </div>
            <p className="text-sm text-gray-500">
              {totalCount} product{totalCount !== 1 ? "s" : ""} found
            </p>
          </>
        ) : (
          <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
        )}
      </div>
      {/* Empty state */}
      {query && totalCount === 0 ? (
        <div className="text-center py-20 space-y-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8 text-gray-300" />
          </div>
          <h2 className="text-lg font-medium text-gray-900">
            No results for &quot;{query}&quot;
          </h2>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">
            Try different keywords, check your spelling, or browse by category.
          </p>
        </div>
      ) : (
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <ProductFilters categories={categories} />
          </aside>
          {/* Results */}
          <div className="flex-1 min-w-0 space-y-6">
            <div className="flex items-center justify-between">
              <ProductSort />
            </div>
            <ProductGrid products={products} />
            {totalPages > 1 && (
              <Pagination currentPage={page} totalPages={totalPages} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
