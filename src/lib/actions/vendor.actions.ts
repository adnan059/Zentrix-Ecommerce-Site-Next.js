"use server";

import { revalidatePath } from "next/cache";
import { authActionClient, vendorActionClient } from "../safe-action";
import {
  vendorRegisterSchema,
  vendorSettingsSchema,
} from "../validations/vendor.schema";
import { connectDB } from "../db/connect";
import { Vendor } from "../db/models/vendor.model";
import { User } from "../db/models/user.model";
import { generateSlug } from "../utils/format";

/* ─── Register as vendor (buyer → pending vendor) ────────────────── */

export const registerVendorAction = authActionClient
  .inputSchema(vendorRegisterSchema)
  .action(async ({ parsedInput, ctx }) => {
    await connectDB();

    const existingVendor = await Vendor.findOne({ userId: ctx.userId });
    if (existingVendor) throw new Error("You already have a vendor account");

    const user = await User.findById(ctx.userId).select("email").lean();
    if (!user) throw new Error("User not found");

    const baseSlug = generateSlug(parsedInput.storeName);
    let storeSlug = baseSlug;
    let counter = 1;

    while (await Vendor.findOne({ storeSlug })) {
      storeSlug = `${baseSlug}-${counter++}`;
    }

    const vendor = await Vendor.create({
      userId: ctx.userId,
      storeName: parsedInput.storeName,
      storeSlug,
      description: parsedInput.description,
      phone: parsedInput.phone,
      address: parsedInput.address,
      email: user.email,
      status: "pending",
    });

    return { success: true, vendorId: vendor._id.toString() };
  });

/* ─── Update store settings ────────────────────────────── */

export const updateVendorSettingsAction = vendorActionClient
  .inputSchema(vendorSettingsSchema)
  .action(async ({ parsedInput, ctx }) => {
    await connectDB();

    await Vendor.findByIdAndUpdate(ctx.vendorId, {
      storeName: parsedInput.storeName,
      description: parsedInput.description,
      ...(parsedInput.logo !== undefined ? { logo: parsedInput.logo } : {}),
      ...(parsedInput.banner !== undefined
        ? { banner: parsedInput.banner }
        : {}),
      phone: parsedInput.phone,
      address: parsedInput.address,
    });

    revalidatePath("/vendor/settings");
    return { success: true };
  });
