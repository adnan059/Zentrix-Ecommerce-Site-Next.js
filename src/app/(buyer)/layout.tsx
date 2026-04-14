import BuyerNav from "./buyer-nav";
const navItems = [
  { href: "/account", label: "Profile", icon: "user" },
  { href: "/orders", label: "Orders", icon: "shoppingBag" },
  { href: "/wishlist", label: "Wishlist", icon: "heart" },
  { href: "/reviews", label: "Reviews", icon: "messageSquare" },
];

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <BuyerNav navItems={navItems} />
      <div className="max-w-6xl mx-auto px-4 py-6 md:flex md:gap-8">
        <aside className="hidden md:block w-52 shrink-0">
          <BuyerNav navItems={navItems} variant="sidebar" />
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
