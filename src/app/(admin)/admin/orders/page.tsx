// src/app/(admin)/admin/orders/page.tsx
import { getAdminOrders } from "@/lib/data/admin";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import Pagination from "@/components/shared/pagination";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, ShoppingBag } from "lucide-react";

export const metadata: Metadata = {
  title: "Orders — Admin | Zentrix",
};

const paymentStyles: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  unpaid: "bg-yellow-100 text-yellow-700",
  refunded: "bg-gray-100 text-gray-600",
};

const orderStatusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    paymentStatus?: string;
    search?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const { page, paymentStatus, search } = await searchParams;
  const currentPage = Number(page ?? 1);

  const { orders, totalPages, totalCount } = await getAdminOrders({
    page: currentPage,
    paymentStatus,
    search,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">
          {totalCount} order{totalCount !== 1 ? "s" : ""} total
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4">
        <form className="flex flex-wrap gap-3">
          <input
            name="search"
            type="text"
            defaultValue={search}
            placeholder="Search customer, email, or transaction ID…"
            className="flex-1 min-w-48 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <select
            name="paymentStatus"
            defaultValue={paymentStatus ?? "all"}
            className="border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All payments</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="refunded">Refunded</option>
          </select>
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            Filter
          </button>
          <Link
            href="/admin/orders"
            className="text-sm text-gray-500 hover:text-gray-700 self-center"
          >
            Reset
          </Link>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <ShoppingBag className="w-10 h-10 mb-3" />
            <p className="text-sm">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-500 text-left">
                  <th className="px-4 py-3 font-medium">Order ID</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      {typeof order.userId === "object" ? (
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-36">
                            {order.userId.name}
                          </p>
                          <p className="text-xs text-gray-400 truncate max-w-36">
                            {order.userId.email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs">
                          {String(order.userId)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-center">
                      {order.itemCount}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${paymentStyles[order.paymentStatus] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${orderStatusStyles[order.status] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-600 text-xs">
                      {order.paymentMethod}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 font-medium whitespace-nowrap"
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
