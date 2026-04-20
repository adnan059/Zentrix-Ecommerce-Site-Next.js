// src/app/(vendor)/not-found.tsx
import { NotFoundUI } from "@/components/shared/not-found-ui";

export default function VendorNotFound() {
  return (
    <NotFoundUI
      title="Page Not Found"
      message="This vendor page doesn't exist or you may not have permission to access it."
      backLabel="Go to Dashboard"
      backHref="/vendor/dashboard"
    />
  );
}
