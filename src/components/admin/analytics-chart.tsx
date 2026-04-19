"use client";
// src/components/admin/analytics-chart.tsx
// Pure CSS bar chart — zero extra dependencies.

import { useState } from "react";
import type { AdminAnalyticsMonth } from "@/types/admin.types";
import { formatCurrency } from "@/lib/utils/format";

export default function AnalyticsChart({
  data,
}: {
  data: AdminAnalyticsMonth[];
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="space-y-2">
      {/* Bars */}
      <div className="flex items-end gap-1 h-48">
        {data.map((d, i) => {
          const heightPct = Math.max(
            (d.revenue / maxRevenue) * 100,
            d.revenue > 0 ? 2 : 0,
          );
          const isHovered = hovered === i;

          return (
            <div
              key={d.month}
              className="flex-1 flex flex-col items-center justify-end h-full relative"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10 bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap pointer-events-none shadow-lg">
                  <p className="font-semibold">{d.month}</p>
                  <p>{formatCurrency(d.revenue)}</p>
                  <p className="text-gray-300">
                    {d.orders} order{d.orders !== 1 ? "s" : ""}
                  </p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                </div>
              )}

              {/* Bar */}
              <div
                className={`w-full rounded-t-sm transition-colors ${
                  isHovered ? "bg-purple-600" : "bg-purple-400"
                }`}
                style={{ height: `${heightPct}%` }}
              />
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div className="flex gap-1">
        {data.map((d) => (
          <div key={d.month} className="flex-1 text-center">
            <span className="text-[10px] text-gray-400 leading-none">
              {d.month.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-right">
        Max: {formatCurrency(maxRevenue)}
      </p>
    </div>
  );
}
