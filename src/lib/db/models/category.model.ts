import { Document, model, Model, models, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;

  specSchema: {
    key: string;
    label: string;
    type: "text" | "number" | "select";
    options?: string[];
    unit?: string;
    filterable: boolean;
  }[];
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    description: String,
    image: String,

    specSchema: [
      {
        key: { type: String, required: true },
        label: { type: String, required: true },
        type: {
          type: String,
          enum: ["text", "number", "select"],
          default: "text",
        },
        options: [String],
        unit: String,
        filterable: { type: Boolean, default: false },
      },
    ],

    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Category: Model<ICategory> =
  models.Category || model<ICategory>("Category", categorySchema);
