import ProductFilters from "@/components/products/product-filters";
import ProductGrid from "@/components/products/product-grid";
import ProductSort from "@/components/products/product-sort";
import Pagination from "@/components/shared/pagination";
import { getAllCategories, getCategoryBySlug } from "@/lib/data/categories";
import { getProducts } from "@/lib/data/products";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface ICategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    brand?: string;
  }>;
}

export async function generateMetadata({
  params,
}: ICategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };

  return {
    title: `${category.name} - Buy online at Zentrix`,
    description: `Shop the best ${category.name} products from verified vendors. Compare prices, specs, and reviews.`,
    openGraph: {
      title: `${category.name} | Zentrix`,
      images: category.image ? [{ url: category.image }] : [],
    },
  };
}

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((cat) => ({ slug: cat.slug }));
}

export const revalidate = 3600;

export default async function CategoryPage({
  params,
  searchParams,
}: ICategoryPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  const page = Number(sp.page) || 1;
  const sort = (sp.sort as any) || "newest";
  const minPrice = sp.minPrice ? Number(sp.minPrice) : undefined;
  const maxPrice = sp.maxPrice ? Number(sp.maxPrice) : undefined;

  const [{ products, totalCount, totalPages }, allCategories] =
    await Promise.all([
      getProducts({
        categorySlug: slug,
        page,
        sort,
        minPrice,
        maxPrice,
        brand: sp.brand,
      }),
      getAllCategories(),
    ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <span>Home</span>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{category.name}</span>
      </nav>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {totalCount} products found
        </p>
      </div>

      <div className="flex gap-8">
        <aside className="hidden lg:block w-56 shrink-0">
          <ProductFilters
            categories={allCategories}
            activeCategory={slug}
            specSchema={category.specSchema}
          />
        </aside>

        <div className="flex-1 min-w-0 space-y-6">
          <ProductSort />
          <ProductGrid products={products} />
          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} />
          )}
        </div>
      </div>
    </div>
  );
}
