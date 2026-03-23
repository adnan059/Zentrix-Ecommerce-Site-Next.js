import { Document, model, Model, models, Schema, Types } from "mongoose";

export interface IReview extends Document {
  productId: Types.ObjectId;
  userId: Types.ObjectId;
  orderId: Types.ObjectId;
  rating: number;
  title: string;
  body: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, maxlength: 100 },
    body: { type: String, required: true, maxlength: 2000 },
    isVerifiedPurchase: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// One review per user per product
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
ReviewSchema.index({ productId: 1, isApproved: 1, rating: -1 });

export const Review: Model<IReview> =
  models.Review || model<IReview>("Review", ReviewSchema);
