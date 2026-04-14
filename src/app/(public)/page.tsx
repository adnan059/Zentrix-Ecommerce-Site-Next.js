import ProductGrid from "@/components/products/product-grid";
import { Button } from "@/components/ui/button";
import { getAllCategories } from "@/lib/data/categories";
import { getFeaturedProducts } from "@/lib/data/products";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Zentrix - Build Your Dream PC",
  description:
    "Shop PC components from hundreds of verified vendors. Best prices on processors, motherboards, RAM, storage and more.",
};

export const revalidate = 3600;

export default async function HomePage() {
  const [categories, featuredProducts] = await Promise.all([
    getAllCategories(),
    getFeaturedProducts(8),
  ]);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero */}
      <section className="bg-linear-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Build Your Dream PC
            </h1>
            <p className="text-blue-100 text-lg">
              Shop from hundreds of verified vendors. Get the best deals on
              processors, motherboards, RAM, storage, and more.
            </p>
            <div className="flex gap-3">
              <Link href="/products">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  Shop Now
                </Button>
              </Link>
              <Link href="/vendor/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-blue-700"
                >
                  Sell on Zentrix
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Shop by Category
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="group flex flex-col items-center gap-2 p-3 rounded-xl border bg-white hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="relative w-12 h-12">
                <Image
                  unoptimized
                  src={
                    category.image ??
                    `https://dummyimage.com/400x400/e2e8f0/475569&text=${category.name}`
                  }
                  alt={category.name}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xs text-cente text-gray-600 group-hover:text-blue-600 font-medium leading-tight">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Featured Products
            </h2>
            <Link
              href="/products"
              className="text-sm text-blue-600 hover:underline"
            >
              View all →
            </Link>
          </div>
          <ProductGrid products={featuredProducts} />
        </section>
      )}
      {/* Empty state — shown when no featured products yet */}

      {featuredProducts.length === 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-10">
          <p className="text-gray-400">
            No featured products yet. Add some products to get started.
          </p>
        </section>
      )}
    </div>
  );
}
