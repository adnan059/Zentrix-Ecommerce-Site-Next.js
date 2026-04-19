// src/app/(admin)/layout.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminNav from "./admin-nav";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "layoutDashboard" },
  { href: "/admin/vendors", label: "Vendors", icon: "store" },
  { href: "/admin/products", label: "Products", icon: "package" },
  { href: "/admin/users", label: "Users", icon: "users" },
  { href: "/admin/orders", label: "Orders", icon: "shoppingBag" },
  { href: "/admin/reviews", label: "Reviews", icon: "star" },
  { href: "/admin/analytics", label: "Analytics", icon: "barChart3" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/");

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav navItems={navItems} />
      <div className="max-w-7xl mx-auto px-4 py-6 md:flex md:gap-6">
        <aside className="hidden md:block w-56 shrink-0">
          <AdminNav navItems={navItems} variant="sidebar" />
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
