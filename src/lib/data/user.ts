import { PlainUser } from "@/types";
import { connectDB } from "../db/connect";
import { User } from "../db/models/user.model";

export const getUserById = async (
  userId: string,
): Promise<PlainUser | null> => {
  await connectDB();

  const user = await User.findById(userId)
    .select("name email image role isActive emailVerified createdAt updatedAt")
    .lean();

  if (!user) return null;

  const hasPassword = await User.exists({
    _id: userId,
    password: { $exists: true, $ne: null },
  });

  const plainUser: PlainUser = {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
    isActive: user.isActive,
    emailVerified: user.emailVerified?.toISOString(),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    hasPassword: !!hasPassword,
  };

  return plainUser;
};
