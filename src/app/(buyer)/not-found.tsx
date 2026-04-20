// src/app/(buyer)/not-found.tsx
import { NotFoundUI } from "@/components/shared/not-found-ui";

export default function BuyerNotFound() {
  return (
    <NotFoundUI
      title="Page Not Found"
      message="This account page doesn't exist or you may not have access."
      backLabel="Back to Home"
      backHref="/"
    />
  );
}
