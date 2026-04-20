"use server";
import { z } from "zod";
import https from "https";

import { authActionClient } from "../safe-action";
import { connectDB } from "../db/connect";
import { Product } from "../db/models/product.model";
import { Order } from "../db/models/order.model";
import axios from "axios";

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

export const initiateAamarpayPayment = authActionClient
  .inputSchema(initiatePaymentSchema)
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
      paymentMethod: "aamarpay",
      notes: parsedInput.notes,
      transactionId: "",
    });

    const tranId = order._id.toString();
    await Order.findByIdAndUpdate(order._id, { transactionId: tranId });

    const isLive = process.env.AAMARPAY_IS_LIVE === "true";
    const apiUrl = isLive
      ? "https://secure.aamarpay.com/jsonpost.php"
      : "https://sandbox.aamarpay.com/jsonpost.php";

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

    const payload = {
      store_id: process.env.AAMARPAY_STORE_ID!,
      signature_key: process.env.AAMARPAY_SIGNATURE_KEY!,
      tran_id: tranId,
      amount: parsedInput.total.toFixed(2),
      currency: "BDT",
      desc: `Zentrix order — ${parsedInput.items.length} item(s)`,
      cus_name: parsedInput.shippingAddress.fullName,
      cus_email: parsedInput.userEmail,
      cus_phone: parsedInput.shippingAddress.phone,
      cus_add1: parsedInput.shippingAddress.addressLine1,
      cus_add2: parsedInput.shippingAddress.addressLine2 ?? "",
      cus_city: parsedInput.shippingAddress.city,
      cus_state: parsedInput.shippingAddress.district,
      cus_postcode: parsedInput.shippingAddress.postalCode ?? "0000",
      cus_country: "Bangladesh",
      success_url: `${appUrl}/api/payment/success`,
      fail_url: `${appUrl}/api/payment/fail`,
      cancel_url: `${appUrl}/api/payment/cancel`,
      type: "json",
    };

    // SAFE FIX: rejectUnauthorized is disabled ONLY for sandbox (expired cert on
    // AamarPay's sandbox server is their problem, not ours). The httpsAgent is
    // scoped to this single axios call — it does NOT affect any other request,
    // global Node.js TLS settings, or the live payment flow.
    const axiosConfig = isLive
      ? { headers: { "Content-Type": "application/json" } }
      : {
          headers: { "Content-Type": "application/json" },
          httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        };

    const { data } = await axios.post(apiUrl, payload, axiosConfig);

    if (data?.result !== "true" || !data?.payment_url) {
      await Order.findByIdAndDelete(order._id);
      throw new Error(
        "Payment gateway rejected the request. Please try again.",
      );
    }

    return { paymentUrl: data.payment_url as string };
  });
