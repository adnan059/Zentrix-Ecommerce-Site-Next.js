import { auth } from "@/auth";
import WishlistGrid from "@/components/account/wishlist-grid";
import { getWishList } from "@/lib/data/wishlist";
import { Heart } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My Wishlist - Zentrix",
};

export default async function WishlistPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const products = await getWishList(session.user.id);

  if (products.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <Heart className="w-16 h-16 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-700">
          Your wishlist is empty
        </h2>
        <p className="text-gray-500">
          Save products you love — click the heart icon on any product.
        </p>
        <Link
          href="/products"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        My Wishlist{" "}
        <span className="text-gray-400 font-normal text-lg">
          ({products.length})
        </span>
      </h1>
      <WishlistGrid products={products} />
    </div>
  );
}
