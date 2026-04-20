"use client";
// src/app/(vendor)/error.tsx
import { useEffect } from "react";
import { ErrorUI } from "@/components/shared/error-ui";

export default function VendorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[VendorError]", error);
  }, [error]);

  return (
    <ErrorUI
      title="Something went wrong"
      message="We couldn't load your vendor dashboard. Please try again."
      digest={error.digest}
      reset={reset}
      showHomeLink={false}
    />
  );
}
