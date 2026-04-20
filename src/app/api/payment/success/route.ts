// src/app/api/payment/success/route.ts
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/order.model";
import { Product } from "@/lib/db/models/product.model";
import { User } from "@/lib/db/models/user.model";
import { Vendor } from "@/lib/db/models/vendor.model";
import {
  sendOrderConfirmationEmail,
  sendVendorOrderNotificationEmail,
} from "@/lib/email/send";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

function groupItemsByVendor<T extends { vendorId: unknown }>(
  items: T[],
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = String(item.vendorId);
    const bucket = map.get(key) ?? [];
    bucket.push(item);
    map.set(key, bucket);
  }
  return map;
}

export async function POST(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  try {
    const formData = await req.formData();
    const tranId = formData.get("mer_txnid") as string;
    const pgTxnId = formData.get("pg_txnid") as string;
    const statusCode = formData.get("status_code") as string;
    const payStatus = formData.get("pay_status") as string;

    if (statusCode !== "2" || payStatus !== "Successful") {
      return NextResponse.redirect(`${appUrl}/payment/result?status=failed`);
    }

    const isLive = process.env.AAMARPAY_IS_LIVE === "true";
    const verifyUrl = isLive
      ? "https://secure.aamarpay.com/api/v1/trxcheck/request.php"
      : "https://sandbox.aamarpay.com/api/v1/trxcheck/request.php";

    const { data: verification } = await axios.get(verifyUrl, {
      params: {
        request_id: tranId,
        store_id: process.env.AAMARPAY_STORE_ID!,
        signature_key: process.env.AAMARPAY_SIGNATURE_KEY!,
        type: "json",
      },
    });

    if (verification?.status_code !== "2") {
      return NextResponse.redirect(`${appUrl}/payment/result?status=failed`);
    }

    await connectDB();

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: tranId, paymentStatus: "unpaid" },
      {
        $set: {
          paymentStatus: "paid",
          status: "processing",
          transactionId: pgTxnId,
          paidAt: new Date(),
        },
      },
      { new: true },
    );

    if (!updatedOrder) {
      const existingOrder = await Order.findById(tranId).select("_id").lean();
      if (existingOrder) {
        return NextResponse.redirect(
          `${appUrl}/payment/result?status=success&orderId=${existingOrder._id}`,
        );
      }
      return NextResponse.redirect(`${appUrl}/payment/result?status=failed`);
    }

    for (const item of updatedOrder.items) {
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

    // Send transactional emails — fire and forget
    const buyer = await User.findById(updatedOrder.userId)
      .select("name email")
      .lean();

    if (buyer) {
      void sendOrderConfirmationEmail({
        to: buyer.email,
        buyerName: buyer.name,
        orderId: updatedOrder._id.toString(),
        items: updatedOrder.items.map((i) => ({
          name: i.name,
          variantLabel: i.variantLabel,
          quantity: i.quantity,
          price: i.price,
          subtotal: i.subtotal,
          image: i.image,
        })),
        shippingAddress: updatedOrder.shippingAddress,
        subtotal: updatedOrder.subtotal,
        shippingFee: updatedOrder.shippingFee,
        discount: updatedOrder.discount,
        total: updatedOrder.total,
        paymentMethod: updatedOrder.paymentMethod,
      });

      const grouped = groupItemsByVendor(updatedOrder.items);
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
          orderId: updatedOrder._id.toString(),
          items: vendorItems.map((i) => ({
            name: i.name,
            variantLabel: i.variantLabel,
            sku: i.sku,
            quantity: i.quantity,
            price: i.price,
            subtotal: i.subtotal,
          })),
          shippingAddress: updatedOrder.shippingAddress,
          total: vendorRevenue,
          paymentMethod: updatedOrder.paymentMethod,
          paymentStatus: "paid",
        });
      }
    }

    return NextResponse.redirect(
      `${appUrl}/payment/result?status=success&orderId=${updatedOrder._id}`,
    );
  } catch (error) {
    console.error("aamarpay success error:", error);
    return NextResponse.redirect(`${appUrl}/payment/result?status=failed`);
  }
}
