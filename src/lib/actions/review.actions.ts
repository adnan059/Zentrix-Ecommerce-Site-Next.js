"use server";

import { revalidatePath } from "next/cache";
import { getOrderIdForReview, hasUserPurchasedProduct } from "../data/orders";
import { connectDB } from "../db/connect";
import { Product } from "../db/models/product.model";
import { Review } from "../db/models/review.model";
import { authActionClient } from "../safe-action";
import { reviewSchema } from "../validations/review.schema";

export const submitReviewAction = authActionClient
  .inputSchema(reviewSchema)
  .action(async ({ parsedInput, ctx }) => {
    await connectDB();

    const purchased = await hasUserPurchasedProduct(
      ctx.userId,
      parsedInput.productId,
    );

    if (!purchased) {
      throw new Error("You can only review products you have purchased.");
    }

    const orderId = await getOrderIdForReview(
      ctx.userId,
      parsedInput.productId,
    );

    if (!orderId) {
      throw new Error("No eligible order found.");
    }

    await Review.findOneAndUpdate(
      { userId: ctx.userId, productId: parsedInput.productId },
      {
        userId: ctx.userId,
        productId: parsedInput.productId,
        orderId,
        rating: parsedInput.rating,
        title: parsedInput.title,
        body: parsedInput.body,
        isVerifiedPurchase: true,
        isApproved: false,
      },
      { upsert: true, new: true },
    );

    const stats = await Review.aggregate([
      {
        $match: {
          productId: { $eq: parsedInput.productId },
          isApproved: true,
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(parsedInput.productId, {
        rating: Math.round(stats[0].avgRating * 10) / 10,
        totalReviews: stats[0].count,
      });
    }

    revalidatePath(`/products/${parsedInput.productId}`);

    return { success: true };
  });

export const deleteReviewAction = authActionClient
  .inputSchema(reviewSchema.pick({ productId: true }))
  .action(async ({ parsedInput, ctx }) => {
    await connectDB();
    await Review.findOneAndDelete({
      userId: ctx.userId,
      productId: parsedInput.productId,
    });
    revalidatePath(`/products/${parsedInput.productId}`);
    return { success: true };
  });
