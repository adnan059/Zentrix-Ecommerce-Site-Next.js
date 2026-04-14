import { auth } from "@/auth";
import CheckoutForm from "@/components/cart/checkout-form";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Checkout - Zentrix",
};

export default async function CheckoutPage() {
  const session = await auth();

  if (!session) redirect("/login?callbackUrl=/cart/checkout");
  return <CheckoutForm userEmail={session.user.email!} />;
}
