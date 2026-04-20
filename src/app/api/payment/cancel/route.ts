// src/app/api/payment/cancel/route.ts
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/order.model";
import { NextRequest, NextResponse } from "next/server";

// 303 See Other forces the browser to follow the redirect with GET.
// Default 302 causes browsers to re-POST the result page → 405.
function redirect303(url: string) {
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const tranId = formData.get("mer_txnid") as string;
    await connectDB();
    await Order.findByIdAndUpdate(tranId, { status: "cancelled" });
  } catch (error) {
    console.error("AAMARPAY_CANCEL_ERROR: ", error);
  }
  return redirect303(
    `${process.env.NEXT_PUBLIC_APP_URL!}/payment/result?status=cancelled`,
  );
}
