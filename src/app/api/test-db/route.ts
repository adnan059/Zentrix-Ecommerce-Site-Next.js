import { connectDB } from "@/lib/db/connect";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ connected: true });
  } catch (error) {
    return NextResponse.json(
      { connected: false, error: String(error) },
      { status: 500 },
    );
  }
}
