export interface CartItem {
    productId: number;
    name: string;
    price: number;
    quantity: number;
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
    updateQuantity: (productId: number, quantity: number) => Promise<void>; // إضافة هذا السطر
    fetchCart: () => Promise<void>;
    refreshCart: () => Promise<void>;
    resetCart: () => Promise<void>;
    clearCart: () => Promise<void>; 
  }