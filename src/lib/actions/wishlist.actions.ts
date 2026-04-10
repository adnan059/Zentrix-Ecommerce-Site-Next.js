"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { authActionClient } from "../safe-action";
import { connectDB } from "../db/connect";
import { Wishlist } from "../db/models/wishlist.model";
import { Product } from "../db/models/product.model";

const productIdSchema = z.object({ productId: z.string().min(1) });

export const toggleWishlistAction = authActionClient
  .inputSchema(productIdSchema)
  .action(async ({ parsedInput, ctx }) => {
    await connectDB();
    const wishlist = await Wishlist.findOne({ userId: ctx.userId });

    if (!wishlist) {
      await Wishlist.create({
        userId: ctx.userId,
        productIds: [parsedInput.productId],
      });

      // Revalidate both pages
      revalidatePath("/wishlist");
      await revalidateProductPage(parsedInput.productId);
      return { added: true };
    }

    const isInList = wishlist.productIds
      .map((id) => id.toString())
      .includes(parsedInput.productId);

    if (isInList) {
      wishlist.productIds = wishlist.productIds.filter(
        (id) => id.toString() !== parsedInput.productId,
      );
    } else {
      wishlist.productIds.push(
        parsedInput.productId as unknown as import("mongoose").Types.ObjectId,
      );
    }

    await wishlist.save();
    revalidatePath("/wishlist");
    await revalidateProductPage(parsedInput.productId);
    return { added: !isInList };
  });

// Helper: look up the product slug and revalidate its page
async function revalidateProductPage(productId: string) {
  const product = await Product.findById(productId).select("slug").lean();
  if (product?.slug) {
    revalidatePath(`/products/${product.slug}`);
  }
}
