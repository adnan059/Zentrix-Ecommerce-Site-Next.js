import { connectDB } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const tranId = formData.get("mer_txnid") as string;
    await connectDB();
    await Order.findByIdAndUpdate(tranId, { status: "cancelled" });
  } catch (error) {
    console.error("AAMARPAY_CANCEL_ERROR: ", error);
  }
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL!}/cart?payment=cancelled`,
  );
}
