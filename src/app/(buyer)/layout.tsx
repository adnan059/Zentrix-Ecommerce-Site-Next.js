// src/app/(buyer)/layout.tsx
import Link from "next/link";
import { ShoppingBag, Heart, MessageSquare, User } from "lucide-react";

const navItems = [
  { href: "/account", label: "Profile", icon: User },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/reviews", label: "Reviews", icon: MessageSquare },
];

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Mobile tab bar */}
      <nav className="md:hidden flex border-b overflow-x-auto bg-white sticky top-0 z-10">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 px-4 py-3 text-xs text-gray-600 hover:text-blue-600 whitespace-nowrap shrink-0"
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6 md:flex md:gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-52 shrink-0">
          <nav className="space-y-1 sticky top-24">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
