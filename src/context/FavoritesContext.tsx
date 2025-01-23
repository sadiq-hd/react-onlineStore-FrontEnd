// src/context/FavoritesContext.tsx
import React, { createContext, useReducer, useEffect } from 'react';
import { wishlistService, type FavoriteItem } from '../services/wishlistService';

interface FavoritesState {
  items: FavoriteItem[];
  loading: boolean;
  error: string | null;
}

export interface FavoritesContextType {
  state: FavoritesState;
  addToFavorites: (productId: number) => Promise<void>;
  removeFromFavorites: (productId: number) => Promise<void>;
  resetFavorites: () => Promise<void>;
}

type FavoritesAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_FAVORITES'; payload: FavoriteItem[] }
  | { type: 'REMOVE_FAVORITE'; payload: number }
  | { type: 'RESET_FAVORITES' };

const favoritesReducer = (state: FavoritesState, action: FavoritesAction): FavoritesState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_FAVORITES':
      return { ...state, items: action.payload, loading: false };
    case 'REMOVE_FAVORITE':
      return { 
        ...state, 
        items: state.items.filter(item => item.id !== action.payload),
        loading: false
      };
    case 'RESET_FAVORITES':
      return {
        items: [],
        loading: false,
        error: null
      };
    default:
      return state;
  }
};

export const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(favoritesReducer, {
    items: [],
    loading: false,
    error: null
  });

  const fetchFavorites = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const items = await wishlistService.getWishlist();
      dispatch({ type: 'SET_FAVORITES', payload: items });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'فشل في جلب قائمة المفضلة' });
    }
  };

  const addToFavorites = async (productId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await wishlistService.addToWishlist(productId);
      await fetchFavorites();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'فشل في إضافة المنتج للمفضلة' });
    }
  };

  const removeFromFavorites = async (productId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await wishlistService.removeFromWishlist(productId);
      dispatch({ type: 'REMOVE_FAVORITE', payload: productId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'فشل في حذف المنتج من المفضلة' });
    }
  };

  const resetFavorites = async () => {
    try {
        dispatch({ type: 'SET_LOADING', payload: true });
        // بدون استدعاء الخادم، فقط إعادة تعيين الحالة المحلية
        dispatch({ type: 'RESET_FAVORITES' });
    } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'فشل في مسح المفضلة' });
        throw error;
    }
};

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      fetchFavorites();
    } else {
      dispatch({ type: 'RESET_FAVORITES' });
    }
  }, []);

  return (
    <FavoritesContext.Provider value={{ 
      state, 
      addToFavorites, 
      removeFromFavorites,
      resetFavorites
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = React.useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};