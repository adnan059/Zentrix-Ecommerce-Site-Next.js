import { auth } from "@/auth";
import { getMyReviews } from "@/lib/data/reviews";
import { MessageSquare, Star } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My Reviews - Zentrix",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-4 h-4 ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

export default async function ReviewsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const reviews = await getMyReviews(session.user.id);

  if (reviews.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <MessageSquare className="w-16 h-16 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-700">No reviews yet</h2>
        <p className="text-gray-500">
          Your reviews on purchased products will appear here.
        </p>
        <Link
          href="/orders"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Orders
        </Link>
      </div>
    );
  }
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="border rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-lg border bg-gray-50 shrink-0">
                <Image
                  src={review.productId.images[0]}
                  alt={review.productId.name}
                  fill
                  className="object-contain p-1"
                  sizes="48px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${review.productId.slug}`}
                  className="font-medium text-gray-900 hover:text-blue-600 truncate block"
                >
                  {review.productId.name}
                </Link>
                <div className="flex items-center gap-2 mt-0.5">
                  <StarRating rating={review.rating} />
                  <span className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString("en-BD")}
                  </span>
                </div>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${review.isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
              >
                {review.isApproved ? "Published" : "Pending approval"}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{review.title}</p>
              <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                {review.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
