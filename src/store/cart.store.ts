import { ICartItem } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_QUANTITY = 10;

interface ICartState {
  items: ICartItem[];
  addItem: (item: ICartItem) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (
    productId: string,
    variantId: string,
    quantity: number,
  ) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<ICartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.productId === newItem.productId &&
              i.variantId === newItem.variantId,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === newItem.productId &&
                i.variantId === newItem.variantId
                  ? {
                      ...i,
                      quantity: Math.min(
                        i.quantity + newItem.quantity,
                        MAX_QUANTITY,
                      ),
                    }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                ...newItem,
                quantity: Math.min(newItem.quantity, MAX_QUANTITY),
              },
            ],
          };
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId),
          ),
        }));
      },

      updateQuantity: (productId, variantId, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity: Math.min(quantity, MAX_QUANTITY) }
              : i,
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
      getTotalPrice: () =>
        get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),
    }),
    { name: "zentrix-cart" },
  ),
);
