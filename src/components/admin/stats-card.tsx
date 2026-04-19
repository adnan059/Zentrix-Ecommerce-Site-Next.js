// src/components/admin/stats-card.tsx
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface StatsCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  color: string;
  href?: string;
  badge?: { label: string; color: string };
}

export default function StatsCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  href,
  badge,
}: StatsCardProps) {
  const inner = (
    <div className="bg-white rounded-xl border p-5 hover:shadow-sm transition-shadow h-full">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
          {badge && (
            <span
              className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}
            >
              {badge.label}
            </span>
          )}
        </div>
        <div className={`p-2.5 rounded-lg shrink-0 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );

  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}
