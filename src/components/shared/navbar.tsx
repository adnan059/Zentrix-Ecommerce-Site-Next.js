"use client";

import { ICategory } from "@/lib/db/models/category.model";
import { Cpu, Menu, ShoppingCart, User } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface INavbarProps {
  categories: ICategory[];
}

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { logoutAction } from "@/lib/actions/auth.actions";

const Navbar = ({ categories }: INavbarProps) => {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Cpu className="w-6 h-6 text-blue-600" />
            <span>Zentrix</span>
          </Link>

          {/* Category nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/products"
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              All Products
            </Link>
            {categories.slice(0, 5).map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                {cat.name}
              </Link>
            ))}
            {categories.length > 5 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    More <Menu className="ml-1 w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {categories.slice(5).map((cat) => (
                    <DropdownMenuItem key={cat.slug} asChild>
                      <Link href={`/category/${cat.slug}`}>{cat.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link href={"/cart"}>
              <Button variant={"ghost"} size={"icon"} aria-label="Cart">
                <ShoppingCart className="w-5 h-5" />
              </Button>
            </Link>

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Account">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {session.user.name}
                  </div>
                  <div className="px-2 py-1 text-xs text-gray-500">
                    {session.user.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account">My Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">My Orders</Link>
                  </DropdownMenuItem>
                  {session.user.role === "vendor" && (
                    <DropdownMenuItem asChild>
                      <Link href="/vendor/dashboard">Vendor Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  {session.user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/dashboard">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 cursor-pointer"
                    onClick={() => logoutAction()}
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href={"/login"}>
                <Button size={"sm"}>Sign in</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
