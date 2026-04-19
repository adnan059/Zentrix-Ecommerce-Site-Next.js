// src/app/(admin)/admin/products/page.tsx
import { getAdminProducts } from "@/lib/data/admin";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import ProductStatusBadge from "@/components/vendor/product-status-badge";
import ProductModerationMenu from "@/components/admin/product-moderation-menu";
import Pagination from "@/components/shared/pagination";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Package, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Products — Admin | Zentrix",
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    search?: string;
    vendorId?: string;
  }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const { page, status, search, vendorId } = await searchParams;
  const currentPage = Number(page ?? 1);

  const { products, totalPages, totalCount } = await getAdminProducts({
    page: currentPage,
    status,
    search,
    vendorId,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-gray-500 text-sm mt-1">
          {totalCount} product{totalCount !== 1 ? "s" : ""} total
          {vendorId && " — filtered by vendor"}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4">
        <form className="flex flex-wrap gap-3">
          {vendorId && <input type="hidden" name="vendorId" value={vendorId} />}
          <input
            name="search"
            type="text"
            defaultValue={search}
            placeholder="Search products…"
            className="flex-1 min-w-48 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <select
            name="status"
            defaultValue={status ?? "all"}
            className="border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            Filter
          </button>
          <Link
            href="/admin/products"
            className="text-sm text-gray-500 hover:text-gray-700 self-center"
          >
            Reset
          </Link>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Package className="w-10 h-10 mb-3" />
            <p className="text-sm">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-500 text-left">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Vendor</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Rating</th>
                  <th className="px-4 py-3 font-medium">Added</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden border bg-gray-50 shrink-0">
                          {product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-gray-300 absolute inset-0 m-auto" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-44">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {product.brand}
                          </p>
                          {product.isFeatured && (
                            <span className="inline-flex items-center gap-0.5 text-xs text-yellow-600">
                              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />{" "}
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {typeof product.vendorId === "object" ? (
                        <Link
                          href={`/admin/vendors/${product.vendorId._id}`}
                          className="text-purple-600 hover:underline"
                        >
                          {product.vendorId.storeName}
                        </Link>
                      ) : (
                        <span className="text-gray-500">
                          {product.vendorId}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {typeof product.categoryId === "object"
                        ? product.categoryId.name
                        : product.categoryId}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {formatCurrency(product.basePrice)}
                    </td>
                    <td className="px-4 py-3">
                      <ProductStatusBadge status={product.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {product.rating.toFixed(1)} ({product.totalReviews})
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(product.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <ProductModerationMenu
                        productId={product._id}
                        currentStatus={product.status}
                        isFeatured={product.isFeatured}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      )}
    </div>
  );
}
