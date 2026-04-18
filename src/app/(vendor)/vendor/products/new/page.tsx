import ProductForm from "@/components/vendor/product-form";
import { getAllCategories } from "@/lib/data/categories";

import { Metadata } from "next";

export const metadata: Metadata = { title: "Add Product - Zentrix Vendor" };

export default async function NewProductPage() {
  const categories = await getAllCategories();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
