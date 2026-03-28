"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface IPaginationProps {
  currentPage: number;
  totalPages: number;
}

const Pagination = ({ currentPage, totalPages }: IPaginationProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) =>
      p === 1 ||
      p === totalPages ||
      (p >= currentPage - 1 && p <= currentPage + 1),
  );
  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => goToPage(currentPage - 1)}
      >
        Previous
      </Button>
      {pages.map((page, i) => {
        const prev = pages[i - 1];
        const showEllipsis = prev && page - prev > 1;
        return (
          <span key={page} className="flex items-center gap-2">
            {showEllipsis && <span className="text-gray-400 text-sm">...</span>}
            <Button
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => goToPage(page)}
              className={cn(
                "w-9",
                currentPage === page && "pointer-events-none",
              )}
            >
              {page}
            </Button>
          </span>
        );
      })}

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => goToPage(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;
