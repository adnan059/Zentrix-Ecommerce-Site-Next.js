"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import {
  vendorRegisterSchema,
  VendorRegisterInput,
} from "@/lib/validations/vendor.schema";
import { registerVendorAction } from "@/lib/actions/vendor.actions";

export default function VendorRegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VendorRegisterInput>({
    resolver: zodResolver(vendorRegisterSchema),
  });

  const { execute, isPending } = useAction(registerVendorAction, {
    onSuccess: () => {
      toast.success("Application submitted! Awaiting admin approval.");
      router.push("/vendor/pending");
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Something went wrong");
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => execute(data))}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Store Name *
        </label>
        <input
          {...register("storeName")}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g. TechParts BD"
        />
        {errors.storeName && (
          <p className="text-red-500 text-xs mt-1">
            {errors.storeName.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          {...register("description")}
          rows={3}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Tell customers about your store..."
        />
        {errors.description && (
          <p className="text-red-500 text-xs mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <input
          {...register("phone")}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="+880..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Business Address
        </label>
        <input
          {...register("address")}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Street, City"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
      >
        {isPending ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  );
}
