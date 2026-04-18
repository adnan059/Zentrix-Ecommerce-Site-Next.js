"use client";

import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { PlusCircle, Trash2 } from "lucide-react";
import { productSchema, ProductInput } from "@/lib/validations/product.schema";
import {
  createProductAction,
  updateProductAction,
} from "@/lib/actions/vendor-product.actions";
import { PlainCategory, PlainProduct } from "@/types";
import ImageUploader from "./image-uploader";

interface Props {
  categories: PlainCategory[];
  product?: PlainProduct; // present on edit
}

const emptyVariant = {
  label: "",
  sku: "",
  price: 0,
  compareAtPrice: undefined,
  stock: 0,
  specs: {},
};

export default function ProductForm({ categories, product }: Props) {
  const router = useRouter();
  const isEditing = !!product;

  const {
    register,
    control,
    handleSubmit,
    setValue,

    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          categoryId:
            typeof product.categoryId === "object"
              ? (product.categoryId as { _id: string })._id
              : product.categoryId,
          description: product.description,
          brand: product.brand,
          images: product.images,
          variants: product.variants.map((v) => ({
            _id: v._id,
            label: v.label,
            sku: v.sku,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            stock: v.stock,
            specs: v.specs ?? {},
          })),
          tags: product.tags,
          warranty: product.warranty ?? "",
          status: product.status,
        }
      : {
          name: "",
          categoryId: "",
          description: "",
          brand: "",
          images: [],
          variants: [{ ...emptyVariant }],
          tags: [],
          warranty: "",
          status: "draft",
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const images = useWatch({ control, name: "images" });
  const tagsRaw = useWatch({ control, name: "tags" });

  const { execute: createExec, isPending: createPending } = useAction(
    createProductAction,
    {
      onSuccess: () => {
        toast.success("Product created!");
        router.push("/vendor/products");
      },
      onError: ({ error }) =>
        toast.error(error.serverError ?? "Failed to create product"),
    },
  );

  const { execute: updateExec, isPending: updatePending } = useAction(
    updateProductAction,
    {
      onSuccess: () => {
        toast.success("Product updated!");
        router.push("/vendor/products");
      },
      onError: ({ error }) =>
        toast.error(error.serverError ?? "Failed to update product"),
    },
  );

  const isPending = createPending || updatePending;

  const onSubmit = (data: ProductInput) => {
    if (isEditing && product) {
      updateExec({ ...data, productId: product._id });
    } else {
      createExec(data);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic info */}
      <div className="bg-white rounded-xl border p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Basic Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              {...register("name")}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Intel Core i9-14900K"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              {...register("categoryId")}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-red-500 text-xs mt-1">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand *
            </label>
            <input
              {...register("brand")}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Intel"
            />
            {errors.brand && (
              <p className="text-red-500 text-xs mt-1">
                {errors.brand.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              {...register("description")}
              rows={4}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Detailed product description..."
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Warranty
            </label>
            <input
              {...register("warranty")}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 3 Years Official"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma-separated)
            </label>
            <input
              value={tagsRaw?.join(", ") ?? ""}
              onChange={(e) =>
                setValue(
                  "tags",
                  e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                )
              }
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. intel, processor, gaming"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              {...register("status")}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-xl border p-5 space-y-3">
        <h2 className="font-semibold text-gray-900">Product Images *</h2>
        <p className="text-xs text-gray-500">
          First image is the main image. Up to 8 images.
        </p>
        <ImageUploader
          value={images}
          onChange={(urls) => setValue("images", urls)}
          maxImages={8}
          folder="zentrix/products"
        />
        {errors.images && (
          <p className="text-red-500 text-xs">{errors.images.message}</p>
        )}
      </div>

      {/* Variants */}
      <div className="bg-white rounded-xl border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Variants *</h2>
          <button
            type="button"
            onClick={() => append({ ...emptyVariant })}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <PlusCircle className="w-4 h-4" />
            Add Variant
          </button>
        </div>

        {errors.variants?.root && (
          <p className="text-red-500 text-xs">{errors.variants.root.message}</p>
        )}

        <div className="space-y-4">
          {fields.map((field, idx) => (
            <div
              key={field.id}
              className="border rounded-lg p-4 space-y-3 relative"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Variant {idx + 1}
                </span>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Label *
                  </label>
                  <input
                    {...register(`variants.${idx}.label`)}
                    className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 16GB / OEM Box"
                  />
                  {errors.variants?.[idx]?.label && (
                    <p className="text-red-500 text-xs mt-0.5">
                      {errors.variants[idx].label?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    SKU *
                  </label>
                  <input
                    {...register(`variants.${idx}.sku`)}
                    className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. CPU-I9-14900K-OEM"
                  />
                  {errors.variants?.[idx]?.sku && (
                    <p className="text-red-500 text-xs mt-0.5">
                      {errors.variants[idx].sku?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Price (BDT) *
                  </label>
                  <input
                    type="number"
                    {...register(`variants.${idx}.price`)}
                    className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                  {errors.variants?.[idx]?.price && (
                    <p className="text-red-500 text-xs mt-0.5">
                      {errors.variants[idx].price?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Compare At Price (BDT)
                  </label>
                  <input
                    type="number"
                    {...register(`variants.${idx}.compareAtPrice`)}
                    className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Strike-through price"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Stock *
                  </label>
                  <input
                    type="number"
                    {...register(`variants.${idx}.stock`)}
                    className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                  {errors.variants?.[idx]?.stock && (
                    <p className="text-red-500 text-xs mt-0.5">
                      {errors.variants[idx].stock?.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {isPending
            ? isEditing
              ? "Saving..."
              : "Creating..."
            : isEditing
              ? "Save Changes"
              : "Create Product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/vendor/products")}
          className="px-6 py-2.5 rounded-lg font-medium text-sm border text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
