// src/app/api/upload/route.ts
import { auth } from "@/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  // Auth check first
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "vendor" && session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 20 signature requests per minute per authenticated user
  const rl = rateLimit({
    key: `upload:${session.user.id}`,
    limit: 20,
    windowMs: 60_000,
  });

  if (!rl.success) {
    return NextResponse.json(
      { error: "Upload rate limit exceeded. Please wait a moment." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        },
      },
    );
  }

  // Secondary IP-level limit to guard against token-sharing abuse
  const ip = getClientIp(req.headers);
  const ipRl = rateLimit({
    key: `upload-ip:${ip}`,
    limit: 40,
    windowMs: 60_000,
  });
  if (!ipRl.success) {
    return NextResponse.json(
      { error: "Too many upload requests from this network." },
      { status: 429 },
    );
  }

  const { publicId, folder } = await req.json();
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  const timestamp = Math.round(Date.now() / 1000);
  const folderName = folder ?? "zentrix/products";

  const paramsToSign = publicId
    ? `folder=${folderName}&public_id=${publicId}&timestamp=${timestamp}`
    : `folder=${folderName}&timestamp=${timestamp}`;

  const signature = crypto
    .createHash("sha1")
    .update(paramsToSign + apiSecret)
    .digest("hex");

  return NextResponse.json({
    signature,
    timestamp,
    cloudName,
    apiKey,
    folder: folderName,
    ...(publicId ? { publicId } : {}),
  });
}
