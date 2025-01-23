import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../config/axios';
import { CartItem, CartContextType, CartState } from '../typerScript/cart';
import { productService } from '../services/productService';

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

export const CartContext = createContext<CartContextType | undefined>(undefined);

type CartAction =
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_CART' }
  | { type: 'UPDATE_CART_ITEM'; payload: { productId: number; quantity: number } };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        items: action.payload,
        total: calculateTotal(action.payload),
        loading: false,
        error: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'RESET_CART':
      return {
        items: [],
        total: 0,
        loading: false,
        error: null
      };
    case 'UPDATE_CART_ITEM':
      const updatedItems = state.items.map(item =>
        item.productId === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems)
      };
    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    loading: false,
    error: null
  });

  const fetchCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const cartItems = await productService.getCart();
      dispatch({ type: 'SET_CART', payload: cartItems });
    } catch (error: any) {
      const errorMessage = error.response?.data || 'فشل في تحميل السلة';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  const addToCart = async (productId: number, quantity: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await api.post('/api/Cart/add', { productId, quantity });
      // تحديث مؤقت للسلة محلياً
      dispatch({
        type: 'UPDATE_CART_ITEM',
        payload: { productId, quantity: (state.items.find(item => item.productId === productId)?.quantity || 0) + quantity }
      });
      // ثم جلب البيانات المحدثة من السيرفر
      await fetchCart();
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || 'فشل في إضافة المنتج';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const removeFromCart = async (productId: number, quantity: number = 1) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await api.delete(`/api/Cart/remove/${productId}/${quantity}`);
      // تحديث مؤقت للسلة محلياً
      const currentItem = state.items.find(item => item.productId === productId);
      if (currentItem) {
        const newQuantity = currentItem.quantity - quantity;
        if (newQuantity <= 0) {
          dispatch({
            type: 'SET_CART',
            payload: state.items.filter(item => item.productId !== productId)
          });
        } else {
          dispatch({
            type: 'UPDATE_CART_ITEM',
            payload: { productId, quantity: newQuantity }
          });
        }
      }
      await fetchCart();
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || 'فشل في إزالة المنتج';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      if (quantity <= 0) {
        await removeFromCart(productId, 1);
      } else {
        try {
          await api.put(`/api/Cart/update/${productId}`, { quantity });
          dispatch({
            type: 'UPDATE_CART_ITEM',
            payload: { productId, quantity }
          });
        } catch {
          await api.delete(`/api/Cart/remove/${productId}/999999`);
          await api.post('/api/Cart/add', { productId, quantity });
        }
      }
      await fetchCart();
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || 'فشل في تحديث الكمية';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const resetCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.post('/api/Cart/clear');
      }
      dispatch({ type: 'RESET_CART' });
    } catch (error: any) {
      const errorMessage = error.response?.data || 'فشل في مسح السلة';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  const refreshCart = async () => {
    await fetchCart();
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const currentUser = localStorage.getItem('currentUser');
      const token = localStorage.getItem('token');
      if (!currentUser || !token) {
        dispatch({ type: 'RESET_CART' });
      } else {
        fetchCart();
      }
    };

    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');
    if (currentUser && token) {
      fetchCart();
    } else {
      dispatch({ type: 'RESET_CART' });
    }
  }, []);

  return (
    <CartContext.Provider value={{
      state,
      addToCart,
      removeFromCart,
      updateQuantity,
      fetchCart,
      refreshCart,
      resetCart,
      clearCart: async () => {
        await resetCart();
      }, // Add this line
    }}>

   
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};