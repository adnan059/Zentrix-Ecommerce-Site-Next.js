"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useCartStore } from "@/store/cart.store";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function PaymentResultContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const orderId = searchParams.get("orderId");
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    if (status === "success") {
      clearCart();
    }
  }, [status, clearCart]);

  if (status === "success") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
        <CheckCircle className="w-16 h-16 text-green-500" />
        <h1 className="text-2xl font-bold text-gray-900">
          Payment Successful!
        </h1>
        <p className="text-gray-500">
          Your order has been placed and is being processed.
        </p>
        <div className="flex gap-3 pt-2">
          {orderId && (
            <Link href={`/orders/${orderId}`}>
              <Button>View Order</Button>
            </Link>
          )}
          <Link href="/products">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
        <AlertCircle className="w-16 h-16 text-yellow-500" />
        <h1 className="text-2xl font-bold text-gray-900">Payment Cancelled</h1>
        <p className="text-gray-500">
          You cancelled the payment. Your cart has been preserved.
        </p>
        <Link href="/cart">
          <Button>Return to Cart</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
      <XCircle className="w-16 h-16 text-red-500" />
      <h1 className="text-2xl font-bold text-gray-900">Payment Failed</h1>
      <p className="text-gray-500">
        Something went wrong. Your cart has been preserved.
      </p>
      <Link href="/cart">
        <Button>Return to Cart</Button>
      </Link>
    </div>
  );
}
