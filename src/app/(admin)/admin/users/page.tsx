// src/app/(admin)/admin/users/page.tsx
import { getAdminUsers } from "@/lib/data/admin";
import { formatDate } from "@/lib/utils/format";
import { auth } from "@/auth";
import UserManagementMenu from "@/components/admin/user-management-menu";
import Pagination from "@/components/shared/pagination";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Users — Admin | Zentrix",
};

const roleStyles: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  vendor: "bg-blue-100 text-blue-700",
  buyer: "bg-gray-100 text-gray-600",
};

interface PageProps {
  searchParams: Promise<{ page?: string; role?: string; search?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const { page, role, search } = await searchParams;
  const currentPage = Number(page ?? 1);
  const session = await auth();

  const { users, totalPages, totalCount } = await getAdminUsers({
    page: currentPage,
    role,
    search,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500 text-sm mt-1">
          {totalCount} user{totalCount !== 1 ? "s" : ""} total
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4">
        <form className="flex flex-wrap gap-3">
          <input
            name="search"
            type="text"
            defaultValue={search}
            placeholder="Search name or email…"
            className="flex-1 min-w-48 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <select
            name="role"
            defaultValue={role ?? "all"}
            className="border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All roles</option>
            <option value="buyer">Buyer</option>
            <option value="vendor">Vendor</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            Filter
          </button>
          <Link
            href="/admin/users"
            className="text-sm text-gray-500 hover:text-gray-700 self-center"
          >
            Reset
          </Link>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Users className="w-10 h-10 mb-3" />
            <p className="text-sm">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-500 text-left">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Verified</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border bg-gray-100 shrink-0">
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt={user.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-400">
                              {user.name[0]?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${roleStyles[user.role] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs ${user.emailVerified ? "text-green-600" : "text-gray-400"}`}
                      >
                        {user.emailVerified ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <UserManagementMenu
                        userId={user._id}
                        currentRole={user.role}
                        isActive={user.isActive}
                        isSelf={user._id === session?.user?.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      )}
    </div>
  );
}
