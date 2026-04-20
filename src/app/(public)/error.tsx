"use client";
// src/app/(public)/error.tsx
import { useEffect } from "react";
import { ErrorUI } from "@/components/shared/error-ui";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[PublicError]", error);
  }, [error]);

  return (
    <ErrorUI
      title="Something went wrong"
      message="We couldn't load this page. Please try again."
      digest={error.digest}
      reset={reset}
    />
  );
}
