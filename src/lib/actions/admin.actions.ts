"use server";
// src/lib/actions/admin.actions.ts
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { adminActionClient } from "../safe-action";
import { connectDB } from "../db/connect";
import { Vendor } from "../db/models/vendor.model";
import { User } from "../db/models/user.model";
import { Product } from "../db/models/product.model";
import { Review } from "../db/models/review.model";
import {
  sendVendorApprovalEmail,
  sendVendorRejectionEmail,
} from "@/lib/email/send";

/* ─── Approve vendor ──────────────────────────────────────────────────────── */

export const approveVendorAction = adminActionClient
  .inputSchema(z.object({ vendorId: z.string().min(1) }))
  .action(async ({ parsedInput }) => {
    await connectDB();

    const vendor = await Vendor.findByIdAndUpdate(
      parsedInput.vendorId,
      { status: "approved", isActive: true },
      { new: true },
    );
    if (!vendor) throw new Error("Vendor not found");

    await User.findByIdAndUpdate(vendor.userId, { role: "vendor" });

    const user = await User.findById(vendor.userId).select("name").lean();
    void sendVendorApprovalEmail({
      to: vendor.email,
      vendorName: user?.name ?? vendor.storeName,
      storeName: vendor.storeName,
    });

    revalidatePath("/admin/vendors");
    revalidatePath(`/admin/vendors/${parsedInput.vendorId}`);
    return { success: true };
  });

/* ─── Suspend vendor ──────────────────────────────────────────────────────── */

export const suspendVendorAction = adminActionClient
  .inputSchema(
    z.object({
      vendorId: z.string().min(1),
      reason: z.string().optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    await connectDB();

    const vendor = await Vendor.findByIdAndUpdate(
      parsedInput.vendorId,
      { status: "suspended", isActive: false },
      { new: true },
    );
    if (!vendor) throw new Error("Vendor not found");

    await User.findByIdAndUpdate(vendor.userId, { role: "buyer" });

    const user = await User.findById(vendor.userId).select("name").lean();
    void sendVendorRejectionEmail({
      to: vendor.email,
      vendorName: user?.name ?? vendor.storeName,
      storeName: vendor.storeName,
      reason: parsedInput.reason,
    });

    revalidatePath("/admin/vendors");
    revalidatePath(`/admin/vendors/${parsedInput.vendorId}`);
    return { success: true };
  });

/* ─── Reactivate vendor ───────────────────────────────────────────────────── */

export const reactivateVendorAction = adminActionClient
  .inputSchema(z.object({ vendorId: z.string().min(1) }))
  .action(async ({ parsedInput }) => {
    await connectDB();

    const vendor = await Vendor.findByIdAndUpdate(
      parsedInput.vendorId,
      { status: "approved", isActive: true },
      { new: true },
    );
    if (!vendor) throw new Error("Vendor not found");

    await User.findByIdAndUpdate(vendor.userId, { role: "vendor" });

    const user = await User.findById(vendor.userId).select("name").lean();
    void sendVendorApprovalEmail({
      to: vendor.email,
      vendorName: user?.name ?? vendor.storeName,
      storeName: vendor.storeName,
    });

    revalidatePath("/admin/vendors");
    revalidatePath(`/admin/vendors/${parsedInput.vendorId}`);
    return { success: true };
  });

/* ─── Update commission rate ──────────────────────────────────────────────── */

export const updateCommissionRateAction = adminActionClient
  .inputSchema(
    z.object({
      vendorId: z.string().min(1),
      commissionRate: z.number().min(0).max(50),
    }),
  )
  .action(async ({ parsedInput }) => {
    await connectDB();

    await Vendor.findByIdAndUpdate(parsedInput.vendorId, {
      commissionRate: parsedInput.commissionRate,
    });

    revalidatePath(`/admin/vendors/${parsedInput.vendorId}`);
    return { success: true };
  });

/* ─── Product status ──────────────────────────────────────────────────────── */

export const adminUpdateProductStatusAction = adminActionClient
  .inputSchema(
    z.object({
      productId: z.string().min(1),
      status: z.enum(["draft", "published", "archived"]),
    }),
  )
  .action(async ({ parsedInput }) => {
    await connectDB();

    const product = await Product.findByIdAndUpdate(
      parsedInput.productId,
      { status: parsedInput.status },
      { new: true },
    );
    if (!product) throw new Error("Product not found");

    revalidatePath("/admin/products");
    revalidatePath(`/products/${product.slug}`);
    return { success: true };
  });

/* ─── Toggle featured ─────────────────────────────────────────────────────── */

export const adminToggleFeaturedAction = adminActionClient
  .inputSchema(
    z.object({
      productId: z.string().min(1),
      isFeatured: z.boolean(),
    }),
  )
  .action(async ({ parsedInput }) => {
    await connectDB();

    const product = await Product.findByIdAndUpdate(
      parsedInput.productId,
      { isFeatured: parsedInput.isFeatured },
      { new: true },
    );
    if (!product) throw new Error("Product not found");

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
  });

/* ─── Toggle user active ──────────────────────────────────────────────────── */

export const toggleUserActiveAction = adminActionClient
  .inputSchema(
    z.object({
      userId: z.string().min(1),
      isActive: z.boolean(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    if (parsedInput.userId === ctx.userId)
      throw new Error("You cannot deactivate your own account");

    await connectDB();

    await User.findByIdAndUpdate(parsedInput.userId, {
      isActive: parsedInput.isActive,
    });

    revalidatePath("/admin/users");
    return { success: true };
  });

/* ─── Update user role ────────────────────────────────────────────────────── */

export const updateUserRoleAction = adminActionClient
  .inputSchema(
    z.object({
      userId: z.string().min(1),
      role: z.enum(["buyer", "vendor", "admin"]),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    if (parsedInput.userId === ctx.userId)
      throw new Error("You cannot change your own role");

    await connectDB();

    await User.findByIdAndUpdate(parsedInput.userId, {
      role: parsedInput.role,
    });

    revalidatePath("/admin/users");
    return { success: true };
  });

/* ─── Approve review ──────────────────────────────────────────────────────── */

export const approveReviewAction = adminActionClient
  .inputSchema(z.object({ reviewId: z.string().min(1) }))
  .action(async ({ parsedInput }) => {
    await connectDB();

    const review = await Review.findByIdAndUpdate(
      parsedInput.reviewId,
      { isApproved: true },
      { new: true },
    );
    if (!review) throw new Error("Review not found");

    const approvedReviews = await Review.find({
      productId: review.productId,
      isApproved: true,
    })
      .select("rating")
      .lean();

    const totalReviews = approvedReviews.length;
    const avgRating =
      totalReviews > 0
        ? approvedReviews.reduce((s, r) => s + r.rating, 0) / totalReviews
        : 0;

    await Product.findByIdAndUpdate(review.productId, {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews,
    });

    revalidatePath("/admin/reviews");
    return { success: true };
  });

/* ─── Delete review ───────────────────────────────────────────────────────── */

export const deleteReviewAction = adminActionClient
  .inputSchema(z.object({ reviewId: z.string().min(1) }))
  .action(async ({ parsedInput }) => {
    await connectDB();

    const review = await Review.findByIdAndDelete(parsedInput.reviewId);
    if (!review) throw new Error("Review not found");

    const approvedReviews = await Review.find({
      productId: review.productId,
      isApproved: true,
    })
      .select("rating")
      .lean();

    const totalReviews = approvedReviews.length;
    const avgRating =
      totalReviews > 0
        ? approvedReviews.reduce((s, r) => s + r.rating, 0) / totalReviews
        : 0;

    await Product.findByIdAndUpdate(review.productId, {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews,
    });

    revalidatePath("/admin/reviews");
    return { success: true };
  });
