import { PlainWishlistProduct } from "@/types";
import { connectDB } from "../db/connect";
import { Wishlist } from "../db/models/wishlist.model";
import { Product } from "../db/models/product.model";

export const getWishList = async (
  userId: string,
): Promise<PlainWishlistProduct[]> => {
  await connectDB();
  const wishlist = await Wishlist.findOne({ userId })
    .populate({
      path: "productIds",
      model: Product,
      // ✅ "status" not "isActive" — "isActive" does not exist on ProductSchema
      select: "_id name slug images variants status",
      match: { status: "published" },
    })
    .lean();

  return JSON.parse(
    JSON.stringify(wishlist?.productIds ?? []),
  ) as PlainWishlistProduct[];
};

export const getWishlistIds = async (userId: string): Promise<string[]> => {
  await connectDB();
  const wishlist = await Wishlist.findOne({ userId })
    .select("productIds")
    .lean();

  return (wishlist?.productIds ?? []).map((id) => id.toString());
};
