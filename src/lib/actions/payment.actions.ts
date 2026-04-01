"use server";
import { z } from "zod";
import { actionClient } from "../safe-action";
import { connectDB } from "../db/connect";
import { Product } from "../db/models/product.model";

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

const initiatePaymentSchema = z.object({
  userId: z.string(),
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

export const initiateSSLPayment = actionClient
  .inputSchema(initiatePaymentSchema)
  .action(async ({ parsedInput }) => {
    await connectDB();

    // Stock check before creating the pending order
    for (const item of parsedInput.items) {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`Product not found: ${item.name}`);
      const variant = product.variants.id(item.variantId);
      if (!variant || variant.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for "${item.name} — ${item.variantLabel}"`,
        );
      }
    }
  });
