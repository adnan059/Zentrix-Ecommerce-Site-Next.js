// src/app/(admin)/admin/vendors/[id]/page.tsx
import { getAdminVendorById } from "@/lib/data/admin";
import { notFound } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import VendorApprovalButton from "@/components/admin/vendor-approval-button";
import CommissionRateForm from "@/components/admin/commission-rate-form";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  Star,
  TrendingUp,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const vendor = await getAdminVendorById(id);
  if (!vendor) return { title: "Vendor Not Found" };
  return { title: `${vendor.storeName} — Admin | Zentrix` };
}

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  suspended: "bg-red-100 text-red-600",
};

export default async function AdminVendorDetailPage({ params }: PageProps) {
  const { id } = await params;
  const vendor = await getAdminVendorById(id);
  if (!vendor) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/vendors"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" /> Back to vendors
      </Link>

      {/* Header card */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="shrink-0">
            {vendor.logo ? (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border">
                <Image
                  src={vendor.logo}
                  alt={vendor.storeName}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-xl border bg-gray-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-400">
                  {vendor.storeName[0]}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">
                {vendor.storeName}
              </h1>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusStyles[vendor.status]}`}
              >
                {vendor.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">@{vendor.storeSlug}</p>
            {vendor.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {vendor.description}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                {vendor.email}
              </span>
              {vendor.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  {vendor.phone}
                </span>
              )}
              {vendor.address && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {vendor.address}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Joined {formatDate(vendor.createdAt)}
            </p>
          </div>

          <div className="shrink-0">
            <VendorApprovalButton
              vendorId={vendor._id}
              currentStatus={vendor.status}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Products",
            value: vendor.productCount,
            icon: Package,
            color: "text-blue-600",
          },
          {
            label: "Orders",
            value: vendor.orderCount,
            icon: ShoppingBag,
            color: "text-orange-600",
          },
          {
            label: "Total Sales",
            value: vendor.totalSales,
            icon: TrendingUp,
            color: "text-green-600",
          },
          {
            label: "Rating",
            value: vendor.rating.toFixed(1),
            icon: Star,
            color: "text-yellow-500",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Revenue & commission */}
      <div className="bg-white rounded-xl border p-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-700">
          Revenue & Commission
        </h2>
        <div className="flex flex-col sm:flex-row gap-6">
          <div>
            <p className="text-xs text-gray-500 mb-1">Gross Revenue</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(vendor.totalRevenue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Platform Revenue</p>
            <p className="text-xl font-bold text-purple-700">
              {formatCurrency(
                (vendor.totalRevenue * vendor.commissionRate) / 100,
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Commission Rate</p>
            <CommissionRateForm
              vendorId={vendor._id}
              currentRate={vendor.commissionRate}
            />
          </div>
        </div>
      </div>

      {/* Products link */}
      <div className="bg-white rounded-xl border p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">
            Browse vendor&apos;s products
          </p>
          <p className="text-xs text-gray-400">
            {vendor.productCount} products listed
          </p>
        </div>
        <Link
          href={`/admin/products?vendorId=${vendor._id}`}
          className="text-sm text-purple-600 hover:text-purple-800 font-medium"
        >
          View products →
        </Link>
      </div>
    </div>
  );
}
