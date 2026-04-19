// src/lib/safe-action.ts
import { auth } from "@/auth";
import { createSafeActionClient } from "next-safe-action";
import { connectDB } from "./db/connect";
import { Vendor } from "./db/models/vendor.model";

export const actionClient = createSafeActionClient({
  handleServerError(error) {
    if (error instanceof Error) return error.message;
    return "An unexpected error occurred";
  },
});

export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("You must be logged in");
  return next({ ctx: { userId: session.user.id, user: session.user } });
});

export const vendorActionClient = actionClient.use(async ({ next }) => {
  const session = await auth();

  if (!session?.user?.id) throw new Error("You must be logged in");
  if (session.user.role !== "vendor") throw new Error("Vendor access required");

  await connectDB();
  const vendor = await Vendor.findOne({
    userId: session.user.id,
    status: "approved",
    isActive: true,
  })
    .select("_id commissionRate")
    .lean();

  if (!vendor) throw new Error("Vendor account not found or not approved");

  return next({
    ctx: {
      userId: session.user.id,
      user: session.user,
      vendorId: vendor._id.toString(),
      commissionRate: vendor.commissionRate,
    },
  });
});

export const adminActionClient = actionClient.use(async ({ next }) => {
  const session = await auth();

  if (!session?.user?.id) throw new Error("You must be logged in");
  if (session.user.role !== "admin") throw new Error("Admin access required");

  return next({
    ctx: {
      userId: session.user.id,
      user: session.user,
    },
  });
});
