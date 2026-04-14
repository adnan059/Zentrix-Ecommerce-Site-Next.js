import { connectDB } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/order.model";
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

    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: tranId,
        paymentStatus: "unpaid",
      },
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
      return NextResponse.json({ message: "already processed or not found" });
    }

    return NextResponse.json({ message: "ok" });
  } catch (error) {
    console.error("AAMARPAY_IPN_ERROR: ", error);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
