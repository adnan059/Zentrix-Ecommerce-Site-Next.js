"use server";

import { z } from "zod";
import {} from "next/cache";
import { authActionClient } from "../safe-action";
import { connectDB } from "../db/connect";
import { Wishlist } from "../db/models/wishlist.model";
import { revalidatePath } from "next/cache";

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
      revalidatePath("/wishlist");
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
    return { added: !isInList };
  });
