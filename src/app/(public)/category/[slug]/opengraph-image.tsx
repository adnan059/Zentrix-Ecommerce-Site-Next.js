// src/app/(public)/category/[slug]/opengraph-image.tsx
import { getAllCategories } from "@/lib/data/categories";
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
  const categories = await getAllCategories();
  const category = categories.find((c) => c.slug === slug);

  const name = category?.name ?? "Category";
  const description = category?.description ?? "Browse products on Zentrix";
  const image = category?.image ?? null;

  return new ImageResponse(
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        background: "#18181b",
        fontFamily: "sans-serif",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background blurred category image */}
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          width={1200}
          height={630}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.15,
          }}
        />
      )}

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, #18181b 0%, #27272a 50%, #18181b 100%)",
          opacity: image ? 0.7 : 1,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "0 80px",
          gap: "20px",
        }}
      >
        <div
          style={{
            fontSize: "16px",
            color: "#71717a",
            fontWeight: 600,
            letterSpacing: "3px",
          }}
        >
          ZENTRIX
        </div>
        <div
          style={{
            fontSize: name.length > 20 ? "56px" : "72px",
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-2px",
            lineHeight: 1.1,
          }}
        >
          {name}
        </div>
        {description && (
          <div
            style={{
              fontSize: "20px",
              color: "#a1a1aa",
              lineHeight: 1.5,
              maxWidth: "700px",
            }}
          >
            {description.length > 100
              ? `${description.slice(0, 97)}...`
              : description}
          </div>
        )}
        <div
          style={{
            width: "60px",
            height: "4px",
            borderRadius: "9999px",
            background: "#4ade80",
            marginTop: "4px",
          }}
        />
      </div>
    </div>,
    { ...size },
  );
}
