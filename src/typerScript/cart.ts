// في ملف typerScript/cart.ts
export type DiscountType = 'Percentage' | 'FixedAmount';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  hasDiscount?: boolean;
  discountedPrice?: number;
  discountValue?: number;
  discountType?: DiscountType;
  discountName?: string;
  originalPrice?: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
  loading: boolean;
  error: string | null;
}

export interface CartContextType {
  state: CartState;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  fetchCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  resetCart: () => Promise<void>;
  clearCart: () => Promise<void>;
}

export const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    const priceToUse = item.hasDiscount && item.discountedPrice !== undefined 
      ? item.discountedPrice 
      : item.price;
    return total + (priceToUse * item.quantity);
  }, 0);
};