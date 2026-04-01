// src/lib/db/models/order.model.ts
import { Schema, Document, Model, Types, model } from "mongoose";
import type { OrderStatus, PaymentStatus } from "@/types";
import { models } from "mongoose";

/* ───────────────── order item interface ───────────────── */

export interface IOrderItem {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  variantId: Types.ObjectId;
  vendorId: Types.ObjectId;
  name: string;
  variantLabel: string;
  sku: string;
  image: string;
  price: number;
  quantity: number;
  subtotal: number;
  status: OrderStatus;
  trackingNumber?: string;
}

/* ───────────────── order item schema ───────────────── */

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: Schema.Types.ObjectId, required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    name: { type: String, required: true },
    variantLabel: { type: String, required: true },
    sku: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true },
    // Per-item fulfillment — vendor updates this independently
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    trackingNumber: { type: String },
  },
  { _id: true },
);

/* ───────────────── order interface ───────────────── */

export interface IOrder extends Document {
  userId: Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    district: string;
    postalCode?: string;
  };
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: "aamarpay" | "cod";
  transactionId?: string;
  valId?: string; // aamarpay validation ID
  paidAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/* ───────────────── order schema ───────────────── */

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      default: undefined,
      validate: {
        validator: (v: IOrderItem[]) => Array.isArray(v) && v.length >= 1,
        message: "Order must have at least one item",
      },
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      district: { type: String, required: true },
      postalCode: { type: String },
    },
    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    paymentMethod: {
      type: String,
      enum: ["aamarpay", "cod"],
      required: true,
    },
    transactionId: { type: String },
    valId: { type: String },
    paidAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true },
);

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ "items.vendorId": 1, status: 1 });
OrderSchema.index({ transactionId: 1 });
OrderSchema.index({ status: 1, paymentStatus: 1 });

export const Order: Model<IOrder> =
  models.Order || model<IOrder>("Order", OrderSchema);
