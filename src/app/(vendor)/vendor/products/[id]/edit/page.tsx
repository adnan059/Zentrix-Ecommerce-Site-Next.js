import { auth } from "@/auth";
import { getVendorByUserId, getVendorProductById } from "@/lib/data/vendor";
import { getAllCategories } from "@/lib/data/categories";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ProductForm from "@/components/vendor/product-form";

export const metadata: Metadata = { title: "Edit Product - Zentrix Vendor" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const vendor = await getVendorByUserId(session.user.id);
  if (!vendor) redirect("/");

  const { id } = await params;
  const [product, categories] = await Promise.all([
    getVendorProductById(id, vendor._id),
    getAllCategories(),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
