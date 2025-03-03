import { useState, useEffect, useCallback } from 'react';
import { wishlistService, FavoriteItem } from '../services/wishlistService';
import { toast } from 'react-toastify';

interface FavoritesState {
  items: FavoriteItem[];
  loading: boolean;
  error: string | null;
}

export const useFavorites = () => {
  const [state, setState] = useState<FavoritesState>({
    items: [],
    loading: true,
    error: null
  });

  // إضافة حالة لمراقبة تسجيل الدخول
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));

  // دالة لتحديث حالة التوثيق
  const checkAuthStatus = useCallback(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  // دالة لإعادة تحميل المفضلة
  const refreshFavorites = useCallback(async () => {
    if (!localStorage.getItem('token')) {
      setState({
        items: [],
        loading: false,
        error: null
      });
      return;
    }
    
    setState(prevState => ({ ...prevState, loading: true, error: null }));
    
    try {
      const items = await wishlistService.getWishlist();
      setState({
        items,
        loading: false,
        error: null
      });
    } catch (error: any) {
      setState({
        items: [],
        loading: false,
        error: error.message || 'حدث خطأ أثناء تحميل المفضلة'
      });
    }
  }, []);

  // تحميل المفضلة عند تحميل المكون وعند تغير حالة تسجيل الدخول
  useEffect(() => {
    checkAuthStatus();
    
    if (isAuthenticated) {
      refreshFavorites();
    } else {
      setState({
        items: [],
        loading: false,
        error: null
      });
    }
    
    // إنشاء مستمع لأحداث تغيير المخزن المحلي (localStorage)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        checkAuthStatus();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // اشتراك في الأحداث المخصصة لتسجيل الدخول/الخروج
    const handleLoginEvent = () => {
      checkAuthStatus();
      refreshFavorites();
    };
    
    window.addEventListener('user:login', handleLoginEvent);
    window.addEventListener('user:logout', handleLoginEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('user:login', handleLoginEvent);
      window.removeEventListener('user:logout', handleLoginEvent);
    };
  }, [isAuthenticated, refreshFavorites, checkAuthStatus]);

  // إضافة منتج للمفضلة
  const addToFavorites = async (productId: number) => {
    try {
      await wishlistService.addToWishlist(productId);
      
      // إعادة تحميل المفضلة لتحديث القائمة
      refreshFavorites();
      
      toast.success('تمت إضافة المنتج إلى المفضلة');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'فشل في إضافة المنتج إلى المفضلة');
      return false;
    }
  };

  // إزالة منتج من المفضلة
  const removeFromFavorites = async (productId: number) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      
      // تحديث القائمة محليًا لتجنب إعادة الطلب
      setState(prevState => ({
        ...prevState,
        items: prevState.items.filter(item => item.id !== productId)
      }));
      
      toast.success('تمت إزالة المنتج من المفضلة');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'فشل في إزالة المنتج من المفضلة');
      return false;
    }
  };

  // التحقق مما إذا كان المنتج في المفضلة
  const isInFavorites = (productId: number): boolean => {
    return state.items.some(item => item.id === productId);
  };

  return {
    state,
    addToFavorites,
    removeFromFavorites,
    isInFavorites,
    refreshFavorites
  };
};