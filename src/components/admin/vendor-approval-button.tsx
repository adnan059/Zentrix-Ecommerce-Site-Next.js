"use client";
// src/components/admin/vendor-approval-button.tsx

import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import {
  approveVendorAction,
  suspendVendorAction,
  reactivateVendorAction,
} from "@/lib/actions/admin.actions";
import type { VendorStatus } from "@/types";
import { CheckCircle, RefreshCw, XCircle } from "lucide-react";

export default function VendorApprovalButton({
  vendorId,
  currentStatus,
}: {
  vendorId: string;
  currentStatus: VendorStatus;
}) {
  const { execute: approve, isPending: approvePending } = useAction(
    approveVendorAction,
    {
      onSuccess: () => toast.success("Vendor approved"),
      onError: ({ error }) => toast.error(error.serverError ?? "Failed"),
    },
  );

  const { execute: suspend, isPending: suspendPending } = useAction(
    suspendVendorAction,
    {
      onSuccess: () => toast.success("Vendor suspended"),
      onError: ({ error }) => toast.error(error.serverError ?? "Failed"),
    },
  );

  const { execute: reactivate, isPending: reactivatePending } = useAction(
    reactivateVendorAction,
    {
      onSuccess: () => toast.success("Vendor reactivated"),
      onError: ({ error }) => toast.error(error.serverError ?? "Failed"),
    },
  );

  const isPending = approvePending || suspendPending || reactivatePending;

  if (currentStatus === "pending") {
    return (
      <button
        onClick={() => approve({ vendorId })}
        disabled={isPending}
        className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <CheckCircle className="w-4 h-4" />
        {approvePending ? "Approving…" : "Approve Vendor"}
      </button>
    );
  }

  if (currentStatus === "approved") {
    return (
      <button
        onClick={() => suspend({ vendorId })}
        disabled={isPending}
        className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <XCircle className="w-4 h-4" />
        {suspendPending ? "Suspending…" : "Suspend Vendor"}
      </button>
    );
  }

  if (currentStatus === "suspended") {
    return (
      <button
        onClick={() => reactivate({ vendorId })}
        disabled={isPending}
        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        {reactivatePending ? "Reactivating…" : "Reactivate Vendor"}
      </button>
    );
  }

  return null;
}
