// src/app/api/search/suggestions/route.ts
import { connectDB } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/product.model";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: NextRequest) {
  // 30 requests per minute per IP
  const ip = getClientIp(req.headers);
  const rl = rateLimit({ key: `search:${ip}`, limit: 30, windowMs: 60_000 });

  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Limit": "30",
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  const query = req.nextUrl.searchParams.get("q")?.trim();

  if (!query || query.length < 2 || query.length > 100) {
    return NextResponse.json({ suggestions: [] });
  }

  await connectDB();

  const products = await Product.find({
    status: "published",
    $text: { $search: query },
  })
    .select("name brand slug images basePrice")
    .limit(6)
    .lean();

  const results =
    products.length > 0
      ? products
      : await Product.find({
          status: "published",
          $or: [
            { name: { $regex: escapeRegex(query), $options: "i" } },
            { brand: { $regex: escapeRegex(query), $options: "i" } },
          ],
        })
          .select("name brand slug images basePrice")
          .limit(6)
          .lean();

  const suggestions = results.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    brand: p.brand,
    slug: p.slug,
    image: p.images[0] ?? null,
    basePrice: p.basePrice,
  }));

  return NextResponse.json({ suggestions });
}
