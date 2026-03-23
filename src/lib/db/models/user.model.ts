import { UserRole } from "@/types";
import { Document, model, Model, models, Schema, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  role: UserRole;
  vendorId?: Types.ObjectId;
  emailVerified?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxLength: [60, "Name cannot exceed 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    image: String,
    role: {
      type: String,
      enum: ["buyer", "vendor", "admin"],
      default: "buyer",
    },

    vendorId: {
      type: Types.ObjectId,
      ref: "Vendor",
    },
    emailVerified: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export const User: Model<IUser> =
  models.User || model<IUser>("User", userSchema);
