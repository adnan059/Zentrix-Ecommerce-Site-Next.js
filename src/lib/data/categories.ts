import { connectDB } from "../db/connect";
import { Category, ICategory } from "../db/models/category.model";

/* ───────────────── fetching all categories ───────────────── */

export async function getAllCategories(): Promise<ICategory[]> {
  await connectDB();
  const categories = await Category.find({ isActive: true })
    .sort({ sortOrder: 1 })
    .lean();
  return JSON.parse(JSON.stringify(categories));
}

/* ───────────────── fetching category by slug ───────────────── */

export async function getCategoryBySlug(
  slug: string,
): Promise<ICategory | null> {
  await connectDB();
  const category = await Category.findOne({ slug, isActive: true }).lean();

  if (!category) return null;

  return JSON.parse(JSON.stringify(category));
}
