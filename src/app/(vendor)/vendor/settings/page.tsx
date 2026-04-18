import { auth } from "@/auth";
import { getVendorByUserId } from "@/lib/data/vendor";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import VendorSettingsForm from "@/components/vendor/vendor-settings-form";

export const metadata: Metadata = { title: "Store Settings - Zentrix Vendor" };

export default async function VendorSettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const vendor = await getVendorByUserId(session.user.id);
  if (!vendor) redirect("/");

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
      <VendorSettingsForm vendor={vendor} />
    </div>
  );
}
