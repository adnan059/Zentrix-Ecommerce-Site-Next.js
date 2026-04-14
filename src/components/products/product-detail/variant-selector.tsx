"use client";

import { IProductVariant } from "@/types";
import { cn } from "@/lib/utils";

interface IVariantSelectorProps {
  variants: IProductVariant[]; // ✅ IProductVariant, not IVariant
  selectedVariant: IProductVariant; // ✅
  onSelect: (variant: IProductVariant) => void; // ✅
}

const VariantSelector = ({
  variants,
  selectedVariant,
  onSelect,
}: IVariantSelectorProps) => {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">
        Variant:{" "}
        <span className="font-normal text-gray-500">
          {selectedVariant.label}
        </span>
      </p>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => (
          <button
            key={variant._id} // ✅ _id is now string — no .toString() needed
            type="button"
            onClick={() => onSelect(variant)}
            disabled={variant.stock === 0}
            className={cn(
              "px-3 py-1.5 text-sm border rounded-lg transition-all",
              variant.stock === 0
                ? "opacity-40 cursor-not-allowed line-through"
                : "cursor-pointer hover:border-blue-400",
              selectedVariant._id === variant._id
                ? "border-blue-600 bg-blue-50 text-blue-700 font-medium"
                : "border-gray-200 text-gray-700",
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
