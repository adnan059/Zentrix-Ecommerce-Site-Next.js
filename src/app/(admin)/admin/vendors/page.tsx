// src/app/(admin)/admin/vendors/page.tsx
import { getAdminVendors } from "@/lib/data/admin";
import { formatDate } from "@/lib/utils/format";
import Pagination from "@/components/shared/pagination";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, Store } from "lucide-react";

export const metadata: Metadata = {
  title: "Vendors — Admin | Zentrix",
};

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  suspended: "bg-red-100 text-red-600",
};

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}

export default async function AdminVendorsPage({ searchParams }: PageProps) {
  const { page, status, search } = await searchParams;
  const currentPage = Number(page ?? 1);

  const { vendors, totalPages, totalCount } = await getAdminVendors({
    page: currentPage,
    status,
    search,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
        <p className="text-gray-500 text-sm mt-1">
          {totalCount} vendor{totalCount !== 1 ? "s" : ""} total
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4">
        <form className="flex flex-wrap gap-3">
          <input
            name="search"
            type="text"
            defaultValue={search}
            placeholder="Search store name or email…"
            className="flex-1 min-w-48 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <select
            name="status"
            defaultValue={status ?? "all"}
            className="border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="suspended">Suspended</option>
          </select>
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            Filter
          </button>
          <Link
            href="/admin/vendors"
            className="text-sm text-gray-500 hover:text-gray-700 self-center"
          >
            Reset
          </Link>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {vendors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Store className="w-10 h-10 mb-3" />
            <p className="text-sm">No vendors found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-500 text-left">
                  <th className="px-4 py-3 font-medium">Store</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Commission</th>
                  <th className="px-4 py-3 font-medium">Sales</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vendors.map((vendor) => (
                  <tr
                    key={vendor._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {vendor.storeName}
                      </p>
                      <p className="text-xs text-gray-400">
                        @{vendor.storeSlug}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{vendor.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusStyles[vendor.status] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {vendor.commissionRate}%
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {vendor.totalSales}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(vendor.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/vendors/${vendor._id}`}
                        className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 font-medium"
                      >
                        View <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
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
