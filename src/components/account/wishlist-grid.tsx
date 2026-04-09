"use client";

interface IWishlistProduct {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  variants: Array<{ price: number }>;
}

import { toggleWishlistAction } from "@/lib/actions/wishlist.actions";
import { formatCurrency } from "@/lib/utils/format";
import { Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "sonner";

const WishlistGrid = ({ products }: { products: IWishlistProduct[] }) => {
  const [optimisticList, setOptimisticList] = useState(products);

  const { execute } = useAction(toggleWishlistAction, {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSuccess: ({ data, input }) => {
      setOptimisticList((prev) =>
        prev.filter((p) => p._id !== input.productId),
      );
      toast.success("Removed from wishlist");
    },
    onError: ({ error }) =>
      toast.error(error.serverError ?? "Something went wrong"),
  });
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {optimisticList?.map((product) => {
        const minPrice = Math.min(...product.variants.map((v) => v.price));

        return (
          <div
            key={product._id}
            className="border rounded-xl overflow-hidden group relative"
          >
            <button
              onClick={() => execute({ productId: product._id })}
              className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              title="Remove from wishlist"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <Link href={`/products/${product.slug}`}>
              <div className="relative aspect-square bg-gray-50">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 line-clamp-2">
                  {product.name}
                </p>
                <p className="text-sm font-bold text-blue-600 mt-1">
                  From {formatCurrency(minPrice)}
                </p>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default WishlistGrid;
