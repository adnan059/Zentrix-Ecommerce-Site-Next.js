import { auth } from "@/auth";
import { getOrdersByUser } from "@/lib/data/orders";
import { formatCurrency } from "@/lib/utils/format";
import { ChevronRight, ShoppingBag } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My Orders - Zentrix",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const paymentColors: Record<string, string> = {
  unpaid: "bg-red-100 text-red-700",
  paid: "bg-green-100 text-green-700",
  refunded: "bg-gray-100 text-gray-700",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const orders = await getOrdersByUser(session.user.id);

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <ShoppingBag className="w-16 h-16 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-700">No orders yet</h2>
        <p className="text-gray-500">
          Your orders will appear here once you place one.
        </p>
        <Link
          href="/products"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
      <div className="space-y-3">
        {orders.map((order) => (
          <Link
            key={order._id.toString()}
            href={`/orders/${order._id}`}
            className="block border rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="font-semibold text-gray-900">
                  Order #{order._id.toString().slice(-8).toUpperCase()}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString("en-BD", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
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
                <div className="flex gap-2 flex-wrap justify-end">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[order.status]}`}
                  >
                    {order.status}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${paymentColors[order.paymentStatus]}`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
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
        ))}
      </div>
    </div>
  );
}
