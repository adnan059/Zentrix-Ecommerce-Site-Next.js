import { VendorStatus } from "@/types";
import { Document, model, Model, models, Schema, Types } from "mongoose";
export interface IVendor extends Document {
  userId: Types.ObjectId;
  storeName: string;
  storeSlug: string;
  description?: string;
  logo?: string;
  banner?: string;
  email: string;
  phone?: string;
  address?: string;
  status: VendorStatus;
  rating: number;
  totalReviews: number;
  totalSales: number;
  commissionRate: number; // platform takes this % from each sale
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const vendorSchema = new Schema<IVendor>(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    storeName: {
      type: String,
      required: [true, "Store name is required"],
      trim: true,
      maxLength: [80, "Store name cannot exceed 80 characters"],
    },

    storeSlug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    logo: String,
    banner: String,
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    phone: String,
    address: String,

    status: {
      type: String,
      enum: ["pending", "approved", "suspended"],
      default: "pending",
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    commissionRate: {
      type: Number,
      default: 10, // 10% platform commission by default
      min: 0,
      max: 50,
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

export const Vendor: Model<IVendor> =
  models.Vendor || model<IVendor>("Vendor", vendorSchema);
