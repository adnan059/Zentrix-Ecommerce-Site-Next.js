import { auth } from "@/auth";
import OrderItemFulfillment from "@/components/vendor/order-item-fulfillment";
import { getVendorByUserId, getVendorOrderById } from "@/lib/data/vendor";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { Metadata } from "next";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = { title: "Order Detail - Zentrix Vendor" };

export default async function VendorOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const vendor = await getVendorByUserId(session.user.id);
  if (!vendor) redirect("/");

  const { id } = await params;
  const order = await getVendorOrderById(id, vendor._id);
  if (!order) notFound();

  const buyer =
    typeof order.userId === "object"
      ? order.userId
      : { name: "Customer", email: "" };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Your revenue from this order</p>
          <p className="text-xl font-bold text-gray-900">
            {formatCurrency(order.total)}
          </p>
        </div>
      </div>

      {/* Customer & shipping */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Customer</h2>
          <p className="text-sm text-gray-700">{buyer.name}</p>
          <p className="text-sm text-gray-500">{buyer.email}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Shipping Address</h2>
          <p className="text-sm text-gray-700">
            {order.shippingAddress.fullName}
          </p>
          <p className="text-sm text-gray-500">
            {order.shippingAddress.addressLine1}
            {order.shippingAddress.addressLine2 &&
              `, ${order.shippingAddress.addressLine2}`}
          </p>
          <p className="text-sm text-gray-500">
            {order.shippingAddress.city}, {order.shippingAddress.district}
            {order.shippingAddress.postalCode &&
              ` ${order.shippingAddress.postalCode}`}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            📞 {order.shippingAddress.phone}
          </p>
        </div>
      </div>

      {/* Order items with fulfillment controls */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-4 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-900">Items to Fulfill</h2>
        </div>
        <div className="divide-y">
          {order.items.map((item) => (
            <div key={item._id} className="p-5">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    {item.variantLabel} · SKU: {item.sku}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    {formatCurrency(item.price)} × {item.quantity} ={" "}
                    <strong>{formatCurrency(item.subtotal)}</strong>
                  </p>
                </div>
              </div>
              {/* Fulfillment action */}
              <OrderItemFulfillment orderId={order._id} item={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
