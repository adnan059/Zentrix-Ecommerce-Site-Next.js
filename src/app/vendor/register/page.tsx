import { auth } from "@/auth";
import VendorRegisterForm from "@/components/vendor/vendor-register-form";
import { getVendorByUserId } from "@/lib/data/vendor";
import { redirect } from "next/navigation";

export default async function VendorRegisterPage() {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/vendor/register");

  const existing = await getVendorByUserId(session.user.id);
  if (existing) redirect("/vendor/pending");
  if (session.user.role === "vendor") redirect("/vendor/dashboard");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm border p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Become a Vendor
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Apply to sell your products on Zentrix. Your application will be
          reviewed within 1–2 business days.
        </p>
        <VendorRegisterForm />
      </div>
    </div>
  );
}
