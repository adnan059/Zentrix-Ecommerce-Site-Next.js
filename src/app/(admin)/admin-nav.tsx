"use client";
// src/app/(admin)/admin-nav.tsx

import { cn } from "@/lib/utils";
import {
  BarChart3,
  LayoutDashboard,
  LucideIcon,
  Package,
  Shield,
  ShoppingBag,
  Star,
  Store,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const iconMap: Record<string, LucideIcon> = {
  layoutDashboard: LayoutDashboard,
  store: Store,
  package: Package,
  users: Users,
  shoppingBag: ShoppingBag,
  star: Star,
  barChart3: BarChart3,
};

export default function AdminNav({
  navItems,
  variant = "mobile",
}: {
  navItems: NavItem[];
  variant?: "mobile" | "sidebar";
}) {
  const pathname = usePathname();

  if (variant === "sidebar") {
    return (
      <nav className="space-y-1 sticky top-24">
        <div className="flex items-center gap-2 px-3 py-3 mb-2">
          <Shield className="w-5 h-5 text-purple-600 shrink-0" />
          <span className="font-semibold text-sm text-gray-900">
            Admin Panel
          </span>
        </div>
        {navItems.map(({ href, label, icon }) => {
          const Icon = iconMap[icon];
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-purple-50 text-purple-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="md:hidden flex border-b overflow-x-auto bg-white sticky top-0 z-10">
      {navItems.map(({ href, label, icon }) => {
        const Icon = iconMap[icon];
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-3 text-xs whitespace-nowrap shrink-0 transition-colors",
              isActive
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-600 hover:text-purple-600",
            )}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
