import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product, CartItem, ProductVariant } from "@/types";

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  
  // Actions
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  removeItem: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number, maxStock?: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (isOpen: boolean) => void;
  
  // Getters (computed as values)
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,

      addItem: (product, quantity = 1, requestedVariant) => {
        const variant =
          requestedVariant ??
          product.variants?.find((candidate) => candidate.isActive && candidate.stock > 0);
        if (!variant) return;

        const currentItems = get().items;
        const existingItem = currentItems.find(
          (item) => item.variant?.id === variant.id,
        );

        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;
          const finalQuantity = Math.min(newQuantity, variant.stock);
          
          set({
            items: currentItems.map((item) =>
              item.variant?.id === variant.id
                ? { ...item, quantity: finalQuantity }
                : item
            ),
          });
        } else {
          const finalQuantity = Math.min(quantity, variant.stock);
          set({
            items: [...currentItems, { product, variant, quantity: finalQuantity }],
          });
        }

        set({ isCartOpen: true });
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter(
            (item) => (item.variant?.id ?? item.product.id) !== productId,
          ),
        });
      },

      updateQuantity: (productId, quantity, maxStock) => {
        if (quantity < 1) {
          get().removeItem(productId);
          return;
        }

        // Apply maxStock if provided
        const finalQuantity = maxStock !== undefined ? Math.min(quantity, maxStock) : quantity;

        set({
          items: get().items.map((item) =>
            (item.variant?.id ?? item.product.id) === productId
              ? { ...item, quantity: finalQuantity }
              : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      setCartOpen: (isOpen) => set({ isCartOpen: isOpen }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0);
      },
    }),
    {
      name: "shopping-cart-storage", // key in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
