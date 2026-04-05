"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { authActionClient } from "../safe-action";
import {
  changePasswordSchema,
  updateProfileSchema,
} from "../validations/profile.schema";
import { connectDB } from "../db/connect";
import { User } from "../db/models/user.model";

export const updateProfileAction = authActionClient
  .inputSchema(updateProfileSchema)
  .action(async ({ parsedInput, ctx }) => {
    await connectDB();
    await User.findByIdAndUpdate(ctx.userId, {
      name: parsedInput.name,
      ...(parsedInput.image ? { image: parsedInput.image } : {}),
    });
    revalidatePath("/account");
    return { success: true };
  });

export const changePasswordAction = authActionClient
  .inputSchema(changePasswordSchema)
  .action(async ({ parsedInput, ctx }) => {
    await connectDB();
    const user = await User.findById(ctx.userId).select("+password");
    if (!user) throw new Error("User not found");
    if (!user.password)
      throw new Error("Cannot change password for OAuth accounts");

    const match = await bcrypt.compare(
      parsedInput.currentPassword,
      user.password,
    );

    if (!match) throw new Error("Current password is incorrect");

    const hashed = await bcrypt.hash(parsedInput.newPassword, 12);
    user.password = hashed;
    await user.save();

    return { success: true };
  });
