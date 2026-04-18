import { auth } from "@/auth";
import { getVendorByUserId } from "@/lib/data/vendor";
import { CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function VendorPendingPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const vendor = await getVendorByUserId(session.user.id);

  if (!vendor) redirect("/");
  if (vendor.status === "approved") redirect("/vendor/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border p-8 text-center space-y-4">
        {vendor.status === "pending" ? (
          <>
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Application Under Review
            </h1>
            <p className="text-gray-600">
              Your vendor application for <strong>{vendor.storeName}</strong> is
              under review. We typically respond within 1–2 business days.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Account Suspended
            </h1>
            <p className="text-gray-600">
              Your vendor account has been suspended. Contact support for more
              information.
            </p>
          </>
        )}
        <Link
          href="/"
          className="inline-block mt-4 text-blue-600 hover:underline text-sm"
        >
          ← Back to store
        </Link>
      </div>
    </div>
  );
}
