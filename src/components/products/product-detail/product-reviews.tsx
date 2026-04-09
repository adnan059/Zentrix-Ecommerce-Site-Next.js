import { Star, UserCircle } from "lucide-react";
import Image from "next/image";
import React from "react";
import ReviewForm from "./review-form";
import {
  getReviewsByProduct,
  getUserReviewForProduct,
} from "@/lib/data/reviews";
import { hasUserPurchasedProduct } from "@/lib/data/orders";
import { auth } from "@/auth";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

const ProductReviews = async ({ productId }: { productId: string }) => {
  const [session, reviews] = await Promise.all([
    auth(),
    getReviewsByProduct(productId),
  ]);

  let canReview = false;
  let existingReview = null;

  if (session?.user?.id) {
    const [purchased, myReview] = await Promise.all([
      hasUserPurchasedProduct(session.user.id, productId),
      getUserReviewForProduct(session.user.id, productId),
    ]);
    canReview = purchased;
    existingReview = myReview;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">
        Customer Reviews{" "}
        {reviews.length > 0 && (
          <span className="text-gray-400 font-normal text-base">
            ({reviews.length})
          </span>
        )}
      </h2>

      {/* Write / edit review */}
      {canReview && (
        <div className="border rounded-xl p-5 bg-gray-50 space-y-3">
          <h3 className="font-semibold text-gray-900">
            {existingReview ? "Edit Your Review" : "Write a Review"}
          </h3>
          <ReviewForm productId={productId} existingReview={existingReview} />
        </div>
      )}

      {!session && (
        <p className="text-sm text-gray-500">
          <a href="/login" className="text-blue-600 hover:underline">
            Sign in
          </a>{" "}
          and purchase this product to leave a review.
        </p>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No reviews yet. Be the first to review!
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="border rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 shrink-0">
                  {review.userId?.image ? (
                    <Image
                      src={review.userId.image}
                      alt={review.userId.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <UserCircle className="w-full h-full text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {review.userId?.name ?? "Anonymous"}
                  </p>
                  <div className="flex items-center gap-2">
                    <StarRating rating={review.rating} />
                    {review.isVerifiedPurchase && (
                      <span className="text-xs text-green-600 font-medium">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
                <span className="ml-auto text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString("en-BD")}
                </span>
              </div>
              <p className="font-medium text-gray-900">{review.title}</p>
              <p className="text-sm text-gray-600">{review.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
