import type { NextAuthConfig } from "next-auth";

import Credentials from "next-auth/providers/credentials";

import Google from "next-auth/providers/google";

import bcrypt from "bcryptjs";
import { loginSchema } from "../validations/auth.schema";
import { connectDB } from "../db/connect";
import { User } from "../db/models/user.model";
import { UserRole } from "@/types";

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),

    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) return null;

        await connectDB();

        const user = await User.findOne({ email: parsed.data.email })
          .select("+password")
          .lean();

        if (!user || !user.password) return null;

        const passwordMatch = await bcrypt.compare(
          parsed.data.password,
          user.password,
        );

        if (!passwordMatch) return null;
        if (!user.isActive) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          vendorId: user.vendorId?.toString() ?? null,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectDB();
        const existing = await User.findOne({ email: user.email });
        if (!existing) {
          await User.create({
            name: user.name ?? undefined,
            email: user.email ?? undefined,
            image: user.image ?? undefined,
            emailVerified: new Date(),
            role: "buyer",
          });
        }
        const dbUser = await User.findOne({ email: user.email }).lean();
        if (dbUser) {
          user.id = dbUser._id.toString();
          user.role = dbUser.role;
          user.vendorId = dbUser.vendorId?.toString() ?? null;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.vendorId = user.vendorId;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.vendorId = token.vendorId as string | null;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
};
