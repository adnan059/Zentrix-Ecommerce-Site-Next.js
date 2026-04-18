"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { updateOrderItemStatusAction } from "@/lib/actions/vendor-order.actions";
import { VendorOrderItem, OrderStatus } from "@/types";

// Narrower type that matches the fulfillmentSchema exactly —
// vendors cannot set status back to "pending", that's the system default.
type FulfillmentStatus = "processing" | "shipped" | "delivered" | "cancelled";

const statusOptions: { value: FulfillmentStatus; label: string }[] = [
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

// If item.status is "pending", default the select to "processing"
// since that's the first action a vendor takes.
function toFulfillmentStatus(status: OrderStatus): FulfillmentStatus {
  if (status === "pending") return "processing";
  return status as FulfillmentStatus;
}

export default function OrderItemFulfillment({
  orderId,
  item,
}: {
  orderId: string;
  item: VendorOrderItem;
}) {
  const [selectedStatus, setSelectedStatus] = useState<FulfillmentStatus>(
    toFulfillmentStatus(item.status as OrderStatus),
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
      status: selectedStatus, // ✅ FulfillmentStatus matches schema exactly
      trackingNumber: trackingNumber || undefined,
    });
  };

  const hasChanged =
    selectedStatus !== toFulfillmentStatus(item.status as OrderStatus) ||
    trackingNumber !== (item.trackingNumber ?? "");

  // Terminal states: no further action needed
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
      {/* Current status pill */}
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[item.status]}`}
      >
        {item.status}
      </span>

      {/* Status selector */}
      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value as FulfillmentStatus)}
        className="border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Tracking number input — shown when shipping or already has one */}
      {(selectedStatus === "shipped" || item.trackingNumber) && (
        <input
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          className="border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
          placeholder="Tracking number"
        />
      )}

      {/* Update button — only visible when something changed */}
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
