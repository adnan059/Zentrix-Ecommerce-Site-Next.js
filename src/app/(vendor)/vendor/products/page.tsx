import { auth } from "@/auth";
import ProductActionsMenu from "@/components/vendor/product-actions-menu";
import ProductStatusBadge from "@/components/vendor/product-status-badge";
import { getVendorByUserId, getVendorProducts } from "@/lib/data/vendor";
import { formatCurrency } from "@/lib/utils/format";
import { Package, PlusCircle } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My Products - Zentrix Vendor",
};

const statusOptions = ["all", "published", "draft", "archived"];

export default async function VendorProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const vendor = await getVendorByUserId(session.user.id);
  if (!vendor) redirect("/");

  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const status = params.status ?? "all";
  const search = params.search ?? "";

  const { products, totalPages, currentPage, totalCount } =
    await getVendorProducts({
      vendorId: vendor._id,
      page,
      limit: 10,
      status,
      search,
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link
          href="/vendor/products/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {statusOptions.map((s) => (
          <Link
            key={s}
            href={`/vendor/products?status=${s}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              status === s
                ? "bg-blue-600 text-white"
                : "bg-white border text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {/* Products table */}
      {products.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No products found.</p>
          <Link
            href="/vendor/products/new"
            className="mt-4 inline-block text-blue-600 hover:underline text-sm"
          >
            Add your first product
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Product
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Category
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Base Price
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Variants
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((product) => {
                  const category =
                    typeof product.categoryId === "object"
                      ? (product.categoryId as { name: string }).name
                      : "—";
                  return (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {product.images[0] && (
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {product.brand}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{category}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {formatCurrency(product.basePrice)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {product.variants.length}
                      </td>
                      <td className="px-4 py-3">
                        <ProductStatusBadge status={product.status} />
                      </td>
                      <td className="px-4 py-3">
                        <ProductActionsMenu
                          productId={product._id}
                          currentStatus={product.status}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-gray-500">
                {totalCount} products · Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                {currentPage > 1 && (
                  <Link
                    href={`/vendor/products?status=${status}&page=${currentPage - 1}`}
                    className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                )}
                {currentPage < totalPages && (
                  <Link
                    href={`/vendor/products?status=${status}&page=${currentPage + 1}`}
                    className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
