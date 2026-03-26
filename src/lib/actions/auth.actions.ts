"use server";

import { actionClient } from "@/lib/safe-action";

import { loginSchema, registerSchema } from "@/lib/validations/auth.schema";

import { connectDB } from "@/lib/db/connect";

import bcrypt from "bcryptjs";

import { AuthError } from "next-auth";
import { User } from "../db/models/user.model";
import { signIn, signOut } from "@/auth";

export const registerAction = actionClient
  .inputSchema(registerSchema)
  .action(async ({ parsedInput }) => {
    await connectDB();

    const existing = await User.findOne({ email: parsedInput.email });

    if (existing) {
      throw new Error("An account with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(parsedInput.password, 12);

    await User.create({
      name: parsedInput.name,
      email: parsedInput.email,
      password: hashedPassword,
      role: "buyer",
    });

    return { success: true, message: "Account created successfully" };
  });

export const loginAction = actionClient
  .inputSchema(loginSchema)
  .action(async ({ parsedInput }) => {
    try {
      await signIn("credentials", {
        email: parsedInput.email,
        password: parsedInput.password,
        redirect: false,
      });

      return { success: true };
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case "CredentialsSignin":
            throw new Error("Invalid email or password");
          default:
            throw new Error("Something went wrong. Please try again.");
        }
      }
      throw error;
    }
  });

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
