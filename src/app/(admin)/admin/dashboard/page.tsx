// src/app/(admin)/admin/dashboard/page.tsx
import { getAdminDashboardStats } from "@/lib/data/admin";
import { formatCurrency } from "@/lib/utils/format";
import StatsCard from "@/components/admin/stats-card";
import {
  BarChart3,
  Package,
  ShoppingBag,
  Star,
  Store,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard — Zentrix",
};

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  const cards = [
    {
      label: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      sub: "All registered accounts",
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      href: "/admin/users",
    },
    {
      label: "Total Vendors",
      value: stats.totalVendors.toLocaleString(),
      sub: `${stats.pendingVendors} pending approval`,
      icon: Store,
      color: "bg-indigo-50 text-indigo-600",
      href: "/admin/vendors",
      badge:
        stats.pendingVendors > 0
          ? {
              label: `${stats.pendingVendors} pending`,
              color: "bg-yellow-100 text-yellow-700",
            }
          : undefined,
    },
    {
      label: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      sub: `${stats.publishedProducts} published`,
      icon: Package,
      color: "bg-green-50 text-green-600",
      href: "/admin/products",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      sub: "Paid orders",
      icon: ShoppingBag,
      color: "bg-orange-50 text-orange-600",
      href: "/admin/orders",
    },
    {
      label: "Gross Revenue",
      value: formatCurrency(stats.totalRevenue),
      sub: "All-time GMV",
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-600",
      href: "/admin/analytics",
    },
    {
      label: "Platform Revenue",
      value: formatCurrency(stats.platformRevenue),
      sub: "Commissions earned",
      icon: Wallet,
      color: "bg-purple-50 text-purple-600",
      href: "/admin/analytics",
    },
    {
      label: "Pending Reviews",
      value: stats.pendingReviews.toLocaleString(),
      sub: "Awaiting moderation",
      icon: Star,
      color: "bg-yellow-50 text-yellow-600",
      href: "/admin/reviews",
      badge:
        stats.pendingReviews > 0
          ? {
              label: `${stats.pendingReviews} to review`,
              color: "bg-yellow-100 text-yellow-700",
            }
          : undefined,
    },
    {
      label: "Analytics",
      value: "View",
      sub: "Monthly trends",
      icon: BarChart3,
      color: "bg-rose-50 text-rose-600",
      href: "/admin/analytics",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Platform overview — live from the database.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <StatsCard key={card.label} {...card} />
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/vendors?status=pending"
            className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-yellow-100 transition-colors"
          >
            <Store className="w-4 h-4" />
            Review pending vendors
          </Link>
          <Link
            href="/admin/reviews?approved=false"
            className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            <Star className="w-4 h-4" />
            Moderate reviews
          </Link>
          <Link
            href="/admin/products?status=draft"
            className="inline-flex items-center gap-2 bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            <Package className="w-4 h-4" />
            Draft products
          </Link>
          <Link
            href="/admin/analytics"
            className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            View analytics
          </Link>
        </div>
      </div>
    </div>
  );
}
