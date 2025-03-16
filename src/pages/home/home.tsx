// src/pages/home/home.tsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { productService } from '../../services/productService';
import { useProductManagement } from '../../typerScript/useProductManagement';
import { Product } from '../../types/product';

// مكونات الصفحة الرئيسية
import SearchBar from '../home/SearchBar';
import FeatureBanner from '../home/FeatureBanner';
import StoreFeatures from '../home/StoreFeatures';
import CategorySection from '../home/CategorySection';
import ProductStrip from '../home/ProductStrip';
import NewsletterSection from '../home/NewsletterSection';

// الصور
import offerImg from '../../assets/offer.png';
import phoneoffer from '../../assets/phoneoffer.png';

// واجهة لوصف البيانات المستخدمة
interface CategoryStatistics {
  name: string;
  count: number;
  icon: string;
}

// واجهة لمنتج مع الإحصائيات
interface TopSellingProduct {
  id: number;
  name: string;
  sales: number;
  revenue: number;
}

const Home: React.FC = () => {
  const {
    favorites,
    selectedCategory,
    handleFavorite,
    handleAddToCart,
    isProductAvailable,
    handleCategoryChange,
    filteredProducts,
    searchQuery,
    setSearchQuery,
    loading: productsLoading,
    products: allProducts,
  } = useProductManagement();

  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([]);
  const [topSellingProducts, setTopSellingProducts] = useState<Product[]>([]);
  const [newArrivalsProducts, setNewArrivalsProducts] = useState<Product[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStatistics[]>([]);
  
  // حالات التحميل والأخطاء
  const [discountedLoading, setDiscountedLoading] = useState(true);
  const [topSellingLoading, setTopSellingLoading] = useState(true);
  const [newArrivalsLoading, setNewArrivalsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  const [discountedError, setDiscountedError] = useState<string | null>(null);
  const [topSellingError, setTopSellingError] = useState<string | null>(null);
  const [newArrivalsError, setNewArrivalsError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // دالة لإضافة منتج للسلة مع عرض رسالة توست
  const handleAddToCartWithToast = (product: Product) => {
    try {
      handleAddToCart(product);
      toast.success(`تمت إضافة 1 من ${product.name} للسلة`, {
        position: "bottom-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error('حدث خطأ أثناء إضافة المنتج للسلة');
    }
  };

  // استدعاء بيانات المنتجات المخفضة
  useEffect(() => {
    const fetchDiscountedProducts = async () => {
      try {
        setDiscountedLoading(true);
        setDiscountedError(null);
        const discounted = await productService.getProductsWithDiscounts();
        setDiscountedProducts(discounted.filter(product => product.hasDiscount));
      } catch (error) {
        console.error("Error fetching discounted products:", error);
        setDiscountedError('فشل في تحميل المنتجات المخفضة');
        // استخدام بيانات احتياطية
        setDiscountedProducts(allProducts.slice(0, 4));
      } finally {
        setDiscountedLoading(false);
      }
    };

    fetchDiscountedProducts();
  }, [allProducts]);

  // استدعاء بيانات المنتجات الأكثر مبيعاً
  useEffect(() => {
    const fetchTopSellingProducts = async () => {
      try {
        setTopSellingLoading(true);
        setTopSellingError(null);
        
        // محاولة الحصول على المنتجات الأكثر مبيعاً
        let topProducts: Product[] = [];
        
        try {
          // محاولة استدعاء واجهة الـ API
          const topSelling = await productService.getTopSellingProducts(4);
          
          // إذا نجحت العملية، نستدعي بيانات المنتجات كاملة
          const topSellingDetails = await Promise.all(
            topSelling.map(item => productService.getProductById(item.id))
          );
          
          topProducts = topSellingDetails;
        } catch (apiError) {
          console.error("API Error:", apiError);
          // استخدام بيانات من قائمة المنتجات المحلية بترتيب عشوائي
          topProducts = [...allProducts]
            .sort(() => 0.5 - Math.random())
            .slice(0, 4);
        }
        
        setTopSellingProducts(topProducts);
      } catch (error) {
        console.error("Error fetching top selling products:", error);
        setTopSellingError('فشل في تحميل المنتجات الأكثر مبيعاً');
        // استخدام بيانات احتياطية من المنتجات
        setTopSellingProducts(allProducts.slice(0, 4));
      } finally {
        setTopSellingLoading(false);
      }
    };

    if (allProducts.length > 0) {
      fetchTopSellingProducts();
    }
  }, [allProducts]);

  // استدعاء بيانات المنتجات الجديدة
  useEffect(() => {
    const fetchNewArrivalsProducts = async () => {
      try {
        setNewArrivalsLoading(true);
        setNewArrivalsError(null);
        
        // تصنيف المنتجات حسب تاريخ الإضافة
        const sorted = [...allProducts].sort((a, b) => {
          // إذا لم يكن هناك تاريخ، نستخدم قيمة افتراضية
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        
        setNewArrivalsProducts(sorted.slice(0, 4));
      } catch (error) {
        console.error("Error processing new arrivals:", error);
        setNewArrivalsError('فشل في تحميل المنتجات الجديدة');
        // استخدام بيانات احتياطية
        setNewArrivalsProducts(allProducts.slice(0, 4));
      } finally {
        setNewArrivalsLoading(false);
      }
    };

    if (allProducts.length > 0) {
      fetchNewArrivalsProducts();
    }
  }, [allProducts]);

  // استدعاء بيانات فئات المنتجات
  useEffect(() => {
    const fetchCategoryStats = async () => {
      try {
        setCategoriesLoading(true);
        setCategoriesError(null);
        
        // جلب إحصائيات الفئات
        const stats = await productService.getProductStats();
        if (stats?.productsByCategory) {
          // تحويل البيانات إلى الشكل المطلوب مع إضافة أيقونات
          const categoryData = stats.productsByCategory.map(category => {
            // تعيين أيقونة مختلفة لكل فئة
            let icon = "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10";
            
            if (category.category === "الإلكترونيات") {
              icon = "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z";
            } else if (category.category === "الملابس") {
              icon = "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z";
            } else if (category.category === "المنزل") {
              icon = "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6";
            } else if (category.category === "سماعات") {
              icon = "M12 18.5a6.5 6.5 0 0 0 0-13M19 12a7 7 0 0 1-7 7m7-7a7 7 0 0 0-7-7M3 12h4m14 0h-4";
            } else if (category.category === "ساعات") {
              icon = "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z";
            } else if (category.category === "شواحن") {
              icon = "M13 10V3L4 14h7v7l9-11h-7z";
            } else if (category.category === "حقائب") {
              icon = "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7";
            } else if (category.category === "مستلزمات الكمبيوتر") {
              icon = "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z";
            }
            
            return {
              name: category.category,
              count: category.count,
              icon
            };
          });
          setCategoryStats(categoryData);
        }
      } catch (error) {
        console.error("Error fetching category stats:", error);
        setCategoriesError('فشل في تحميل بيانات الفئات');
        
        // إنشاء فئات افتراضية
        const defaultCategories = [
          { name: "الإلكترونيات", count: 0, icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" },
          { name: "الملابس", count: 0, icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
          { name: "المنزل", count: 0, icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" }
        ];
        
        setCategoryStats(defaultCategories);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategoryStats();
  }, []);

  // تحقق مما إذا كان المنتج في المفضلة
  const isProductInFavorites = (productId: number): boolean => {
    return favorites.includes(productId);
  };

  // الرمز لشريط المنتجات الأكثر مبيعاً
  const topSellingIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </svg>
  );

  // الرمز لشريط المنتجات الجديدة
  const newArrivalsIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  // الرمز لشريط العروض والتخفيضات
  const discountIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 rtl">
      {/* شريط البحث */}
      <SearchBar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        loading={productsLoading} 
      />

      {/* بانر إعلاني رئيسي */}
      <FeatureBanner 
        mainImageUrl={offerImg}
        mobileImageUrl={phoneoffer}
        title="عروض نهاية العام"
        description="تسوق الآن واحصل على خصم يصل إلى 70% على جميع المنتجات"
        buttonText="تسوق الآن"
      />

      {/* قسم مميزات المتجر */}
      <StoreFeatures />

      {/* عرض فئات المنتجات */}
      {!categoriesError && categoryStats.length > 0 && (
        <CategorySection categories={categoryStats} />
      )}

      {/* شريط المنتجات المخفضة - معالجة حالة عدم وجود منتجات مخفضة */}
      {(discountedProducts?.length > 0 || discountedLoading || discountedError) && (
        <ProductStrip 
          title="عروض وتخفيضات" 
          products={discountedProducts?.slice(0, 4)} 
          viewAllLink="/products/discounted"
          emptyMessage="لا توجد عروض متاحة حالياً"
          onAddToCart={handleAddToCartWithToast}
          onAddToFavorite={handleFavorite}
          isProductInFavorites={isProductInFavorites}
          isProductAvailable={isProductAvailable}

        />
      )}
      
      {/* شريط المنتجات الأكثر مبيعاً */}
      <ProductStrip 
        title="الأكثر مبيعاً" 
        products={topSellingProducts} 
        viewAllLink="/products/top-selling"
        emptyMessage="لم يتم تحديد المنتجات الأكثر مبيعاً بعد"
        onAddToCart={handleAddToCartWithToast}
        onAddToFavorite={handleFavorite}
        isProductInFavorites={isProductInFavorites}
        isProductAvailable={isProductAvailable}
      />

      {/* شريط أحدث المنتجات */}
      <ProductStrip 
        title="وصل حديثاً" 
        products={newArrivalsProducts} 
        viewAllLink="/products/new-arrivals"
        emptyMessage="لا توجد منتجات جديدة حالياً"
        onAddToCart={handleAddToCartWithToast}
        onAddToFavorite={handleFavorite}
        isProductInFavorites={isProductInFavorites}
        isProductAvailable={isProductAvailable}
      />

      {/* قسم الاشتراك في النشرة البريدية */}
      <NewsletterSection />
    </div>
  );
};

export default Home;