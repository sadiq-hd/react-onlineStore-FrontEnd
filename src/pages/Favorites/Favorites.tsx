import React, { useEffect, useState } from 'react';
import { Spinner } from '../../components/spinner';
import { useFavorites } from '../../typerScript/useFavorites';
import { FavoriteItem } from '../../services/wishlistService';
import { Heart, Trash2, ImageOff } from 'lucide-react';

// تغيير مصدر الصورة البديلة إلى عنصر بديل محلي
const NoImagePlaceholder = () => (
  <div className="w-full h-full flex items-center justify-center bg-gray-100">
    <div className="text-center">
      <ImageOff className="w-12 h-12 mx-auto text-gray-400 mb-2" />
      <p className="text-gray-500 text-sm">لا توجد صورة</p>
    </div>
  </div>
);

const Favorites: React.FC = () => {
  const { state: { items, loading, error }, removeFromFavorites, refreshFavorites } = useFavorites();
  const [isRemoving, setIsRemoving] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem('token'));

  // مراقبة تغيرات تسجيل الدخول
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };

    // التحقق من حالة تسجيل الدخول عند تحميل المكون
    checkLoginStatus();

    // إعادة تحميل المفضلة عند تغير حالة تسجيل الدخول
    if (isLoggedIn) {
      refreshFavorites();
    }

    // إنشاء مستمع لأحداث تسجيل الدخول/الخروج
    window.addEventListener('storage', checkLoginStatus);
    
    // تنظيف المستمع عند إزالة المكون
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, [isLoggedIn, refreshFavorites]);

  const handleImageError = (itemId: number) => {
    setImageErrors(prev => new Set([...prev, itemId]));
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-auto max-w-2xl mt-8">
        <p className="text-red-600 text-center">{error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">قائمة المفضلة فارغة</h2>
          <p className="text-gray-500">لم تقم بإضافة أي منتجات إلى المفضلة بعد</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">المفضلة</h1>
        <span className="bg-purple-100 text-purple-800 rounded-full px-3 py-1 text-sm">
          {items.length} {items.length === 1 ? 'منتج' : 'منتجات'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item: FavoriteItem) => (
          <div 
            key={item.id} 
            className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1"
          >
            <div className="relative w-full pt-[75%]">
              {imageErrors.has(item.id) ? (
                <div className="absolute inset-0">
                  <NoImagePlaceholder />
                </div>
              ) : (
                <img 
                  src={item.imageUrl}
                  alt={item.name}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                  onError={() => handleImageError(item.id)}
                />
              )}
            </div>

            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 line-clamp-2 min-h-[3.5rem]">{item.name}</h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
              <p className="text-purple-600 font-bold mb-4">
                {new Intl.NumberFormat('ar-SA', {
                  style: 'currency',
                  currency: 'SAR'
                }).format(item.price)}
              </p>

              <button 
                onClick={() => {
                  setIsRemoving(item.id);
                  removeFromFavorites(item.id).finally(() => setIsRemoving(null));
                }}
                disabled={isRemoving === item.id}
                className={`
                  w-full flex items-center justify-center gap-2 
                  px-4 py-2 rounded-lg
                  ${isRemoving === item.id 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200'
                  }
                  transition-colors duration-200
                `}
              >
                {isRemoving === item.id ? (
                  <Spinner />
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    <span>إزالة من المفضلة</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorites;