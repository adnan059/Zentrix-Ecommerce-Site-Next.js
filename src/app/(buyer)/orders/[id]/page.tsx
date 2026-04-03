import { auth } from "@/auth";
import { getOrderById } from "@/lib/data/orders";
import { formatCurrency } from "@/lib/utils/format";
import { OrderStatus, PaymentStatus } from "@/types";
import { CheckCircle2, Clock, Package, Truck, XCircle } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import React from "react";

export const metadata: Metadata = {
  title: "Order Details - Zentrix",
};

const orderStatusConfig: Record<
  OrderStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700",
    icon: <Clock className="w-4 h-4" />,
  },
  processing: {
    label: "Processing",
    color: "bg-blue-100 text-blue-700",
    icon: <Package className="w-4 h-4" />,
  },
  shipped: {
    label: "Shipped",
    color: "bg-purple-100 text-purple-700",
    icon: <Truck className="w-4 h-4" />,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-700",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700",
    icon: <XCircle className="w-4 h-4" />,
  },
};

const paymentStatusConfig: Record<
  PaymentStatus,
  { label: string; color: string }
> = {
  unpaid: { label: "Unpaid", color: "bg-red-100 text-red-700" },
  paid: { label: "Paid", color: "bg-green-100 text-green-700" },
  refunded: { label: "Refunded", color: "bg-gray-100 text-gray-700" },
};

interface IOrderDetailsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string }>;
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: IOrderDetailsPageProps) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const { payment } = await searchParams;

  const order = await getOrderById(id);

  if (!order) notFound();

  // Security: buyers can only see their own orders
  if (
    order.userId.toString() !== session.user.id &&
    session.user.role !== "admin"
  ) {
    redirect("/");
  }

  const orderStatus = orderStatusConfig[order.status];
  const paymentStatus = paymentStatusConfig[order.paymentStatus];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Payment banners */}
      {payment === "success" && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
          <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
          <div>
            <p className="font-semibold text-green-800">Payment Successful!</p>
            <p className="text-sm text-green-600">
              Your order has been confirmed and is being processed.
            </p>
          </div>
        </div>
      )}

      {payment === "failed" && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <XCircle className="w-6 h-6 text-red-600 shrink-0" />
          <div>
            <p className="font-semibold text-red-800">Payment Failed</p>
            <p className="text-sm text-red-600">
              Your payment could not be processed. Please try again.
            </p>
          </div>
        </div>
      )}

      {/* Order header */}
      <div className="border rounded-xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Order #{order._id.toString().slice(-8).toUpperCase()}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-BD", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${orderStatus.color}`}
            >
              {orderStatus.icon}
              {orderStatus.label}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${paymentStatus.color}`}
            >
              {paymentStatus.label}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 font-medium mb-1">Payment Method</p>
            <p className="text-gray-900 capitalize">
              {order.paymentMethod === "aamarpay"
                ? "Online Payment (Aamarpay)"
                : "Cash on Delivery"}
            </p>
          </div>
          {order.paidAt && (
            <div>
              <p className="text-gray-500 font-medium mb-1">Paid At</p>
              <p className="text-gray-900">
                {new Date(order.paidAt).toLocaleString("en-BD")}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-semibold text-gray-900 text-lg">Items Ordered</h2>
          <div className="border rounded-xl divide-y overflow-hidden">
            {order.items.map((item) => {
              const itemStatus = orderStatusConfig[item.status];
              return (
                <div key={item._id.toString()} className="flex gap-4 p-4">
                  <div className="relative w-16 h-16 rounded-lg border bg-gray-50 shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-1"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-500">{item.variantLabel}</p>
                    <p className="text-xs text-gray-400">SKU: {item.sku}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${itemStatus.color}`}
                      >
                        {itemStatus.icon}
                        {itemStatus.label}
                      </span>
                    </div>
                    {item.trackingNumber && (
                      <p className="text-xs text-blue-600 mt-1">
                        Tracking: {item.trackingNumber}
                      </p>
                    )}
                  </div>
                  <p className="text-sm font-bold text-gray-900 shrink-0">
                    {formatCurrency(item.subtotal)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Summary */}
          <div className="border rounded-xl p-5 space-y-3">
            <h2 className="font-semibold text-gray-900">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{formatCurrency(order.shippingFee)}</span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="border rounded-xl p-5 space-y-2">
            <h2 className="font-semibold text-gray-900">Shipping Address</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">
                {order.shippingAddress.fullName}
              </p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && (
                <p>{order.shippingAddress.addressLine2}</p>
              )}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.district}
                {order.shippingAddress.postalCode &&
                  ` - ${order.shippingAddress.postalCode}`}
              </p>
              <p>Bangladesh</p>
            </div>
          </div>

          {order.notes && (
            <div className="border rounded-xl p-5 space-y-2">
              <h2 className="font-semibold text-gray-900">Order Notes</h2>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/orders">
          <button className="border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            All Orders
          </button>
        </Link>
        <Link href="/products">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Continue Shopping
          </button>
        </Link>
      </div>
    </div>
  );
}
