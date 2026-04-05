import { auth } from "@/auth";
import ChangePasswordForm from "@/components/account/change-password-form";
import ProfileForm from "@/components/account/profile-form";
import { getUserById } from "@/lib/data/user";
import { UserCircle } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My Account - Zentrix",
};

export default async function AccountPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await getUserById(session.user.id);

  if (!user) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your profile and password
        </p>
      </div>

      {/* Avatar + info */}
      <div className="flex items-center gap-4 p-5 border rounded-xl">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 shrink-0">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name}
              fill
              className="object-cover"
            />
          ) : (
            <UserCircle className="w-full h-full text-gray-400" />
          )}
        </div>

        <div>
          <p className="font-semibold text-gray-900">{user.name}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
          <span className="text-xs capitalize text-blue-600 font-medium">
            {user.role}
          </span>
        </div>
      </div>

      {/* Profile form */}
      <div className="border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Profile Information</h2>
        <ProfileForm
          defaultValues={{
            name: user.name,
            image: user.image ?? "",
          }}
        />
      </div>

      {/* Password — only for credential users */}
      {user.hasPassword ? (
        <div className="border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Change Password</h2>
          <ChangePasswordForm />
        </div>
      ) : (
        <div className="border rounded-xl p-5 bg-gray-50">
          <p className="text-sm text-gray-500">
            You signed in with Google. Password management is not available for
            OAuth accounts.
          </p>
        </div>
      )}
    </div>
  );
}
