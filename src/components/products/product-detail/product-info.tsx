"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IProduct, IVariant } from "@/lib/db/models/product.model";
import { formatCurrency } from "@/lib/utils/format";
import { ShoppingCart, Star, Store } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import VariantSelector from "./variant-selector";
import { useCartStore } from "@/store/cart.store";
import { toast } from "sonner";

interface IProductInfoProps {
  product: IProduct;
}

const ProductInfo = ({ product }: IProductInfoProps) => {
  console.log("PRODUCT ==> ", product);
  const [selectedVariant, setSelectedVariant] = useState<IVariant>(
    product.variants[0],
  );
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  const vendor = product.vendorId as any;
  const category = product.categoryId as any;

  const hasDiscount =
    selectedVariant.compareAtPrice &&
    selectedVariant.compareAtPrice > selectedVariant.price;

  const discountPercent = hasDiscount
    ? Math.round(
        ((selectedVariant.compareAtPrice! - selectedVariant.price) /
          selectedVariant.compareAtPrice!) *
          100,
      )
    : 0;

  const isOutOfStock = selectedVariant.stock === 0;

  // const handleAddToCart = () => {
  //   console.log(selectedVariant._id);
  //   addItem({
  //     productId: product._id.toString(),
  //     variantId: selectedVariant._id?.toString(),
  //     vendorId: product.vendorId?.toString(),
  //     name: product.name,
  //     variantLabel: selectedVariant.label,
  //     sku: selectedVariant.sku,
  //     price: selectedVariant.price,
  //     quantity,
  //     image: product.images[0],
  //     slug: product.slug,
  //   });
  //   toast.success("Added to cart", {
  //     description: `${product.name}-${selectedVariant.label}`,
  //   });
  // };

  const handleAddToCart = () => {
    const variantId = selectedVariant._id as unknown as string;
    const vendorId = vendor?._id?.toString();

    if (!variantId || !vendorId) {
      toast.error("Something went wrong. Please refresh the page.");
      return;
    }

    addItem({
      productId: product._id.toString(),
      variantId,
      vendorId,
      name: product.name,
      variantLabel: selectedVariant.label,
      sku: selectedVariant.sku,
      price: selectedVariant.price,
      quantity,
      image: product.images[0],
      slug: product.slug,
    });

    toast.success("Added to cart", {
      description: `${product.name} — ${selectedVariant.label}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Brand + category */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="secondary">{product.brand}</Badge>
        {category?.name && (
          <Link href={`/category/${category.slug}`}>
            <Badge
              variant="outline"
              className="hover:bg-gray-100 cursor-pointer"
            >
              {category.name}
            </Badge>
          </Link>
        )}
      </div>

      {/* Name */}
      <h1 className="text-2xl font-bold text-gray-900 leading-snug">
        {product.name}
      </h1>

      {/* Rating */}
      {product.totalReviews > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(product.rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">
            {product.rating.toFixed(1)} ({product.totalReviews} reviews)
          </span>
        </div>
      )}

      {/* Price */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-gray-900">
            {formatCurrency(selectedVariant.price)}
          </span>

          {hasDiscount && (
            <>
              <span className="text-lg text-gray-400 line-through">
                {formatCurrency(selectedVariant.compareAtPrice!)}
              </span>
              <Badge className="bg-red-500 hover:bg-red-500">
                -{discountPercent}%
              </Badge>
            </>
          )}
        </div>
        <p className="text-xs text-gray-400">Price includes VAT</p>
      </div>
      {/* Variant selector */}
      {product.variants.length > 1 && (
        <VariantSelector
          variants={product.variants}
          selectedVariant={selectedVariant}
          onSelect={setSelectedVariant}
        />
      )}
      {/* Stock */}
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            isOutOfStock ? "bg-red-500" : "bg-green-500"
          }`}
        />
        <span className="text-sm text-gray-600">
          {isOutOfStock
            ? "Out of stock"
            : `In stock (${selectedVariant.stock} available)`}
        </span>
      </div>
      {/* Quantity + Add to cart */}
      {!isOutOfStock && (
        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-2 hover:bg-gray-100 transition-colors text-lg font-medium"
            >
              -
            </button>
            <span className="px-4 py-2 text-sm font-medium min-w-12 text-center">
              {quantity}
            </span>
            <button
              onClick={() =>
                setQuantity((q) => Math.min(selectedVariant.stock, q + 1))
              }
              className="px-3 py-2 hover:bg-gray-100 transition-colors text-lg font-medium"
            >
              +
            </button>
          </div>

          <Button onClick={handleAddToCart} className="flex-1 gap-2" size="lg">
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </Button>
        </div>
      )}

      {/* Warranty */}
      {product.warranty && (
        <p className="text-sm text-gray-500">
          <span className="font-medium">Warranty:</span> {product.warranty}
        </p>
      )}

      {/* Vendor */}
      {vendor && (
        <Link
          href={`/store/${vendor.storeSlug}`}
          className="flex items-center gap-3 p-4 border rounded-xl hover:border-blue-300 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Store className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
              {vendor.storeName}
            </p>
            <p className="text-xs text-gray-400">
              {vendor.rating > 0
                ? `${vendor.rating.toFixed(1)} ★ rating`
                : "New vendor"}
            </p>
          </div>
        </Link>
      )}
    </div>
  );
};

export default ProductInfo;
