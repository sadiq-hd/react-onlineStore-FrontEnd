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

  const handleAddToCartWithToast = (product: Product) => {
    try {
      // استدعاء دالة إضافة المنتج للسلة
      handleAddToCart(product);
      
      // عرض رسالة نجاح
      toast.success(`تمت إضافة 1 من ${product.name} للسلة`, {
        position: "bottom-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error('حدث خطأ أثناء إضافة المنتج للسلة');
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 rtl">

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
<div className="container mx-auto px-2 sm:px-4 py-2 sm:py-8 rtl">
<div className="mb-4 sm:mb-8 rounded-lg overflow-hidden shadow-md border border-gray-200">
    <div className="relative   ">
      {/* الصورة بإطار كامل - صورة مختلفة للشاشات الصغيرة */}
      <div className="w-full ">
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
          className="w-full object-cover sm:hidden  " 
          style={{ height: "150px"  }}
        />
     
      </div>
       {/* النص مع زر التسوق - على يمين الصورة للشاشات الكبيرة */}
       <div className="sm:absolute sm:top-0 sm:right-0 sm:h-full sm:flex sm:items-center hidden sm:block">
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
</div>


    
 

          
          {/* زخرفة خلفية */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500 rounded-full opacity-20"></div>
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500 rounded-full opacity-20"></div>
 
      {/* شريط البحث مع تصميم محسن */}
     

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

      {/* فلتر التصنيف مع تصميم محسن */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          تصفية المنتجات
        </h2>
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg transition-colors 
                        ${selectedCategory === null
                          ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => handleCategoryChange(null)}
            >
              الكل
            </button>
            {PRODUCT_CATEGORIES.map((category: ProductCategory) => (
              <button
                key={category}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg transition-colors 
                          ${selectedCategory === category
                            ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* بانر إعلاني ثانوي */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg overflow-hidden shadow-sm border border-purple-200">
          <div className="flex items-center p-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-purple-800 mb-1">عرض خاص على الإلكترونيات</h3>
              <p className="text-sm text-purple-700 mb-3">خصم 15% لفترة محدودة</p>
              <button className="bg-purple-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-purple-700 transition-colors duration-300">
                تسوق الآن
              </button>
            </div>
            <div className="hidden sm:block">
          
            </div>
          </div>
        </div>
      </div>

      {/* عنوان قسم المنتجات */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
          </svg>
          منتجاتنا
        </h2>
        <a href="#" className="text-purple-600 text-sm font-medium hover:text-purple-800 transition-colors flex items-center gap-1">
          عرض الكل
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>

    {/* شبكة المنتجات */}
<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
  {filteredProducts.map((product, index) => (
    <div 
      key={product.id} 
      className="group bg-white rounded-xl shadow-sm hover:shadow-md
                border border-gray-100 overflow-hidden
                animate-fadeIn opacity-0 transition-all duration-300 flex flex-col"
      style={{
        animationDelay: `${index * 50}ms`,
        animationFillMode: 'forwards'
      }}
    >
      {/* قسم الصورة - بدون تحديد ارتفاع ثابت للحفاظ على النسب الأصلية */}
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

      {/* محتوى المنتج - استخدام flex-grow و min-height لضمان مساحة كافية للمحتوى */}
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

        {/* زر إضافة للسلة - دائمًا في أسفل البطاقة */}
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
  ))}
</div>

      {/* بانر اشتراك نشرة بريدية */}
      <div className="mt-12 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-right">
              <h3 className="text-xl font-bold mb-2">اشترك في نشرتنا البريدية</h3>
              <p className="text-purple-100 text-sm">احصل على آخر العروض والتخفيضات مباشرة إلى بريدك الإلكتروني</p>
            </div>
            <div className="w-full md:w-auto">
              <div className="flex">
                <input
                  type="email"
                  placeholder="بريدك الإلكتروني"
                  className="flex-1 rounded-r-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <button
                  className="bg-white text-purple-700 hover:bg-purple-100 px-4 py-2 rounded-l-lg font-medium transition-colors"
                >
                  اشتراك
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    
    </div>
  );
};

export default Home;