// aamarpay sends a post with form data to success_url after payment

import { connectDB } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/order.model";
import { Product } from "@/lib/db/models/product.model";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const tranId = formData.get("mer_txnid") as string;
    const pgTxnId = formData.get("pg_txnid") as string;
    const statusCode = formData.get("status_code") as string;
    const payStatus = formData.get("pay_status") as string;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

    if (statusCode !== "2" || payStatus !== "Successful") {
      return NextResponse.redirect(`${appUrl}/cart?payment=failed`);
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
      return NextResponse.redirect(`${appUrl}/cart?payment=failed`);
    }

    await connectDB();

    const order = await Order.findById(tranId);

    if (!order) {
      return NextResponse.redirect(`${appUrl}/cart?payment=failed`);
    }

    if (order.paymentStatus === "paid") {
      return NextResponse.redirect(
        `${appUrl}/orders/${order._id}?payment=success`,
      );
    }

    order.paymentStatus = "paid";
    order.status = "processing";
    order.transactionId = pgTxnId;
    order.paidAt = new Date();
    await order.save();

    // decrement of stock;
    for (const item of order.items) {
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

    return NextResponse.redirect(
      `${appUrl}/orders/${order._id}?payment=success`,
    );
  } catch (error) {
    console.error("aamarpay success error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL!}/cart?payment=failed`,
    );
  }
}
