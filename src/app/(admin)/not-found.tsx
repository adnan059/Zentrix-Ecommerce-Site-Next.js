// src/app/(admin)/not-found.tsx
import { NotFoundUI } from "@/components/shared/not-found-ui";

export default function AdminNotFound() {
  return (
    <NotFoundUI
      title="Page Not Found"
      message="This admin page doesn't exist or has been moved."
      backLabel="Go to Dashboard"
      backHref="/admin/dashboard"
    />
  );
}
