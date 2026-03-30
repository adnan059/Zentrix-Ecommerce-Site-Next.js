/* eslint-disable @typescript-eslint/no-explicit-any */
import { IProduct } from "@/lib/db/models/product.model";
import { Star } from "lucide-react";
import Image from "next/image";
import { Badge } from "../ui/badge";
import { formatCurrency } from "@/lib/utils/format";
import Link from "next/link";

interface IProductCardProps {
  product: IProduct;
}

const ProductCard = ({ product }: IProductCardProps) => {
  const hasDiscount =
    product.variants?.[0]?.compareAtPrice &&
    product.variants[0].compareAtPrice > product.basePrice;

  const discountPercent = hasDiscount
    ? Math.round(
        ((product.variants[0].compareAtPrice! - product.basePrice) /
          product.variants[0].compareAtPrice!) *
          100,
      )
    : 0;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="border rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow duration-200">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50">
          <Image
            src={
              product.images[0] ??
              "https://dummyimage.com/400x400/e2e8f0/475569&text=No+Image"
            }
            alt={product.name}
            unoptimized
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-200"
          />
          {hasDiscount && (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-500">
              -{discountPercent}%
            </Badge>
          )}
        </div>

        {/* Info */}
        <div className="p-4 space-y-2">
          <p className="text-xs text-gray-400 uppercase tracking-wide">
            {product.brand}
          </p>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.totalReviews > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-600">
                {product.rating.toFixed(1)} ({product.totalReviews})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-gray-900">
              {formatCurrency(product.basePrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">
                {formatCurrency(product.variants[0].compareAtPrice!)}
              </span>
            )}
          </div>

          {/* Vendor */}
          <p className="text-xs text-gray-400">
            by{" "}
            <span className="text-blue-500">
              {(product.vendorId as any)?.storeName ?? "Zentrix Seller"}
            </span>
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
