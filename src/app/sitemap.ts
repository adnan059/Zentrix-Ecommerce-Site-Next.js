// src/app/sitemap.ts
import { getAllCategories } from "@/lib/data/categories";
import { getProducts } from "@/lib/data/products";
import { MetadataRoute } from "next";

export const revalidate = 3600; // regenerate at most once per hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const [categoriesResult, productsResult] = await Promise.allSettled([
    getAllCategories(),
    getProducts({ limit: 1000, page: 1 }),
  ]);

  const categories =
    categoriesResult.status === "fulfilled" ? categoriesResult.value : [];

  const products =
    productsResult.status === "fulfilled" ? productsResult.value.products : [];

  const categoryUrls: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(cat.updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "daily",
    priority: 0.6,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...categoryUrls,
    ...productUrls,
  ];
}
