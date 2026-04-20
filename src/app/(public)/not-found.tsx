// src/app/(public)/not-found.tsx
import { NotFoundUI } from "@/components/shared/not-found-ui";

export default function PublicNotFound() {
  return (
    <NotFoundUI
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved."
      backLabel="Back to Home"
      backHref="/"
    />
  );
}
