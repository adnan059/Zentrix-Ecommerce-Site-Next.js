"use client";

import { IVariant } from "@/lib/db/models/product.model";
import { cn } from "@/lib/utils";
import React from "react";

interface IVariantSelectorProps {
  variants: IVariant[];
  selectedVariant: IVariant;
  onSelect: (variant: IVariant) => void;
}

const VariantSelector = ({
  variants,
  selectedVariant,
  onSelect,
}: IVariantSelectorProps) => {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">
        Variant: <span className="text-gray-900">{selectedVariant.label}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => (
          <button
            key={variant._id?.toString()}
            onClick={() => onSelect(variant)}
            disabled={variant.stock === 0}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg border transition-all",
              selectedVariant._id?.toString() === variant._id?.toString()
                ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                : "border-gray-200 hover:border-gray-400 text-gray-700",
              variant.stock === 0 &&
                "opacity-40 cursor-not-allowed line-through",
            )}
          >
            {variant.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VariantSelector;
