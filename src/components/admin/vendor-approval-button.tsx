"use client";
// src/components/admin/vendor-approval-button.tsx
import { useState } from "react";
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
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [reason, setReason] = useState("");

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
      onSuccess: () => {
        toast.success("Vendor suspended");
        setShowReasonDialog(false);
        setReason("");
      },
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

  function handleSuspendConfirm() {
    suspend({ vendorId, reason: reason.trim() || undefined });
  }

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
      <>
        <button
          onClick={() => setShowReasonDialog(true)}
          disabled={isPending}
          className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <XCircle className="w-4 h-4" />
          Suspend Vendor
        </button>

        {/* Reason dialog */}
        {showReasonDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                Suspend Vendor
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Optionally provide a reason. It will be included in the email
                sent to the vendor.
              </p>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Repeated policy violations…"
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowReasonDialog(false);
                    setReason("");
                  }}
                  disabled={suspendPending}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSuspendConfirm}
                  disabled={suspendPending}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  {suspendPending ? "Suspending…" : "Confirm Suspend"}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
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
