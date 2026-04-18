"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { updateOrderItemStatusAction } from "@/lib/actions/vendor-order.actions";
import { VendorOrderItem, OrderStatus } from "@/types";

const statusOptions: { value: OrderStatus; label: string; color: string }[] = [
  { value: "processing", label: "Processing", color: "text-blue-600" },
  { value: "shipped", label: "Shipped", color: "text-purple-600" },
  { value: "delivered", label: "Delivered", color: "text-green-600" },
  { value: "cancelled", label: "Cancelled", color: "text-red-500" },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrderItemFulfillment({
  orderId,
  item,
}: {
  orderId: string;
  item: VendorOrderItem;
}) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(
    item.status as OrderStatus,
  );
  const [trackingNumber, setTrackingNumber] = useState(
    item.trackingNumber ?? "",
  );

  const { execute, isPending } = useAction(updateOrderItemStatusAction, {
    onSuccess: () => toast.success("Order item updated"),
    onError: ({ error }) =>
      toast.error(error.serverError ?? "Failed to update"),
  });

  const handleUpdate = () => {
    execute({
      orderId,
      itemId: item._id,
      status: selectedStatus,
      trackingNumber: trackingNumber || undefined,
    });
  };

  const hasChanged =
    selectedStatus !== item.status ||
    trackingNumber !== (item.trackingNumber ?? "");

  if (item.status === "delivered" || item.status === "cancelled") {
    return (
      <div className="mt-3 flex items-center gap-2">
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[item.status]}`}
        >
          {item.status}
        </span>
        {item.trackingNumber && (
          <span className="text-xs text-gray-500">
            Tracking: {item.trackingNumber}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[item.status]}`}
      >
        {item.status}
      </span>

      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
        className="border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {(selectedStatus === "shipped" || item.trackingNumber) && (
        <input
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          className="border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
          placeholder="Tracking number"
        />
      )}

      {hasChanged && (
        <button
          onClick={handleUpdate}
          disabled={isPending}
          className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Update"}
        </button>
      )}
    </div>
  );
}
