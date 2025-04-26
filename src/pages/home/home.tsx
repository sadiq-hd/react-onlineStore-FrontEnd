import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useProductManagement } from '../../typerScript/useProductManagement';
import ProductImageCarousel from '../../components/ProductImageCarousel';
import { ProductCategory, PRODUCT_CATEGORIES } from '../../types/product';
import { Product } from '../../types/product'; 

import offerImg from '../../assets/offer.png';
import phoneoffer from '../../assets/phoneoffer.png';
import SaudiRiyal from "../../assets/Saudi_Riyal.png";

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
    loading
  } = useProductManagement();

  // Get featured products (first 4 products)
  const featuredProducts = filteredProducts.slice(0, 4);
  
  // Get products by category (for featured categories)
  const getFeaturedCategoryProducts = (category: ProductCategory): Product[] => {
    return filteredProducts
      .filter(product => product.category === category)
      .slice(0, 4);
  };
  
  // Featured categories to display on homepage
  const featuredCategories = PRODUCT_CATEGORIES.slice(0, 3) as ProductCategory[];

  const handleAddToCartWithToast = (product: Product): void => {
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

  // Product card component to avoid repetition
  const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <div 
      className="group bg-white rounded-xl shadow-sm hover:shadow-md
                border border-gray-100 overflow-hidden
                animate-fadeIn opacity-0 transition-all duration-300 flex flex-col"
    >
      {/* قسم الصورة */}
      <div className="relative overflow-hidden bg-gray-50">
        {/* شارة المخزون */}
        <div className="absolute top-2 right-2 z-10">
          {product.stock > 10 ? (
            <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full shadow-sm">
              متوفر
            </span>
          ) : product.stock > 0 ? (
            <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full shadow-sm">
              كمية محدودة
            </span>
          ) : (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full shadow-sm">
              نفذ المخزون
            </span>
          )}
        </div>

        <ProductImageCarousel
          images={product.images}
          productName={product.name}
        />

        {/* زر المفضلة */}
        <button 
          onClick={() => handleFavorite(product)}
          className={`absolute top-2 left-2 z-10 p-1.5 rounded-full 
                    shadow-sm
                    ${favorites.includes(product.id) 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white/90 text-gray-500 hover:bg-white hover:text-red-500'}
                    transition-colors duration-300`}
          aria-label={favorites.includes(product.id) ? "إزالة من المفضلة" : "إضافة للمفضلة"}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5"
            fill={favorites.includes(product.id) ? 'currentColor' : 'none'}
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* محتوى المنتج */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow min-h-[180px]">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm sm:text-base font-bold text-gray-800 line-clamp-2 
                        hover:text-purple-600 transition-colors duration-300 mb-1">
            {product.name}
          </h3>
        </Link>

        <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
          {product.description}
        </p>

        {/* قسم عرض السعر والخصم */}
        <div className="mt-auto mb-3">
          {product.hasDiscount ? (
            <div className="flex flex-col">
              <div className="flex items-center mb-1">
                <span className="text-sm line-through text-gray-500 ml-2">
                  {product.price.toLocaleString('ar-SA')}
                </span>
                <img src={SaudiRiyal} alt="SAR" className="w-4 h-4" />
              </div>
              <div className="flex items-center flex-wrap gap-1">
                <span className="text-lg font-bold text-green-600">
                  {product.discountedPrice?.toLocaleString('ar-SA')}
                </span>
                <img src={SaudiRiyal} alt="SAR" className="w-5 h-5" />
                <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full mx-1">
                  {product.discountType === 'Percentage' ? `${product.discountValue}%` : `خصم ${product.discountValue} ريال`}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-purple-600">
                {product.price.toLocaleString('ar-SA')}
              </span>
              <img src={SaudiRiyal} alt="SAR" className="w-5 h-5" />
            </div>
          )}

          {product.stock <= 10 && product.stock > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-gray-500">المخزون:</span>
              <span className="text-xs font-medium text-red-600">
                {product.stock}
              </span>
            </div>
          )}
        </div>

        {/* زر إضافة للسلة */}
        <button 
          onClick={() => isProductAvailable(product) && handleAddToCartWithToast(product)}
          disabled={!isProductAvailable(product)}
          className={`w-full px-3 py-1.5 sm:py-2 rounded-lg 
                    transition-all duration-300
                    flex items-center justify-center gap-1.5
                    ${isProductAvailable(product)
                      ? 'bg-purple-600 hover:bg-purple-700 active:scale-95'
                      : 'bg-purple-300 cursor-not-allowed'
                    } 
                    text-white mt-auto`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 sm:h-5 sm:w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
            />
          </svg>
          <span className="text-xs sm:text-sm">
            {isProductAvailable(product) ? 'إضافة للسلة' : 'غير متوفر'}
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 rtl">

      {/* شريط البحث */}
      <div className="flex justify-center mb-6 sm:mb-8">
        <div className="w-full max-w-2xl bg-white p-2 sm:p-3 rounded-xl shadow-md flex gap-2 sm:gap-4 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن منتجات..."
            className="flex-1 p-2 sm:p-3 text-sm sm:text-base border border-gray-200 rounded-lg 
                      focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
          />
          
          {/* أيقونة التحميل */}
          {loading && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* زر البحث */}
          <button 
            onClick={() => searchQuery && setSearchQuery('')}
            className="bg-purple-600 text-white p-2 sm:p-3 rounded-lg hover:bg-purple-700 
                      transition-colors duration-300 shadow-sm hover:shadow-md"
          >
            {searchQuery ? (
              // أيقونة المسح
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 sm:h-6 sm:w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // أيقونة البحث
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 sm:h-6 sm:w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* بانر إعلاني رئيسي */}
      <div className="mb-8 rounded-lg overflow-hidden shadow-md border border-gray-200">
        <div className="relative">
          {/* الصورة بإطار كامل - صورة مختلفة للشاشات الصغيرة */}
          <div className="w-full">
            {/* صورة للشاشات الكبيرة */}
            <img 
              src={offerImg} 
              alt="عروض خاصة" 
              className="w-full object-cover hidden sm:block" 
              style={{ height: "200px" }}
            />
            
            {/* صورة للشاشات الصغيرة */}
            <img 
              src={phoneoffer} 
              alt="عروض خاصة للجوال" 
              className="w-full object-cover sm:hidden" 
              style={{ height: "150px" }}
            />
          </div>
          {/* النص مع زر التسوق - على يمين الصورة للشاشات الكبيرة */}
          <div className="sm:absolute sm:top-0 sm:right-0 sm:h-full sm:flex sm:items-center hidden">
            <div className="p-6 mr-8 rounded-lg bg-purple-900 bg-opacity-80 text-right">
              <h2 className="text-2xl font-bold mb-2 text-white">عروض حصرية لفترة محدودة</h2>
              <p className="text-purple-100 mb-4 text-base">تسوق الآن واحصل على خصم يصل إلى 70%</p>
              <button className="bg-white text-purple-700 px-5 py-2 rounded-lg font-medium hover:bg-purple-100 transition-colors duration-300 text-base">
                تسوق الآن
              </button>
            </div>
          </div>
          
          {/* النص مع زر التسوق - في الوسط أسفل الصورة للشاشات الصغيرة */}
          <div className="sm:hidden mt-2">
            <div className="p-3 rounded-lg bg-purple-900 bg-opacity-80 text-center mx-auto">
              <h2 className="text-lg font-bold mb-1 text-white">عروض حصرية لفترة محدودة</h2>
              <p className="text-purple-100 mb-2 text-sm">تسوق الآن واحصل على خصم يصل إلى 70%</p>
              <button className="bg-white text-purple-700 px-3 py-1 rounded-lg font-medium hover:bg-purple-100 transition-colors duration-300 text-sm">
                تسوق الآن
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* خصائص المتجر */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-white rounded-lg p-3 flex items-center gap-3 shadow-sm border border-gray-100">
          <div className="bg-purple-100 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-800">شحن سريع</p>
            <p className="text-xs text-gray-500">توصيل بين يوم الى 3 أيام</p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 flex items-center gap-3 shadow-sm border border-gray-100">
          <div className="bg-purple-100 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-800">ضمان الجودة</p>
            <p className="text-xs text-gray-500">منتجات أصلية 100%</p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 flex items-center gap-3 shadow-sm border border-gray-100">
          <div className="bg-purple-100 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-800">الدفع الآمن</p>
            <p className="text-xs text-gray-500">طرق دفع متعددة</p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 flex items-center gap-3 shadow-sm border border-gray-100">
          <div className="bg-purple-100 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-800">دعم فني</p>
            <p className="text-xs text-gray-500">على مدار الساعة</p>
          </div>
        </div>
      </div>

      {/* قسم المنتجات المميزة */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            منتجات مميزة
          </h2>
          <Link to="/products" className="text-purple-600 text-sm font-medium hover:text-purple-800 transition-colors flex items-center gap-1">
            عرض الكل
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>


      {/* أقسام المنتجات حسب الفئات - عرض مختصر لكل فئة */}
      {featuredCategories.map((category) => {
        const categoryProducts = getFeaturedCategoryProducts(category);
        
        if (categoryProducts.length === 0) return null;
        
        return (
          <div key={category} className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
                </svg>
                {category}
              </h2>
              <Link 
                to={`/products?category=${category}`} 
                className="text-purple-600 text-sm font-medium hover:text-purple-800 transition-colors flex items-center gap-1"
              >
                عرض الكل
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        );
      })}

      {/* بانر اشتراك نشرة بريدية */}
     
        </div>
 
  );
};

export default Home;