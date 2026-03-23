import type { DefaultSession } from "next-auth";
import { UserRole } from ".";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      vendorId?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    vendorId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    vendorId?: string | null;
  }
}

export {};
