import { PlainOrder } from "@/types";
import { connectDB } from "../db/connect";
import { Order } from "../db/models/order.model";

export const getOrdersByUser = async (
  userId: string,
): Promise<PlainOrder[]> => {
  await connectDB();
  const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(orders));
};

export const getOrderById = async (
  id: string,
  userId?: string,
): Promise<PlainOrder | null> => {
  await connectDB();
  const query = userId ? { _id: id, userId } : { _id: id };
  const order = await Order.findOne(query).lean();
  return order ? JSON.parse(JSON.stringify(order)) : null;
};

export const hasUserPurchasedProduct = async (
  userId: string,
  productId: string,
): Promise<boolean> => {
  await connectDB();
  const order = await Order.findOne({
    userId,
    "items.productId": productId,
    paymentStatus: "paid",
    status: { $in: ["processing", "shipped", "delivered"] },
  })
    .select("_id")
    .lean();

  return !!order;
};

export const getOrderIdForReview = async (
  userId: string,
  productId: string,
): Promise<string | null> => {
  await connectDB();
  const order = await Order.findOne({
    userId,
    "items.productId": productId,
    paymentStatus: "paid",
  })
    .select("_id")
    .lean();
  return order ? order._id.toString() : null;
};
