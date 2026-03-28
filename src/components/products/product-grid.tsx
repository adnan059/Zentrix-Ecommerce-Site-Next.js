import { IProduct } from "@/lib/db/models/product.model";

interface IProductGridProps {
  products: IProduct[];
}

import React from "react";
import ProductCard from "./product-card";

const ProductGrid = ({ products }: IProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">No products found</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product._id?.toString()} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
