import { auth } from "@/auth";
import { getVendorByUserId } from "@/lib/data/vendor";
import { redirect } from "next/navigation";
import VendorNav from "./vendor-nav";

const navItems = [
  { href: "/vendor/dashboard", label: "Dashboard", icon: "layoutDashboard" },
  { href: "/vendor/products", label: "Products", icon: "package" },
  { href: "/vendor/orders", label: "Orders", icon: "shoppingBag" },
  { href: "/vendor/earnings", label: "Earnings", icon: "badgeDollarSign" },
  { href: "/vendor/settings", label: "Settings", icon: "settings" },
];

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "vendor") redirect("/");

  const vendor = await getVendorByUserId(session.user.id);

  if (!vendor || vendor.status !== "approved") {
    redirect("/vendor/pending");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorNav navItems={navItems} storeName={vendor.storeName} />
      <div className="max-w-7xl mx-auto px-4 py-6 md:flex md:gap-6">
        <aside className="hidden md:block w-56 shrink-0">
          <VendorNav
            navItems={navItems}
            variant="sidebar"
            storeName={vendor.storeName}
          />
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
