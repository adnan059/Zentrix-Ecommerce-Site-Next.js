import { connectDB } from "../db/connect";
import { Order } from "../db/models/order.model";

export const getOrdersByUser = async (userId: string) => {
  await connectDB();
  const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(orders));
};

export const getOrderById = async (id: string) => {
  await connectDB();
  const order = await Order.findById(id).lean();
  return JSON.parse(JSON.stringify(order));
};
