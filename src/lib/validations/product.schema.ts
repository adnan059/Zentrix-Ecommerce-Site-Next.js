import { z } from "zod";

export const variantSchema = z.object({
  _id: z.string().optional(),
  label: z.string().min(1, "Label is required").max(100),
  sku: z.string().min(1, "SKU is required").max(100),
  price: z.coerce.number().min(0, "Price must be ≥ 0"),
  compareAtPrice: z.coerce.number().min(0).optional().or(z.literal("")),
  stock: z.coerce.number().int().min(0, "Stock must be ≥ 0"),
  specs: z.record(z.string(), z.string()).default({}),
});

export const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(200),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().min(20, "Description too short").max(5000),
  brand: z.string().min(1, "Brand is required").max(100),
  images: z.array(z.string().url()).min(1, "At least one image is required"),
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
  tags: z.array(z.string()).default([]),
  warranty: z.string().max(200).optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export type ProductInput = z.infer<typeof productSchema>;

export type VariantInput = z.infer<typeof variantSchema>;
