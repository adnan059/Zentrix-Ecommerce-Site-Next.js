import { connectDB } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/product.model";
import { NextRequest, NextResponse } from "next/server";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: NextRequest) {
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
