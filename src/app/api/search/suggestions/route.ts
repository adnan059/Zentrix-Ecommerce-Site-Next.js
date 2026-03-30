import { connectDB } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/product.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  await connectDB();

  const products = await Product.find({
    status: "published",
    $or: [
      { name: { $regex: query, $options: "i" } },
      { brand: { $regex: query, $options: "i" } },
      { tags: { $regex: query, $options: "i" } },
    ],
  })
    .select("name brand slug images basePrice")
    .limit(6)
    .lean();

  const suggestions = products.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    brand: p.brand,
    slug: p.slug,
    image: p.images[0] ?? null,
    basePrice: p.basePrice,
  }));

  return NextResponse.json({ suggestions });
}
