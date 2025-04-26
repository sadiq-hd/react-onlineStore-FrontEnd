import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useProductManagement } from '../typerScript/useProductManagement';
import ProductImageCarousel from '../components/ProductImageCarousel';
import { ProductCategory, PRODUCT_CATEGORIES } from '../types/product';
import { Product } from '../types/product'; 
import SaudiRiyal from "../assets/Saudi_Riyal.png";

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || null;
  
  // إضافة state لتتبع ظهور المنتجات
  const [productsVisible, setProductsVisible] = useState(false);
  
  // إدارة التصنيف محلياً في هذه الصفحة بدلاً من الاعتماد على useProductManagement
  const [localCategory, setLocalCategory] = useState<ProductCategory | null>(null);
  
  const {
    products,
    favorites,
    handleFavorite,
    handleAddToCart,
    isProductAvailable,
    searchQuery,
    setSearchQuery,
    loading
  } = useProductManagement();

  // تصفية المنتجات محلياً
  const filteredProducts = products.filter(product => {
    // تصفية حسب التصنيف المحلي
    if (localCategory && product.category !== localCategory) {
      return false;
    }
    
    // تصفية حسب البحث (استخدام نفس المنطق من useProductManagement)
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // تعيين المنتجات لتكون مرئية بعد تحميل المكون
  useEffect(() => {
    const timer = setTimeout(() => {
      setProductsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // تحديد التصنيف الأولي من URL
  useEffect(() => {
    if (initialCategory) {
      // تأكد من أن التصنيف صالح قبل استخدامه
      const validCategory = PRODUCT_CATEGORIES.find(c => c === initialCategory);
      if (validCategory) {
        console.log('تعيين التصنيف المحلي الأولي:', validCategory);
        setLocalCategory(validCategory as ProductCategory);
      }
    }
  }, [initialCategory]);

  // تحديث URL عند تغيير التصنيف المحلي
  useEffect(() => {
    console.log('تحديث URL بناءً على التصنيف المحلي المحدد:', localCategory);
    if (localCategory) {
      setSearchParams({ category: localCategory });
    } else {
      setSearchParams({});
    }
  }, [localCategory, setSearchParams]);

  // تعريف دالة تغيير التصنيف المحلية
  const handleLocalCategoryChange = (category: ProductCategory | null) => {
    console.log('تغيير التصنيف المحلي إلى:', category);
    setLocalCategory(category);
  };

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

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 rtl">
      {/* رابط العودة للصفحة الرئيسية */}
      <div className="mb-4">
        <Link to="/" className="text-purple-600 hover:text-purple-800 flex items-center gap-1 font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          العودة للصفحة الرئيسية
        </Link>
      </div>
      
      {/* عنوان الصفحة */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">جميع المنتجات</h1>
        
        {/* شريط البحث */}
        <div className="w-full sm:w-auto sm:max-w-md">
          <div className="bg-white p-2 rounded-lg shadow-sm flex gap-2 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن منتجات..."
              className="flex-1 p-2 text-sm border border-gray-200 rounded-lg 
                        focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
            />
            
            {/* أيقونة التحميل */}
            {loading && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* زر البحث */}
            <button 
              onClick={() => searchQuery && setSearchQuery('')}
              className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 
                        transition-colors duration-300 shadow-sm hover:shadow-md"
            >
              {searchQuery ? (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
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
      </div>
      
      {/* فلتر التصنيف - يستخدم الآن التصنيف المحلي */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          تصفية المنتجات
        </h2>
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <div className="flex flex-wrap gap-2">
            {/* زر "الكل" - يستخدم الآن handleLocalCategoryChange */}
            <button
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg transition-colors 
                        ${localCategory === null
                          ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => handleLocalCategoryChange(null)}
            >
              الكل
            </button>
            
            {/* أزرار التصنيفات - تستخدم الآن handleLocalCategoryChange */}
            {PRODUCT_CATEGORIES.map((category) => (
              <button
                key={category}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg transition-colors 
                          ${localCategory === category
                            ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => handleLocalCategoryChange(category as ProductCategory)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* عرض حالة التحميل أو الخطأ */}
      {loading ? (
        <div className="py-10 flex justify-center items-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-10 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد منتجات</h3>
          <p className="text-gray-500">لم يتم العثور على منتجات مطابقة للبحث أو التصفية</p>
        </div>
      ) : (
        /* شبكة المنتجات */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {filteredProducts.map((product, index) => (
            <div 
              key={product.id} 
              className={`group bg-white rounded-xl shadow-sm hover:shadow-md
                        border border-gray-100 overflow-hidden
                        transition-all duration-300 flex flex-col
                        ${productsVisible ? 'opacity-100' : 'opacity-0'}`}
              style={{
                transition: 'opacity 0.5s ease-in-out',
                transitionDelay: `${index * 50}ms`
              }}
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
          ))}
        </div>
      )}
      
      {/* أزرار التنقل بين الصفحات (يمكن إضافتها لاحقاً) */}
      <div className="mt-8 flex justify-center">
        <nav className="flex items-center">
          <button className="bg-white text-gray-400 cursor-not-allowed rounded-lg p-2 shadow-sm border border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="mx-4 text-sm font-medium text-gray-700">الصفحة 1 من 1</span>
          <button className="bg-white text-gray-400 cursor-not-allowed rounded-lg p-2 shadow-sm border border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </nav>
      </div>

      {/* معلومات التصحيح للمساعدة في استكشاف الأخطاء */}
      {(window as any).__DEV__ && (
  <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs">
    <p>التصنيف المحلي: {localCategory || 'الكل'}</p>
    <p>عدد المنتجات المعروضة: {filteredProducts.length}</p>
    <p>إجمالي المنتجات: {products.length}</p>
  </div>
)}
    </div>
  );
};

export default ProductsPage;