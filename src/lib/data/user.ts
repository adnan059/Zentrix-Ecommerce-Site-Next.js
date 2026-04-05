import { PlainUser } from "@/types";
import { connectDB } from "../db/connect";
import { User } from "../db/models/user.model";

export const getUserById = async (
  userId: string,
): Promise<PlainUser | null> => {
  await connectDB();
  const user = await User.findById(userId)
    .select(
      "name email image role isActive emailVerified createdAt updatedAt password",
    )
    .lean();

  if (!user) return null;

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
    hasPassword: !!user.password,
  };

  return plainUser;
};
