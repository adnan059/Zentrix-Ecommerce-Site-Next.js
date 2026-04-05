import {
  PlainReview,
  PlainReviewWithProduct,
  PlainReviewWithUser,
} from "@/types";
import { connectDB } from "../db/connect";
import { Review } from "../db/models/review.model";

export const getReviewsByProduct = async (
  productId: string,
): Promise<PlainReviewWithUser[]> => {
  await connectDB();

  const reviews = await Review.find({ productId, isApproved: true })
    .sort({ createdAt: -1 })
    .populate({ path: "userId", select: "name image" })
    .lean();

  return JSON.parse(JSON.stringify(reviews));
};

export const getMyReviews = async (
  userId: string,
): Promise<PlainReviewWithProduct[]> => {
  await connectDB();
  const reviews = await Review.find({ userId })
    .sort({ createdAt: -1 })
    .populate({ path: "productId", select: "name slug images" })
    .lean();
  return JSON.parse(JSON.stringify(reviews));
};

export const getUserReviewForProduct = async (
  userId: string,
  productId: string,
): Promise<PlainReview | null> => {
  await connectDB();
  const review = await Review.findOne({ userId, productId }).lean();

  return review ? JSON.parse(JSON.stringify(review)) : null;
};
