"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

interface IProductImagesProps {
  images: string[];
  name: string;
}

export default function ProductImages({ images, name }: IProductImagesProps) {
  const [selected, setSelected] = useState(0);
  const imageList =
    images.length > 0
      ? images
      : ["https://dummyimage.com/600x600/e2e8f0/475569&text=No+Image"];

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden border bg-gray-50">
        <Image
          src={imageList[selected]}
          alt={name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-6"
        />
      </div>

      {/* Thumbnails */}
      {imageList.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {imageList.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={cn(
                "relative w-16 h-16 shrink-0 rounded-lg border-2 overflow-hidden bg-gray-50 transition-colors",
                selected === i
                  ? "border-blue-500"
                  : "border-gray-200 hover:border-gray-400",
              )}
            >
              <Image
                src={img}
                alt={`${name} ${i + 1}`}
                fill
                sizes="64px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
