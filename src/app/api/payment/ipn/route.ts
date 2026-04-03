import { connectDB } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/order.model";
import { Product } from "@/lib/db/models/product.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tranId = body?.mer_txnid as string;
    const pgTxnId = body?.pg_txnid as string;
    const statusCode = body?.status_code as string;
    if (statusCode !== "2") {
      return NextResponse.json({ message: "not successful" }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findById(tranId);

    if (!order) {
      return NextResponse.json({ message: "order not found" }, { status: 404 });
    }

    if (order.paymentStatus === "paid") {
      return NextResponse.json({ message: "already processed" });
    }

    order.paymentStatus = "paid";
    order.status = "processing";
    order.transactionId = pgTxnId;
    order.paidAt = new Date();
    await order.save();

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
    return NextResponse.json({ message: "ok" });
  } catch (error) {
    console.error("AAMARPAY_IPN_ERROR: ", error);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
