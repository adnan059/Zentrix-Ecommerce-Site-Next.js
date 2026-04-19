"use client";
// src/components/admin/user-management-menu.tsx

import { useEffect, useRef, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import {
  toggleUserActiveAction,
  updateUserRoleAction,
} from "@/lib/actions/admin.actions";
import type { UserRole } from "@/types";
import {
  MoreHorizontal,
  ShieldCheck,
  ShieldOff,
  UserCheck,
  UserX,
} from "lucide-react";

export default function UserManagementMenu({
  userId,
  currentRole,
  isActive,
  isSelf,
}: {
  userId: string;
  currentRole: UserRole;
  isActive: boolean;
  isSelf: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { execute: toggleActive, isPending: togglePending } = useAction(
    toggleUserActiveAction,
    {
      onSuccess: () => {
        toast.success(isActive ? "User deactivated" : "User activated");
        setOpen(false);
      },
      onError: ({ error }) => toast.error(error.serverError ?? "Failed"),
    },
  );

  const { execute: updateRole, isPending: rolePending } = useAction(
    updateUserRoleAction,
    {
      onSuccess: () => {
        toast.success("Role updated");
        setOpen(false);
      },
      onError: ({ error }) => toast.error(error.serverError ?? "Failed"),
    },
  );

  const isPending = togglePending || rolePending;

  if (isSelf) {
    return <span className="text-xs text-gray-400 px-2">You</span>;
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={isPending}
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
      >
        <MoreHorizontal className="w-4 h-4 text-gray-500" />
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-20 bg-white border rounded-xl shadow-lg min-w-44 py-1 text-sm">
          <button
            onClick={() => toggleActive({ userId, isActive: !isActive })}
            disabled={isPending}
            className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 disabled:opacity-50 transition-colors ${isActive ? "text-red-500" : "text-green-600"}`}
          >
            {isActive ? (
              <UserX className="w-3.5 h-3.5" />
            ) : (
              <UserCheck className="w-3.5 h-3.5" />
            )}
            {isActive ? "Deactivate" : "Activate"}
          </button>
          <div className="border-t my-1" />
          {currentRole !== "admin" && (
            <button
              onClick={() => updateRole({ userId, role: "admin" })}
              disabled={isPending}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-purple-600 disabled:opacity-50 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Make Admin
            </button>
          )}
          {currentRole !== "buyer" && (
            <button
              onClick={() => updateRole({ userId, role: "buyer" })}
              disabled={isPending}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-orange-600 disabled:opacity-50 transition-colors"
            >
              <ShieldOff className="w-3.5 h-3.5" /> Demote to Buyer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
