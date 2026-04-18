import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/user.model";
import { Vendor } from "@/lib/db/models/vendor.model";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { vendorId } = await req.json();

  await connectDB();

  const vendor = await Vendor.findById(vendorId);
  if (!vendor)
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

  vendor.status = "approved";
  await vendor.save();

  await User.findByIdAndUpdate(vendor.userId, {
    role: "vendor",
    vendorId: vendor._id,
  });

  return NextResponse.json({ sucess: true });
}
