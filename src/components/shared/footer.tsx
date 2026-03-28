// src/components/shared/footer.tsx
import Link from "next/link";
import { Cpu } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-lg"
            >
              <Cpu className="w-5 h-5 text-blue-600" />
              <span>Zentrix</span>
            </Link>
            <p className="text-sm text-gray-500">
              Bangladesh&apos;s trusted multi-vendor marketplace for PC
              components.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">Shop</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/products" className="hover:text-gray-900">
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/category/processor"
                  className="hover:text-gray-900"
                >
                  Processors
                </Link>
              </li>
              <li>
                <Link href="/category/ram" className="hover:text-gray-900">
                  RAM
                </Link>
              </li>
              <li>
                <Link href="/category/storage" className="hover:text-gray-900">
                  Storage
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">Account</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/account" className="hover:text-gray-900">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-gray-900">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-gray-900">
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">Sell on Zentrix</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/vendor/register" className="hover:text-gray-900">
                  Become a Vendor
                </Link>
              </li>
              <li>
                <Link href="/vendor/dashboard" className="hover:text-gray-900">
                  Vendor Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-500">
          © 2026 Zentrix. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
