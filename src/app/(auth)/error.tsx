"use client";
// src/app/(auth)/error.tsx
import { useEffect } from "react";
import { ErrorUI } from "@/components/shared/error-ui";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AuthError]", error);
  }, [error]);

  return (
    <ErrorUI
      title="Authentication Error"
      message="Something went wrong while processing your request. Please try again."
      digest={error.digest}
      reset={reset}
    />
  );
}
