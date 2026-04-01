"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart.store";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

const CartIcon = () => {
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((s) => s.getTotalItems());

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <Link
      href={"/cart"}
      className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <ShoppingCart className="w-5 h-5 text-gray-700" />

      {/* 👇 only render AFTER hydration */}
      {mounted && totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
          {totalItems > 9 ? "9+" : totalItems}
        </span>
      )}
    </Link>
  );
};

export default CartIcon;
