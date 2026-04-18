"use client";

import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Eye, EyeOff, Archive } from "lucide-react";
import {
  deleteProductAction,
  toggleProductStatusAction,
} from "@/lib/actions/vendor-product.actions";
import { ProductStatus } from "@/types";
import { useState, useRef, useEffect } from "react";

export default function ProductActionsMenu({
  productId,
  currentStatus,
}: {
  productId: string;
  currentStatus: ProductStatus;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { execute: deleteExec, isPending: deletePending } = useAction(
    deleteProductAction,
    {
      onSuccess: () => toast.success("Product archived"),
      onError: ({ error }) => toast.error(error.serverError ?? "Failed"),
    },
  );

  const { execute: toggleExec, isPending: togglePending } = useAction(
    toggleProductStatusAction,
    {
      onSuccess: () => toast.success("Status updated"),
      onError: ({ error }) => toast.error(error.serverError ?? "Failed"),
    },
  );

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <MoreHorizontal className="w-4 h-4 text-gray-500" />
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-10 bg-white border rounded-xl shadow-lg min-w-40 py-1 text-sm">
          <button
            onClick={() => {
              router.push(`/vendor/products/${productId}/edit`);
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-gray-700"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>

          {currentStatus !== "published" && (
            <button
              onClick={() => {
                toggleExec({ productId, status: "published" });
                setOpen(false);
              }}
              disabled={togglePending}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-green-600 disabled:opacity-50"
            >
              <Eye className="w-3.5 h-3.5" />
              Publish
            </button>
          )}

          {currentStatus === "published" && (
            <button
              onClick={() => {
                toggleExec({ productId, status: "draft" });
                setOpen(false);
              }}
              disabled={togglePending}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-yellow-600 disabled:opacity-50"
            >
              <EyeOff className="w-3.5 h-3.5" />
              Unpublish
            </button>
          )}

          {currentStatus !== "archived" && (
            <button
              onClick={() => {
                deleteExec({ productId });
                setOpen(false);
              }}
              disabled={deletePending}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-red-500 disabled:opacity-50"
            >
              <Archive className="w-3.5 h-3.5" />
              Archive
            </button>
          )}
        </div>
      )}
    </div>
  );
}
