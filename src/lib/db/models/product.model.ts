import { ProductStatus } from "@/types";
import { Schema, Document, Model, Types, models, model } from "mongoose";

export interface IVariant {
  _id: Types.ObjectId;
  label: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  specs: Map<string, string>;
}

const variantSchema = new Schema<IVariant>(
  {
    label: { type: String, required: true },
    sku: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    specs: { type: Map, of: String, default: {} },
  },
  { _id: true },
);

export interface IProduct extends Document {
  vendorId: Types.ObjectId;
  categoryId: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  brand: string;
  images: string[];
  variants: Types.DocumentArray<IVariant>;
  basePrice: number;
  status: ProductStatus;
  isFeatured: boolean;
  rating: number;
  totalReviews: number;
  totalSales: number;
  tags: string[];
  warranty?: string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [String],
      validate: {
        validator: (v: string[]) => v.length >= 1,
        message: "At least one image is required",
      },
    },
    variants: {
      type: [variantSchema],
      validate: {
        validator: (v: IVariant[]) => v.length >= 1,
        message: "At least one variant is required",
      },
    },
    basePrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    isFeatured: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    tags: [String],
    warranty: String,
  },
  { timestamps: true },
);

productSchema.index({ vendorId: 1, status: 1 });
productSchema.index({ categoryId: 1, status: 1 });
productSchema.index({ status: 1, isFeatured: 1 });
productSchema.index({ basePrice: 1 });
productSchema.index({ rating: -1 });
productSchema.index(
  { name: "text", description: "text", brand: "text", tags: "text" },
  { weights: { name: 10, brand: 8, tags: 5, description: 2 } },
);

export const Product: Model<IProduct> =
  models.Product || model<IProduct>("Product", productSchema);
