// src/app/(admin)/admin/orders/[id]/page.tsx
import { getAdminOrderById } from "@/lib/data/admin";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order #${id.slice(-8).toUpperCase()} — Admin | Zentrix` };
}

const paymentStyles: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  unpaid: "bg-yellow-100 text-yellow-700",
  refunded: "bg-gray-100 text-gray-600",
};

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = await getAdminOrderById(id);
  if (!order) notFound();

  const addr = order.shippingAddress;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" /> Back to orders
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Placed {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${paymentStyles[order.paymentStatus] ?? "bg-gray-100 text-gray-600"}`}
          >
            {order.paymentStatus}
          </span>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusStyles[order.status] ?? "bg-gray-100 text-gray-600"}`}
          >
            {order.status}
          </span>
        </div>
      </div>

      {/* Customer + Shipping */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Customer</h2>
          <p className="font-medium text-gray-900">{order.userId.name}</p>
          <p className="text-sm text-gray-500 mt-0.5">{order.userId.email}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Shipping Address
          </h2>
          <p className="text-sm font-medium text-gray-900">{addr.fullName}</p>
          <p className="text-sm text-gray-600">{addr.phone}</p>
          <p className="text-sm text-gray-600 mt-1">{addr.addressLine1}</p>
          {addr.addressLine2 && (
            <p className="text-sm text-gray-600">{addr.addressLine2}</p>
          )}
          <p className="text-sm text-gray-600">
            {addr.city}, {addr.district}
            {addr.postalCode ? ` — ${addr.postalCode}` : ""}
          </p>
        </div>
      </div>

      {/* Payment */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Payment Details
        </h2>
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-gray-500">Method:</span>{" "}
            <span className="capitalize font-medium text-gray-900">
              {order.paymentMethod}
            </span>
          </div>
          {order.transactionId && (
            <div>
              <span className="text-gray-500">Transaction ID:</span>{" "}
              <span className="font-mono text-xs text-gray-900">
                {order.transactionId}
              </span>
            </div>
          )}
          {order.paidAt && (
            <div>
              <span className="text-gray-500">Paid at:</span>{" "}
              <span className="text-gray-900">{formatDate(order.paidAt)}</span>
            </div>
          )}
          {order.notes && (
            <div>
              <span className="text-gray-500">Notes:</span>{" "}
              <span className="text-gray-900">{order.notes}</span>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="text-sm font-semibold text-gray-700">
            Order Items ({order.items.length})
          </h2>
        </div>
        <div className="divide-y">
          {order.items.map((item) => (
            <div key={item._id} className="flex gap-4 p-4">
              <div className="relative w-14 h-14 rounded-lg overflow-hidden border bg-gray-50 shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {item.variantLabel} · SKU: {item.sku}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusStyles[item.status] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {item.status}
                  </span>
                  {item.trackingNumber && (
                    <span className="text-xs text-gray-500 font-mono">
                      Tracking: {item.trackingNumber}
                    </span>
                  )}
                  {typeof item.vendorId === "object" && (
                    <Link
                      href={`/admin/vendors/${item.vendorId._id}`}
                      className="text-xs text-purple-600 hover:underline"
                    >
                      {item.vendorId.storeName}
                    </Link>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-gray-900">
                  {formatCurrency(item.subtotal)}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatCurrency(item.price)} × {item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>
        {/* Totals */}
        <div className="border-t px-5 py-4 space-y-1.5 bg-gray-50">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {order.shippingFee > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping Fee</span>
              <span>{formatCurrency(order.shippingFee)}</span>
            </div>
          )}
          {order.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
