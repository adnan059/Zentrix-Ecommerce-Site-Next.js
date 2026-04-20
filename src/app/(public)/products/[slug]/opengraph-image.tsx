// src/app/(public)/products/[slug]/opengraph-image.tsx
import { getProductBySlug } from "@/lib/data/products";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const name = product?.name ?? "Product";
  const brand = product?.brand ?? "";
  const price = product?.basePrice
    ? `From ৳${product.basePrice.toLocaleString("en-BD")}`
    : "";
  const rating = product?.rating ?? 0;
  const image = product?.images?.[0] ?? `${appUrl}/og-placeholder.png`;

  return new ImageResponse(
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        background: "#18181b",
        fontFamily: "sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Left — product image */}
      <div
        style={{
          width: "480px",
          height: "630px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#27272a",
          flexShrink: 0,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={name}
          width={380}
          height={380}
          style={{ objectFit: "contain", borderRadius: "12px" }}
        />
      </div>

      {/* Right — text */}
      <div
        style={{
          flex: 1,
          padding: "56px 60px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.5px",
          }}
        >
          ZENTRIX
        </div>

        {/* Product info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {brand && (
            <div
              style={{
                fontSize: "16px",
                color: "#a1a1aa",
                fontWeight: 500,
              }}
            >
              {brand.toUpperCase()}
            </div>
          )}
          <div
            style={{
              fontSize: name.length > 40 ? "28px" : "36px",
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.25,
              letterSpacing: "-0.5px",
            }}
          >
            {name}
          </div>
          {price && (
            <div
              style={{
                fontSize: "26px",
                fontWeight: 600,
                color: "#4ade80",
              }}
            >
              {price}
            </div>
          )}
          {rating > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "4px",
              }}
            >
              <div style={{ fontSize: "18px", color: "#facc15" }}>★</div>
              <div style={{ fontSize: "16px", color: "#d4d4d8" }}>
                {rating.toFixed(1)} rating
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ fontSize: "13px", color: "#52525b" }}>
          zentrix.com · Multi-Vendor Marketplace
        </div>
      </div>
    </div>,
    { ...size },
  );
}
