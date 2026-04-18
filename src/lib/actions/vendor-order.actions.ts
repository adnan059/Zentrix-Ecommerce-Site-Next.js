"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { vendorActionClient } from "../safe-action";
import { connectDB } from "../db/connect";
import { Order } from "../db/models/order.model";
import { OrderStatus } from "@/types";

const fulfillmentSchema = z.object({
  orderId: z.string().min(1),
  itemId: z.string().min(1),
  status: z.enum(["processing", "shipped", "delivered", "cancelled"]),
  trackingNumber: z.string().max(100).optional(),
});

export const updateOrderItemStatusAction = vendorActionClient
  .inputSchema(fulfillmentSchema)
  .action(async ({ parsedInput, ctx }) => {
    await connectDB();

    const order = await Order.findOne({
      _id: parsedInput.orderId,
      "items.vendorId": ctx.vendorId,
      paymentStatus: "paid",
    });

    if (!order) throw new Error("Order not found");

    const item = order.items.find(
      (i) => i._id.toString() === parsedInput.itemId,
    );
    if (!item) throw new Error("Order item not found");
    if (item.vendorId.toString() !== ctx.vendorId)
      throw new Error("Access denied");

    item.status = parsedInput.status as OrderStatus;
    if (parsedInput.trackingNumber) {
      item.trackingNumber = parsedInput.trackingNumber;
    }

    // Update the overall order status to the "worst" item status
    const allStatuses = order.items.map((i) => i.status);
    const statusPriority: OrderStatus[] = [
      "cancelled",
      "pending",
      "processing",
      "shipped",
      "delivered",
    ];
    const dominantStatus = statusPriority.find((s) => allStatuses.includes(s))!;
    order.status = dominantStatus;

    await order.save();

    revalidatePath(`/vendor/orders/${parsedInput.orderId}`);
    revalidatePath("/vendor/orders");
    return { success: true };
  });
