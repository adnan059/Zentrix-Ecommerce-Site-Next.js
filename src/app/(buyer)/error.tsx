"use client";
// src/app/(buyer)/error.tsx
import { useEffect } from "react";
import { ErrorUI } from "@/components/shared/error-ui";

export default function BuyerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[BuyerError]", error);
  }, [error]);

  return (
    <ErrorUI
      title="Something went wrong"
      message="We couldn't load your account page. Please try again."
      digest={error.digest}
      reset={reset}
    />
  );
}
