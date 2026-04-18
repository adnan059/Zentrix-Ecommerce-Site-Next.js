"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { vendorActionClient } from "../safe-action";
import { productSchema } from "../validations/product.schema";
import { connectDB } from "../db/connect";
import { Product } from "../db/models/product.model";
import { generateSlug } from "../utils/format";

/* ─── Helper: safely convert compareAtPrice ────────────── */

function sanitizeCompareAtPrice(
  val: number | "" | undefined,
): number | undefined {
  if (val === undefined || val === "" || val === 0) return undefined;
  return Number(val);
}

/* ─── Create product ────────────────────────────────────── */

export const createProductAction = vendorActionClient
  .inputSchema(productSchema)
  .action(async ({ parsedInput, ctx }) => {
    await connectDB();

    const baseSlug = generateSlug(parsedInput.name);
    let slug = baseSlug;
    let counter = 1;
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const basePrice = Math.min(...parsedInput.variants.map((v) => v.price));

    const product = await Product.create({
      ...parsedInput,
      slug,
      vendorId: ctx.vendorId,
      basePrice,
      variants: parsedInput.variants.map((v) => ({
        ...v,
        compareAtPrice: sanitizeCompareAtPrice(v.compareAtPrice),
        specs: v.specs ?? {},
      })),
    });

    revalidatePath("/vendor/products");
    return { success: true, productId: product._id.toString() };
  });

/* ─── Update product ────────────────────────────────────── */

export const updateProductAction = vendorActionClient
  .inputSchema(productSchema.extend({ productId: z.string().min(1) }))
  .action(async ({ parsedInput, ctx }) => {
    await connectDB();

    const { productId, ...data } = parsedInput;

    const existing = await Product.findOne({
      _id: productId,
      vendorId: ctx.vendorId,
    });
    if (!existing) throw new Error("Product not found or access denied");

    const basePrice = Math.min(...data.variants.map((v) => v.price));

    await Product.findByIdAndUpdate(productId, {
      ...data,
      basePrice,
      variants: data.variants.map((v) => ({
        ...v,
        compareAtPrice: sanitizeCompareAtPrice(v.compareAtPrice),
        specs: v.specs ?? {},
      })),
    });

    revalidatePath("/vendor/products");
    revalidatePath(`/vendor/products/${productId}/edit`);
    revalidatePath(`/products/${existing.slug}`);
    return { success: true };
  });

/* ─── Delete product ────────────────────────────────────── */

export const deleteProductAction = vendorActionClient
  .inputSchema(z.object({ productId: z.string().min(1) }))
  .action(async ({ parsedInput, ctx }) => {
    await connectDB();

    const product = await Product.findOne({
      _id: parsedInput.productId,
      vendorId: ctx.vendorId,
    });
    if (!product) throw new Error("Product not found or access denied");

    // Soft-delete: archive instead of hard delete (preserves order history)
    await Product.findByIdAndUpdate(parsedInput.productId, {
      status: "archived",
    });

    revalidatePath("/vendor/products");
    return { success: true };
  });

/* ─── Toggle publish status ─────────────────────────────── */

export const toggleProductStatusAction = vendorActionClient
  .inputSchema(
    z.object({
      productId: z.string().min(1),
      status: z.enum(["draft", "published", "archived"]),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    await connectDB();

    const product = await Product.findOne({
      _id: parsedInput.productId,
      vendorId: ctx.vendorId,
    });
    if (!product) throw new Error("Product not found or access denied");

    await Product.findByIdAndUpdate(parsedInput.productId, {
      status: parsedInput.status,
    });

    revalidatePath("/vendor/products");
    return { success: true };
  });
