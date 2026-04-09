"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitReviewAction } from "@/lib/actions/review.actions";
import { cn } from "@/lib/utils";
import { ReviewInput, reviewSchema } from "@/lib/validations/review.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Star } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface IReviewFormProps {
  productId: string;
  existingReview?: {
    rating: number;
    title: string;
    body: string;
  } | null;
}

const ReviewForm = ({ productId, existingReview }: IReviewFormProps) => {
  const [hovered, setHovered] = useState(0);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      productId,
      rating: existingReview?.rating ?? 0,
      title: existingReview?.title ?? "",
      body: existingReview?.body ?? "",
    },
  });
  const rating = useWatch({ control, name: "rating" });

  const { execute, isPending } = useAction(submitReviewAction, {
    onSuccess: () => {
      toast.success(
        existingReview
          ? "Review updated! It will be published after approval."
          : "Review submitted! It will be published after approval.",
      );
    },
    onError: ({ error }) =>
      toast.error(error.serverError ?? "Failed to submit review"),
  });

  return (
    <form onSubmit={handleSubmit(execute)} className="space-y-4">
      <input type="hidden" {...register("productId")} />

      <div className="space-y-1">
        <Label>Rating</Label>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => field.onChange(s)}
                  className="p-0.5"
                >
                  <Star
                    className={cn(
                      "w-6 h-6 transition-colors",
                      s <= (hovered || field.value)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300",
                    )}
                  />
                </button>
              ))}
            </div>
          )}
        />
        {errors.rating && (
          <p className="text-xs text-red-500">Please select a rating</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="title">Review Title</Label>
        <Input
          id="title"
          placeholder="Summarize your experience"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-xs text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="body">Your Review</Label>
        <textarea
          id="body"
          rows={4}
          placeholder="Tell us what you think about this product..."
          {...register("body")}
          className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
        {errors.body && (
          <p className="text-xs text-red-500">{errors.body.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isPending || rating === 0}>
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : existingReview ? (
          "Update Review"
        ) : (
          "Submit Review"
        )}
      </Button>
    </form>
  );
};

export default ReviewForm;
