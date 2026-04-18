"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import {
  vendorSettingsSchema,
  VendorSettingsInput,
} from "@/lib/validations/vendor.schema";
import { updateVendorSettingsAction } from "@/lib/actions/vendor.actions";
import { PlainVendor } from "@/types";
import ImageUploader from "./image-uploader";

export default function VendorSettingsForm({
  vendor,
}: {
  vendor: PlainVendor;
}) {
  const {
    register,
    handleSubmit,
    setValue,

    control,
    formState: { errors },
  } = useForm<VendorSettingsInput>({
    resolver: zodResolver(vendorSettingsSchema),
    defaultValues: {
      storeName: vendor.storeName,
      description: vendor.description ?? "",
      logo: vendor.logo ?? "",
      banner: vendor.banner ?? "",
      phone: vendor.phone ?? "",
      address: vendor.address ?? "",
    },
  });

  const logo = useWatch({ control, name: "logo" });
  const banner = useWatch({ control, name: "banner" });

  const { execute, isPending } = useAction(updateVendorSettingsAction, {
    onSuccess: () => toast.success("Settings updated"),
    onError: ({ error }) =>
      toast.error(error.serverError ?? "Failed to update"),
  });

  return (
    <form
      onSubmit={handleSubmit((data) => execute(data))}
      className="space-y-6"
    >
      <div className="bg-white rounded-xl border p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Store Information</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Store Name *
          </label>
          <input
            {...register("storeName")}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            {...register("phone")}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            {...register("address")}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Store Branding</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Store Logo
          </label>
          <ImageUploader
            value={logo ? [logo] : []}
            onChange={(urls) => setValue("logo", urls[0] ?? "")}
            maxImages={1}
            folder="zentrix/vendor/logos"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Store Banner
          </label>
          <ImageUploader
            value={banner ? [banner] : []}
            onChange={(urls) => setValue("banner", urls[0] ?? "")}
            maxImages={1}
            folder="zentrix/vendor/banners"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}
