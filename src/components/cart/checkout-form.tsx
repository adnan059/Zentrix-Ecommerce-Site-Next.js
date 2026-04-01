"use client";

import { createCodOrder } from "@/lib/actions/order.actions";
import {
  CheckoutFormValues,
  checkoutSchema,
} from "@/lib/validations/checkout.schema";
import { useCartStore } from "@/store/cart.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ICheckoutFormProps {
  userId: string;
  userEmail: string;
}

const SHIPPING_FEE = 120;

const bangladeshiDistricts = [
  "Dhaka",
  "Chittagong",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
  "Gazipur",
  "Narayanganj",
  "Comilla",
  "Feni",
  "Noakhali",
  "Cox's Bazar",
];

const CheckoutForm = ({ userId, userEmail }: ICheckoutFormProps) => {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<"aamarpay" | "cod">(
    "aamarpay",
  );
  const router = useRouter();
  const subtotal = getTotalPrice();
  const vendorCount = new Set(items.map((i) => i.vendorId)).size;
  const shippingFee = vendorCount * SHIPPING_FEE;
  const total = subtotal + shippingFee;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: "aamarpay" },
  });

  // next-safe-action hooks
  const { execute: executeCod, isPending: isCodPending } = useAction(
    createCodOrder,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          clearCart();
          toast.success("Order placed!", {
            description: "We'll process it soon.",
          });
          router.push(`/orders/${data.orderId}`);
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError ?? "Failed to place order");
      },
    },
  );

  return <div>CheckoutForm</div>;
};

export default CheckoutForm;
