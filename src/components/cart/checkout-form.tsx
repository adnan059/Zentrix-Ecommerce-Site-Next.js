"use client";

import { createCodOrder } from "@/lib/actions/order.actions";
import { initiateAamarpayPayment } from "@/lib/actions/payment.actions";
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
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils/format";
import { Button } from "../ui/button";

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
    formState: { errors },
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

  const { execute: executeAamarpay, isPending: isAamarpayPending } = useAction(
    initiateAamarpayPayment,
    {
      onSuccess: ({ data }) => {
        if (data?.paymentUrl) {
          window.location.href = data.paymentUrl;
        }
      },

      onError: ({ error }) => {
        console.log("FULL ERROR:", error);
        toast.error(error.serverError ?? "Payment initiation failed");
      },
    },
  );

  const isPending = isCodPending || isAamarpayPending;

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  const buildOrderPayload = (values: CheckoutFormValues) => ({
    userId,
    userEmail,
    items: items.map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      vendorId: i.vendorId,
      name: i.name,
      variantLabel: i.variantLabel,
      sku: i.sku,
      image: i.image,
      price: i.price,
      quantity: i.quantity,
      subtotal: i.price * i.quantity,
    })),
    shippingAddress: {
      fullName: values.fullName,
      phone: values.phone,
      addressLine1: values.addressLine1,
      addressLine2: values.addressLine2,
      city: values.city,
      district: values.district,
      postalCode: values.postalCode,
    },
    subtotal,
    shippingFee,
    discount: 0,
    total,
    paymentMethod: values.paymentMethod,
    notes: values.notes,
  });

  const onSubmit = (values: CheckoutFormValues) => {
    const payload = buildOrderPayload(values);
    if (values.paymentMethod === "cod") {
      executeCod(payload);
    } else {
      executeAamarpay(payload);
    }
  };
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Shipping + Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="border rounded-xl p-6 space-y-4">
              <h2 className="font-semibold text-gray-900 text-lg">
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    {...register("fullName")}
                    placeholder="e.g. Adnan Ahmed"
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-500">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="01XXXXXXXXX"
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="addressLine1">Address Line 1 *</Label>
                <Input
                  id="addressLine1"
                  {...register("addressLine1")}
                  placeholder="House/Flat, Road, Area"
                />
                {errors.addressLine1 && (
                  <p className="text-xs text-red-500">
                    {errors.addressLine1.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input
                  id="addressLine2"
                  {...register("addressLine2")}
                  placeholder="Landmark (optional)"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    {...register("city")}
                    placeholder="e.g. Dhaka"
                  />
                  {errors.city && (
                    <p className="text-xs text-red-500">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="district">District *</Label>
                  <select
                    id="district"
                    {...register("district")}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select district</option>
                    {bangladeshiDistricts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  {errors.district && (
                    <p className="text-xs text-red-500">
                      {errors.district.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    {...register("postalCode")}
                    placeholder="e.g. 1207"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="notes">Order Notes</Label>
                <Input
                  id="notes"
                  {...register("notes")}
                  placeholder="Special instructions (optional)"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="border rounded-xl p-6 space-y-4">
              <h2 className="font-semibold text-gray-900 text-lg">
                Payment Method
              </h2>
              <div className="space-y-3">
                <label
                  className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${
                    paymentMethod === "aamarpay"
                      ? "border-blue-500 bg-blue-50"
                      : "hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    value="aamarpay"
                    {...register("paymentMethod")}
                    onChange={() => setPaymentMethod("aamarpay")}
                    className="accent-blue-600"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Online Payment</p>
                    <p className="text-xs text-gray-500">
                      Cards, bKash, Nagad, Rocket — via Aamarpay
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${
                    paymentMethod === "cod"
                      ? "border-blue-500 bg-blue-50"
                      : "hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    value="cod"
                    {...register("paymentMethod")}
                    onChange={() => setPaymentMethod("cod")}
                    className="accent-blue-600"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      Cash on Delivery
                    </p>
                    <p className="text-xs text-gray-500">
                      Pay when you receive your order
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="border rounded-xl p-5 space-y-4 sticky top-24">
              <h2 className="font-bold text-gray-900 text-lg">Order Summary</h2>
              {/* Item previews */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    className="flex gap-2"
                  >
                    <div className="relative w-12 h-12 rounded border bg-gray-50 shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-1"
                        sizes="48px"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.variantLabel} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-xs font-semibold shrink-0">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              <div className="space-y-2 text-sm border-t pt-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{formatCurrency(shippingFee)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base border-t pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isPending}
              >
                {isPending
                  ? "Processing..."
                  : paymentMethod === "cod"
                    ? "Place Order"
                    : "Pay Now"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;
