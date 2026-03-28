/* eslint-disable @typescript-eslint/no-explicit-any */
import ProductImages from "@/components/products/product-detail/product-images";
import ProductInfo from "@/components/products/product-detail/product-info";
import ProductGrid from "@/components/products/product-grid";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Product, WithContext } from "schema-dts";

interface IProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: IProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };

  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export const revalidate = 3600;

export default async function ProductPage({ params }: IProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const categoryId = (product.categoryId as any)?._id?.toString();

  const relatedProducts = categoryId
    ? await getRelatedProducts(categoryId, slug, 4)
    : [];

  // JSON-LD structured data — helps Google show rich results
  const jsonLd: WithContext<Product> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    offers: {
      "@type": "Offer",
      price: product.basePrice,
      priceCurrency: "BDT",
      availability:
        product.variants[0]?.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    ...(product.totalReviews > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.totalReviews,
      },
    }),
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500">
          <span>Home</span>
          <span className="mx-2">/</span>
          <span>{(product.categoryId as any)?.name}</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium line-clamp-1">
            {product.name}
          </span>
        </nav>

        {/* Product main section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <ProductImages images={product.images} name={product.name} />
          <ProductInfo product={product} />
        </div>

        {/* Specs table */}
        {product.variants[0]?.specs &&
          Object.keys(product.variants[0].specs).length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Specifications
              </h2>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {Array.from(Object.entries(product.variants[0].specs)).map(
                      ([key, value], i) => (
                        <tr
                          key={key}
                          className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
                        >
                          <td className="px-4 py-3 font-medium text-gray-600 w-1/3 capitalize">
                            {key.replace(/([A-Z])/g, " $1")}
                          </td>
                          <td className="px-4 py-3 text-gray-900">{value}</td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Related Products
            </h2>
            <ProductGrid products={relatedProducts} />
          </div>
        )}
      </div>
    </>
  );
}
