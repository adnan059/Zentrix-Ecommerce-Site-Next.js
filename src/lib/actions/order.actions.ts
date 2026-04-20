"use server";
// src/lib/actions/order.actions.ts
import { z } from "zod";
import { authActionClient } from "../safe-action";
import { connectDB } from "../db/connect";
import { Product } from "../db/models/product.model";
import { Order } from "../db/models/order.model";
import { User } from "../db/models/user.model";
import { Vendor } from "../db/models/vendor.model";
import {
  sendOrderConfirmationEmail,
  sendVendorOrderNotificationEmail,
} from "@/lib/email/send";

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

/* ─── helpers ────────────────────────────────────────────────────────────── */

/** Group order items by vendorId so each vendor gets exactly one email. */
function groupItemsByVendor(
  items: z.infer<typeof createOrderSchema>["items"],
): Map<string, z.infer<typeof createOrderSchema>["items"]> {
  const map = new Map<string, z.infer<typeof createOrderSchema>["items"]>();
  for (const item of items) {
    const bucket = map.get(item.vendorId) ?? [];
    bucket.push(item);
    map.set(item.vendorId, bucket);
  }
  return map;
}

async function dispatchPostOrderEmails(
  orderId: string,
  buyerEmail: string,
  buyerName: string,
  parsedInput: z.infer<typeof createOrderSchema>,
  paymentStatus: "paid" | "unpaid",
): Promise<void> {
  // Buyer confirmation — fire and forget
  void sendOrderConfirmationEmail({
    to: buyerEmail,
    buyerName,
    orderId,
    items: parsedInput.items.map((i) => ({
      name: i.name,
      variantLabel: i.variantLabel,
      quantity: i.quantity,
      price: i.price,
      subtotal: i.subtotal,
      image: i.image,
    })),
    shippingAddress: parsedInput.shippingAddress,
    subtotal: parsedInput.subtotal,
    shippingFee: parsedInput.shippingFee,
    discount: parsedInput.discount,
    total: parsedInput.total,
    paymentMethod: parsedInput.paymentMethod,
  });

  // Vendor notifications — one email per vendor, fire and forget
  const grouped = groupItemsByVendor(parsedInput.items);

  for (const [vendorId, vendorItems] of grouped) {
    const vendor = await Vendor.findById(vendorId)
      .select("storeName email")
      .lean();
    if (!vendor) continue;

    const vendorRevenue = vendorItems.reduce((s, i) => s + i.subtotal, 0);

    void sendVendorOrderNotificationEmail({
      to: vendor.email,
      vendorName: vendor.storeName,
      storeName: vendor.storeName,
      orderId,
      items: vendorItems.map((i) => ({
        name: i.name,
        variantLabel: i.variantLabel,
        sku: i.sku,
        quantity: i.quantity,
        price: i.price,
        subtotal: i.subtotal,
      })),
      shippingAddress: parsedInput.shippingAddress,
      total: vendorRevenue,
      paymentMethod: parsedInput.paymentMethod,
      paymentStatus,
    });
  }
}

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

    const buyer = await User.findById(ctx.userId).select("name email").lean();
    if (buyer) {
      void dispatchPostOrderEmails(
        order._id.toString(),
        buyer.email,
        buyer.name,
        parsedInput,
        "unpaid",
      );
    }

    return { success: true, orderId: order._id.toString() };
  });
