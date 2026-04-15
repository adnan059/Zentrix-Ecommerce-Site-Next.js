import { PlainCategory } from "@/types";
import { connectDB } from "../db/connect";
import { Category } from "../db/models/category.model";

/* ───────────────── fetching all categories ───────────────── */

export async function getAllCategories(): Promise<PlainCategory[]> {
  await connectDB();
  const categories = await Category.find({ isActive: true })
    .sort({ sortOrder: 1 })
    .lean();
  return JSON.parse(JSON.stringify(categories)) as PlainCategory[];
}

/* ───────────────── fetching category by slug ───────────────── */

export async function getCategoryBySlug(
  slug: string,
): Promise<PlainCategory | null> {
  await connectDB();
  const category = await Category.findOne({ slug, isActive: true }).lean();

  if (!category) return null;

  return JSON.parse(JSON.stringify(category)) as PlainCategory;
}
