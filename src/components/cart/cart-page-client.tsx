"use client";

import { useCartStore } from "@/store/cart.store";
import { ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils/format";

function groupByVendor(
  items: ReturnType<typeof useCartStore.getState>["items"],
) {
  return items.reduce(
    (acc, item) => {
      if (!acc[item.vendorId]) acc[item.vendorId] = [];
      acc[item.vendorId].push(item);
      return acc;
    },
    {} as Record<string, typeof items>,
  );
}

const SHIPPING_FEE = 120; // BDT flat rate per vendor group

const CartPageClient = () => {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const grouped = groupByVendor(items);
  const vendorCount = Object.keys(grouped).length;
  const subtotal = getTotalPrice();
  const shippingFee = vendorCount * SHIPPING_FEE;
  const total = subtotal + shippingFee;

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-700">Your cart is empty</h2>
        <p className="text-gray-500">Browse products and add something!</p>
        <Link href="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(grouped).map(([vendorId, vendorItems]) => (
            <div key={vendorId} className="border rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Vendor Group · {vendorItems[0].vendorId?.slice(-6)}
              </div>
              <div className="divide-y">
                {vendorItems.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    className="flex gap-4 p-4"
                  >
                    <Link href={`/products/${item.slug}`} className="shrink-0">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden border bg-gray-50">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain p-1"
                          sizes="80px"
                        />
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.slug}`}>
                        <p className="font-medium text-gray-900 truncate hover:text-blue-600 transition-colors">
                          {item.name}
                        </p>
                      </Link>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {item.variantLabel}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button
                        onClick={() =>
                          removeItem(item.productId, item.variantId)
                        }
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center border rounded-lg overflow-hidden text-sm">
                        <button
                          onClick={() =>
                            item.quantity > 1
                              ? updateQuantity(
                                  item.productId,
                                  item.variantId,
                                  item.quantity - 1,
                                )
                              : removeItem(item.productId, item.variantId)
                          }
                          className="px-2 py-1 hover:bg-gray-100 font-medium"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.variantId,
                              item.quantity + 1,
                            )
                          }
                          className="px-2 py-1 hover:bg-gray-100 font-medium"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border rounded-xl p-5 space-y-4 sticky top-24">
            <h2 className="font-bold text-gray-900 text-lg">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.length} items)</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>
                  Shipping ({vendorCount} seller{vendorCount > 1 ? "s" : ""})
                </span>
                <span>{formatCurrency(shippingFee)}</span>
              </div>

              <div className="border-t pt-2 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
            <Link href="/cart/checkout" className="block">
              <Button className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </Link>
            <Link href="/products" className="block">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPageClient;
