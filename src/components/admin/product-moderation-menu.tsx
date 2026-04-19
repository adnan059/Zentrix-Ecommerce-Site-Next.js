"use client";
// src/components/admin/product-moderation-menu.tsx

import { useEffect, useRef, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import {
  adminToggleFeaturedAction,
  adminUpdateProductStatusAction,
} from "@/lib/actions/admin.actions";
import type { ProductStatus } from "@/types";
import {
  Archive,
  Eye,
  FileText,
  MoreHorizontal,
  Star,
  StarOff,
} from "lucide-react";

export default function ProductModerationMenu({
  productId,
  currentStatus,
  isFeatured,
}: {
  productId: string;
  currentStatus: ProductStatus;
  isFeatured: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { execute: updateStatus, isPending: statusPending } = useAction(
    adminUpdateProductStatusAction,
    {
      onSuccess: () => {
        toast.success("Status updated");
        setOpen(false);
      },
      onError: ({ error }) => toast.error(error.serverError ?? "Failed"),
    },
  );

  const { execute: toggleFeatured, isPending: featuredPending } = useAction(
    adminToggleFeaturedAction,
    {
      onSuccess: () => {
        toast.success(
          isFeatured ? "Removed from featured" : "Marked as featured",
        );
        setOpen(false);
      },
      onError: ({ error }) => toast.error(error.serverError ?? "Failed"),
    },
  );

  const isPending = statusPending || featuredPending;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={isPending}
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
      >
        <MoreHorizontal className="w-4 h-4 text-gray-500" />
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-20 bg-white border rounded-xl shadow-lg min-w-44 py-1 text-sm">
          {currentStatus !== "published" && (
            <button
              onClick={() => updateStatus({ productId, status: "published" })}
              disabled={isPending}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-green-600 disabled:opacity-50"
            >
              <Eye className="w-3.5 h-3.5" /> Publish
            </button>
          )}
          {currentStatus !== "draft" && (
            <button
              onClick={() => updateStatus({ productId, status: "draft" })}
              disabled={isPending}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-yellow-600 disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5" /> Set to Draft
            </button>
          )}
          {currentStatus !== "archived" && (
            <button
              onClick={() => updateStatus({ productId, status: "archived" })}
              disabled={isPending}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-red-500 disabled:opacity-50"
            >
              <Archive className="w-3.5 h-3.5" /> Archive
            </button>
          )}
          <div className="border-t my-1" />
          <button
            onClick={() =>
              toggleFeatured({ productId, isFeatured: !isFeatured })
            }
            disabled={isPending}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-purple-600 disabled:opacity-50"
          >
            {isFeatured ? (
              <>
                <StarOff className="w-3.5 h-3.5" /> Remove from Featured
              </>
            ) : (
              <>
                <Star className="w-3.5 h-3.5" /> Mark as Featured
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
