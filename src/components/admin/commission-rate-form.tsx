"use client";
// src/components/admin/commission-rate-form.tsx

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { updateCommissionRateAction } from "@/lib/actions/admin.actions";
import { Check, Pencil, X } from "lucide-react";

export default function CommissionRateForm({
  vendorId,
  currentRate,
}: {
  vendorId: string;
  currentRate: number;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentRate.toString());

  const { execute, isPending } = useAction(updateCommissionRateAction, {
    onSuccess: () => {
      toast.success("Commission rate updated");
      setEditing(false);
    },
    onError: ({ error }) =>
      toast.error(error.serverError ?? "Failed to update rate"),
  });

  const handleSave = () => {
    const rate = parseFloat(value);
    if (isNaN(rate) || rate < 0 || rate > 50) {
      toast.error("Rate must be between 0 and 50");
      return;
    }
    execute({ vendorId, commissionRate: rate });
  };

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold text-gray-900">
          {currentRate}%
        </span>
        <button
          onClick={() => setEditing(true)}
          className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors"
          title="Edit commission rate"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        max={50}
        step={0.5}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-20 border rounded-lg px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
        autoFocus
      />
      <span className="text-sm text-gray-500">%</span>
      <button
        onClick={handleSave}
        disabled={isPending}
        className="p-1.5 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => {
          setValue(currentRate.toString());
          setEditing(false);
        }}
        className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
