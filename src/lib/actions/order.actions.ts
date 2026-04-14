"use server";

import { z } from "zod";

import { authActionClient } from "../safe-action";
import { connectDB } from "../db/connect";
import { Product } from "../db/models/product.model";
import { Order } from "../db/models/order.model";

const orderItemSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  vendorId: z.string(),
  name: z.string(),
  variantLabel: z.string(),
  sku: z.string(),
  image: z.string(),
  price: z.number(),
  quantity: z.number().min(1),
  subtotal: z.number(),
});

const createOrderSchema = z.object({
  userEmail: z.string().email(),
  items: z.array(orderItemSchema).min(1),
  shippingAddress: z.object({
    fullName: z.string(),
    phone: z.string(),
    addressLine1: z.string(),
    addressLine2: z.string().optional(),
    city: z.string(),
    district: z.string(),
    postalCode: z.string().optional(),
  }),
  subtotal: z.number(),
  shippingFee: z.number(),
  discount: z.number(),
  total: z.number(),
  paymentMethod: z.enum(["aamarpay", "cod"]),
  notes: z.string().optional(),
});

/* ───────────────── creating a cod order ───────────────── */

export const createCodOrder = authActionClient
  .inputSchema(createOrderSchema)
  .action(async ({ parsedInput, ctx }) => {
    await connectDB();

    for (const item of parsedInput.items) {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`Product not found: ${item.name}`);
      const variant = product.variants.id(item.variantId);
      if (!variant) throw new Error(`Variant not found for: ${item.name}`);
      if (variant.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for "${item.name} — ${item.variantLabel}". Available: ${variant.stock}`,
        );
      }
    }

    const order = await Order.create({
      userId: ctx.userId,
      items: parsedInput.items,
      shippingAddress: parsedInput.shippingAddress,
      subtotal: parsedInput.subtotal,
      shippingFee: parsedInput.shippingFee,
      discount: parsedInput.discount,
      total: parsedInput.total,
      status: "pending",
      paymentStatus: "unpaid",
      paymentMethod: "cod",
      notes: parsedInput.notes,
    });

    for (const item of parsedInput.items) {
      await Product.updateOne(
        { _id: item.productId, "variants._id": item.variantId },
        {
          $inc: {
            "variants.$.stock": -item.quantity,
            totalSales: item.quantity,
          },
        },
      );
    }

    return { success: true, orderId: order._id.toString() };
  });
