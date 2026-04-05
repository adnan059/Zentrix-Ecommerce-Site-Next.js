import { Document, model, Model, models, Schema, Types } from "mongoose";

export interface IWishlist extends Document {
  userId: Types.ObjectId;
  productIds: Types.ObjectId[];
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    productIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  {
    timestamps: true,
  },
);

export const Wishlist: Model<IWishlist> =
  models.Wishlist || model<IWishlist>("Wishlist", WishlistSchema);
