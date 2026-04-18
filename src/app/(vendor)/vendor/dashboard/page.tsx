import { auth } from "@/auth";
import { getVendorByUserId, getVendorDashboardStats } from "@/lib/data/vendor";
import {
  Package,
  PlusCircle,
  ShoppingBag,
  Star,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function VendorDashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const vendor = await getVendorByUserId(session.user.id);
  if (!vendor) redirect("/");

  const stats = await getVendorDashboardStats(vendor._id);

  const cards = [
    {
      label: "Total Products",
      value: stats.totalProducts,
      sub: `${stats.publishedProducts} published`,
      icon: Package,
      color: "bg-blue-50 text-blue-600",
      href: "/vendor/products",
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders,
      sub: "Awaiting action",
      icon: ShoppingBag,
      color: "bg-yellow-50 text-yellow-600",
      href: "/vendor/orders",
    },
    {
      label: "Total Sales",
      value: stats.totalSales,
      sub: "Items sold",
      icon: TrendingUp,
      color: "bg-green-50 text-green-600",
      href: "/vendor/earnings",
    },
    {
      label: "Store Rating",
      value: stats.rating.toFixed(1),
      sub: `${stats.totalReviews} reviews`,
      icon: Star,
      color: "bg-purple-50 text-purple-600",
      href: "/vendor/settings",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {vendor.storeName}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
        <Link
          href="/vendor/products/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          New Product
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, sub, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-xl border p-5 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                <p className="text-xs text-gray-400 mt-1">{sub}</p>
              </div>
              <div className={`p-2.5 rounded-lg ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Commission notice */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          <strong>Commission Rate:</strong> {stats.commissionRate}% platform fee
          applies to each sale. Your net earnings are calculated after the
          platform commission is deducted.
        </p>
      </div>
    </div>
  );
}
