// src/app/(admin)/admin/reviews/page.tsx
import { getAdminReviews } from "@/lib/data/admin";
import ReviewModerationRow from "@/components/admin/review-moderation-row";
import Pagination from "@/components/shared/pagination";
import Link from "next/link";
import type { Metadata } from "next";
import { Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Reviews — Admin | Zentrix",
};

interface PageProps {
  searchParams: Promise<{ page?: string; approved?: string }>;
}

export default async function AdminReviewsPage({ searchParams }: PageProps) {
  const { page, approved } = await searchParams;
  const currentPage = Number(page ?? 1);

  const isApproved =
    approved === "true" ? true : approved === "false" ? false : undefined;

  const { reviews, totalPages, totalCount } = await getAdminReviews({
    page: currentPage,
    isApproved,
  });

  const tabs = [
    { label: "All", href: "/admin/reviews", active: approved === undefined },
    {
      label: "Pending",
      href: "/admin/reviews?approved=false",
      active: approved === "false",
    },
    {
      label: "Approved",
      href: "/admin/reviews?approved=true",
      active: approved === "true",
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Review Moderation</h1>
        <p className="text-gray-500 text-sm mt-1">
          {totalCount} review{totalCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b">
        {tabs.map(({ label, href, active }) => (
          <Link
            key={label}
            href={href}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              active
                ? "border-purple-600 text-purple-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Review list */}
      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Star className="w-10 h-10 mb-3" />
          <p className="text-sm font-medium">No reviews found</p>
          <p className="text-xs mt-1">
            {approved === "false"
              ? "All reviews have been moderated."
              : "No reviews match this filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewModerationRow key={review._id} review={review} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      )}
    </div>
  );
}
