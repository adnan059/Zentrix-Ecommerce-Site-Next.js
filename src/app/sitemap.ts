import { getAllCategories } from "@/lib/data/categories";
import { getProducts } from "@/lib/data/products";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const categories = await getAllCategories();
  const { products } = await getProducts({ limit: 1000 });

  const categoryUrls = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const productUrls = products.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: new Date((p as any).updatedAt),
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/products`, lastModified: new Date(), priority: 0.9 },
    ...categoryUrls,
    ...productUrls,
  ];
}
