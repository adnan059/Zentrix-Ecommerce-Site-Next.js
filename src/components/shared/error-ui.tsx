"use client";

import Link from "next/link";

// src/components/shared/error-ui.tsx
interface ErrorUIProps {
  title?: string;
  message?: string;
  digest?: string;
  reset: () => void;
  showHomeLink?: boolean;
}

export function ErrorUI({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  digest,
  reset,
  showHomeLink = true,
}: ErrorUIProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="mb-4 text-6xl">⚠️</p>
      <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h2>
      <p className="mb-2 max-w-md text-sm text-muted-foreground">{message}</p>
      {digest && (
        <p className="mb-6 text-xs text-muted-foreground/60">
          Error ID: {digest}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex h-10 items-center rounded-md bg-foreground px-6 text-sm font-semibold text-background transition-opacity hover:opacity-80"
        >
          Try again
        </button>
        {showHomeLink && (
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-md border border-border px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Go Home
          </Link>
        )}
      </div>
    </div>
  );
}
