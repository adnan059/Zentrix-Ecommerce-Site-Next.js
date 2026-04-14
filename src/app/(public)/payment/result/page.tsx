import { Suspense } from "react";
import PaymentResultContent from "./payment-result-content";

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}
