import CartPageClient from "@/components/cart/cart-page-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Cart - Zentrix",
};
export default function CartPage() {
  return <CartPageClient />;
}
