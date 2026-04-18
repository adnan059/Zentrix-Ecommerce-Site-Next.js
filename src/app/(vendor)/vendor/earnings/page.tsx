import { auth } from "@/auth";
import { getVendorByUserId, getVendorEarnings } from "@/lib/data/vendor";
import { formatCurrency } from "@/lib/utils/format";
import {
  BadgeDollarSign,
  TrendingUp,
  Percent,
  ShoppingBag,
  Package,
} from "lucide-react";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Earnings - Zentrix Vendor" };

export default async function VendorEarningsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const vendor = await getVendorByUserId(session.user.id);
  if (!vendor) redirect("/");

  const earnings = await getVendorEarnings(vendor._id, vendor.commissionRate);

  const cards = [
    {
      label: "Total Revenue",
      value: formatCurrency(earnings.totalRevenue),
      sub: "Gross sales before commission",
      icon: TrendingUp,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Platform Commission",
      value: formatCurrency(earnings.platformFee),
      sub: `${earnings.commissionRate}% of gross sales`,
      icon: Percent,
      color: "text-red-500 bg-red-50",
    },
    {
      label: "Net Earnings",
      value: formatCurrency(earnings.netEarnings),
      sub: "After commission deduction",
      icon: BadgeDollarSign,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Orders",
      value: earnings.totalOrders,
      sub: "Paid orders containing your items",
      icon: ShoppingBag,
      color: "text-purple-600 bg-purple-50",
    },
    {
      label: "Items Sold",
      value: earnings.totalItemsSold,
      sub: "Total quantity sold",
      icon: Package,
      color: "text-orange-600 bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border p-5">
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
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
        <p className="text-sm text-amber-700">
          <strong>Payout information:</strong> Earnings are settled monthly.
          Contact support to configure your payout bank account.
        </p>
      </div>
    </div>
  );
}
