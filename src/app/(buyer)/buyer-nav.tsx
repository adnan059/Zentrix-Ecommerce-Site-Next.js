"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  Heart,
  MessageSquare,
  User,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: string; // ✅ changed
}

// ✅ map icons here
const iconMap: Record<string, LucideIcon> = {
  user: User,
  shoppingBag: ShoppingBag,
  heart: Heart,
  messageSquare: MessageSquare,
};

export default function BuyerNav({
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
        {navItems.map(({ href, label, icon }) => {
          const Icon = iconMap[icon]; // ✅ resolve here
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 font-medium"
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
        const Icon = iconMap[icon]; // ✅ resolve here
        const isActive = pathname === href;

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-3 text-xs whitespace-nowrap shrink-0 transition-colors",
              isActive
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600",
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
