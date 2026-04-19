// src/app/(admin)/admin/analytics/page.tsx
import { getAdminAnalytics, getAdminDashboardStats } from "@/lib/data/admin";
import { formatCurrency } from "@/lib/utils/format";
import AnalyticsChart from "@/components/admin/analytics-chart";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics — Admin | Zentrix",
};

export default async function AdminAnalyticsPage() {
  const [analytics, stats] = await Promise.all([
    getAdminAnalytics(),
    getAdminDashboardStats(),
  ]);

  const totalRevenueInWindow = analytics.reduce((s, m) => s + m.revenue, 0);
  const totalOrdersInWindow = analytics.reduce((s, m) => s + m.orders, 0);
  const avgOrderValue =
    totalOrdersInWindow > 0 ? totalRevenueInWindow / totalOrdersInWindow : 0;

  const summaryCards = [
    {
      label: "GMV (12 months)",
      value: formatCurrency(totalRevenueInWindow),
      sub: "Gross merchandise value",
    },
    {
      label: "Orders (12 months)",
      value: totalOrdersInWindow.toLocaleString(),
      sub: "Paid orders in window",
    },
    {
      label: "Avg. Order Value",
      value: formatCurrency(avgOrderValue),
      sub: "GMV ÷ orders",
    },
    {
      label: "All-time GMV",
      value: formatCurrency(stats.totalRevenue),
      sub: "Since launch",
    },
    {
      label: "All-time Platform Revenue",
      value: formatCurrency(stats.platformRevenue),
      sub: "Commissions earned",
    },
    {
      label: "All-time Orders",
      value: stats.totalOrders.toLocaleString(),
      sub: "Total paid orders",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">
          Revenue and order data — last 12 months and all-time.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryCards.map(({ label, value, sub }) => (
          <div key={label} className="bg-white rounded-xl border p-5">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="bg-white rounded-xl border p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-gray-700">
            Monthly Revenue — Last 12 Months
          </h2>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-purple-400" />
            <span className="text-xs text-gray-500">Revenue (BDT)</span>
          </div>
        </div>
        <AnalyticsChart data={analytics} />
      </div>

      {/* Monthly breakdown table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="text-sm font-semibold text-gray-700">
            Monthly Breakdown
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-500 text-left">
                <th className="px-4 py-3 font-medium">Month</th>
                <th className="px-4 py-3 font-medium">Revenue</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Platform Fee (~10%)</th>
                <th className="px-4 py-3 font-medium">Avg. Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...analytics].reverse().map((m) => (
                <tr
                  key={m.month}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {m.month}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {formatCurrency(m.revenue)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{m.orders}</td>
                  <td className="px-4 py-3 text-purple-700">
                    {formatCurrency(m.platformFee)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {m.orders > 0 ? formatCurrency(m.revenue / m.orders) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t bg-gray-50 font-semibold text-gray-900">
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3">
                  {formatCurrency(totalRevenueInWindow)}
                </td>
                <td className="px-4 py-3">{totalOrdersInWindow}</td>
                <td className="px-4 py-3 text-purple-700">
                  {formatCurrency(
                    analytics.reduce((s, m) => s + m.platformFee, 0),
                  )}
                </td>
                <td className="px-4 py-3">{formatCurrency(avgOrderValue)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
