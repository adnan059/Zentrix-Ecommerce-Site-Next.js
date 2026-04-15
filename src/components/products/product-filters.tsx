"use client";

import { PlainCategory } from "@/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback } from "react";

interface IProductFilterProps {
  categories: PlainCategory[];
  activeCategory?: string;
  specSchema?: PlainCategory["specSchema"];
}

const ProductFilters = ({
  categories,
  activeCategory,
  specSchema,
}: IProductFilterProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
        <ul className="space-y-1">
          <li>
            <Link
              href="/products"
              className={cn(
                "block text-sm px-2 py-1.5 rounded-md transition-colors",
                !activeCategory
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100",
              )}
            >
              All Products
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={`/category/${cat.slug}`}
                className={cn(
                  "block text-sm px-2 py-1.5 rounded-md transition-colors",
                  activeCategory === cat.slug
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100",
                )}
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Price range */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Price Range (BDT)
        </h3>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Min"
            defaultValue={searchParams.get("minPrice") ?? ""}
            onBlur={(e) => updateParam("minPrice", e.target.value)}
            className="w-full text-sm border rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-gray-400 text-xs">to</span>
          <input
            type="number"
            placeholder="Max"
            defaultValue={searchParams.get("maxPrice") ?? ""}
            onBlur={(e) => updateParam("maxPrice", e.target.value)}
            className="w-full text-sm border rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Dynamic spec filters — rendered when a category page provides its specSchema */}
      {specSchema && specSchema.length > 0 && (
        <div className="space-y-4">
          {specSchema
            .filter(
              (s) => s.filterable && s.type === "select" && s.options?.length,
            )
            .map((spec) => (
              <div key={spec.key}>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  {spec.label}
                </h3>
                <select
                  defaultValue={searchParams.get(spec.key) ?? ""}
                  onChange={(e) => updateParam(spec.key, e.target.value)}
                  className="w-full text-sm border rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="">Any</option>
                  {spec.options!.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
