"use client";
// src/app/(admin)/error.tsx
import { useEffect } from "react";
import { ErrorUI } from "@/components/shared/error-ui";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AdminError]", error);
  }, [error]);

  return (
    <ErrorUI
      title="Something went wrong"
      message="We couldn't load this admin page. Please try again or contact engineering."
      digest={error.digest}
      reset={reset}
      showHomeLink={false}
    />
  );
}
