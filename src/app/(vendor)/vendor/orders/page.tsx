import { auth } from "@/auth";
import { getVendorByUserId, getVendorOrders } from "@/lib/data/vendor";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { ChevronRight, ShoppingBag } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Orders - Zentrix Vendor" };

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default async function VendorOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const vendor = await getVendorByUserId(session.user.id);
  if (!vendor) redirect("/");

  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const status = params.status ?? "all";

  const { orders, totalPages, currentPage, totalCount } = await getVendorOrders(
    vendor._id,
    page,
    10,
    status,
  );

  const statusOptions = [
    "all",
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {statusOptions.map((s) => (
          <Link
            key={s}
            href={`/vendor/orders?status=${s}`}
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

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const buyer =
              typeof order.userId === "object"
                ? order.userId
                : { name: "Customer", email: "" };
            // Determine the "dominant" status among this vendor's items
            const itemStatuses = order.items.map((i) => i.status);
            const dominantStatus = itemStatuses.includes("pending")
              ? "pending"
              : itemStatuses.includes("processing")
                ? "processing"
                : itemStatuses.includes("shipped")
                  ? "shipped"
                  : "delivered";

            return (
              <Link
                key={order._id}
                href={`/vendor/orders/${order._id}`}
                className="block bg-white rounded-xl border p-5 hover:shadow-sm hover:border-blue-200 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {buyer.name} · {formatDate(order.createdAt)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.items.length} item
                      {order.items.length > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="font-bold text-gray-900">
                      {formatCurrency(order.total)}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[dominantStatus]}`}
                    >
                      {dominantStatus}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors shrink-0 mt-1" />
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-gray-600 truncate">
                    {order.items
                      .map((i) => `${i.name} (${i.variantLabel})`)
                      .join(", ")}
                  </p>
                </div>
              </Link>
            );
          })}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-gray-500">
                {totalCount} orders · Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                {currentPage > 1 && (
                  <Link
                    href={`/vendor/orders?status=${status}&page=${currentPage - 1}`}
                    className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                )}
                {currentPage < totalPages && (
                  <Link
                    href={`/vendor/orders?status=${status}&page=${currentPage + 1}`}
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
