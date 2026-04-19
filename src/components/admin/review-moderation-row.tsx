"use client";
// src/components/admin/review-moderation-row.tsx

import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import {
  approveReviewAction,
  deleteReviewAction,
} from "@/lib/actions/admin.actions";
import type { AdminReviewRow } from "@/types/admin.types";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils/format";
import { CheckCircle, Star, Trash2 } from "lucide-react";

export default function ReviewModerationRow({
  review,
}: {
  review: AdminReviewRow;
}) {
  const { execute: approve, isPending: approvePending } = useAction(
    approveReviewAction,
    {
      onSuccess: () => toast.success("Review approved"),
      onError: ({ error }) =>
        toast.error(error.serverError ?? "Failed to approve"),
    },
  );

  const { execute: del, isPending: deletePending } = useAction(
    deleteReviewAction,
    {
      onSuccess: () => toast.success("Review deleted"),
      onError: ({ error }) =>
        toast.error(error.serverError ?? "Failed to delete"),
    },
  );

  const isPending = approvePending || deletePending;

  return (
    <div className="bg-white rounded-xl border p-5 space-y-3">
      {/* User + rating + badges */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border bg-gray-100 shrink-0">
            {review.userId.image ? (
              <Image
                src={review.userId.image}
                alt={review.userId.name}
                fill
                className="object-cover"
              />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-400">
                {review.userId.name[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {review.userId.name}
            </p>
            <p className="text-xs text-gray-400">
              {formatDate(review.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-3.5 h-3.5 ${s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
              />
            ))}
          </div>
          {review.isVerifiedPurchase && (
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
              Verified
            </span>
          )}
          {review.isApproved ? (
            <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">
              Approved
            </span>
          ) : (
            <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full font-medium">
              Pending
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div>
        <p className="text-sm font-semibold text-gray-800">{review.title}</p>
        <p className="text-sm text-gray-600 mt-1 line-clamp-3">{review.body}</p>
      </div>

      {/* Product link + action buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t">
        <Link
          href={`/products/${review.productId.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-purple-600 hover:underline min-w-0"
        >
          <div className="relative w-6 h-6 rounded border overflow-hidden bg-gray-50 shrink-0">
            {review.productId.images[0] && (
              <Image
                src={review.productId.images[0]}
                alt={review.productId.name}
                fill
                className="object-cover"
              />
            )}
          </div>
          <span className="truncate max-w-48">{review.productId.name}</span>
        </Link>

        <div className="flex gap-2 shrink-0">
          {!review.isApproved && (
            <button
              onClick={() => approve({ reviewId: review._id })}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {approvePending ? "Approving…" : "Approve"}
            </button>
          )}
          <button
            onClick={() => del({ reviewId: review._id })}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {deletePending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
