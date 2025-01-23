import React from 'react';
import { useProductManagement } from '../../typerScript/useProductManagement';
import ProductImageCarousel from '../../components/ProductImageCarousel';
import { ProductCategory, PRODUCT_CATEGORIES } from '../../types/product';


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

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 rtl">
    {/* شريط البحث */}
<div className="flex justify-center mb-6 sm:mb-8">
  <div className="w-full max-w-2xl flex gap-2 sm:gap-4 relative">
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="ابحث هنا..."
      className="flex-1 p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg 
                focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
    />
    
    {/* أيقونة التحميل */}
    {loading && (
      <div className="absolute left-3 top-1/2 -translate-y-1/2">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )}

    {/* زر البحث */}
    <button 
      onClick={() => searchQuery && setSearchQuery('')}
      className="bg-blue-600 text-white p-2 sm:p-3 rounded-lg hover:bg-blue-700 
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

      {/* فلتر التصنيف */}
      <div className="mb-6 sm:mb-8 px-2">
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
          <button
            className={`px-2.5 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg transition-colors 
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
              className={`px-2.5 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg transition-colors 
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

      {/* شبكة المنتجات */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
        {filteredProducts.map((product, index) => (
          <div 
            key={product.id} 
            className="group bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl 
                    transition-all duration-300 border border-gray-100 overflow-hidden
                    animate-fadeIn opacity-0"
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: 'forwards'
            }}
          >
        {/* قسم الصورة */}
<div className="relative overflow-hidden">
  {/* شارة المخزون */}
  <div className="absolute top-2 right-2 z-10">
    {product.stock > 10 ? (
      <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[10px] sm:text-xs">
        متوفر
      </span>
    ) : product.stock > 0 ? (
      <span className="bg-yellow-500 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[10px] sm:text-xs">
        كمية محدودة
      </span>
    ) : (
      <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[10px] sm:text-xs">
        نفذ المخزون
      </span>
    )}
  </div>

  <ProductImageCarousel
    images={product.images}
    productName={product.name}
  />
</div>
            {/* محتوى المنتج */}
            <div className="p-3 sm:p-4">
              <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="text-sm sm:text-base font-bold text-gray-800 line-clamp-2 
                           hover:text-blue-600 transition-colors duration-300">
                  {product.name}
                </h3>
                <button 
                  onClick={() => handleFavorite(product)}
                  className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-5 w-5 sm:h-6 sm:w-6 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                {product.description}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-lg sm:text-xl font-bold text-blue-600 block">
                    {new Intl.NumberFormat('ar-SA', {
                      style: 'currency',
                      currency: 'SAR'
                    }).format(product.price)}
                  </span>
                  {product.stock <= 10 && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">المخزون:</span>
                      <span className="text-xs font-medium text-red-600">
                        {product.stock}
                      </span>
                    </div>
                  )}
                </div>

                <button 
  onClick={() => isProductAvailable(product) && handleAddToCart(product)}
  disabled={!isProductAvailable(product)}
  className={`w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg 
              transition-all duration-300
              flex items-center justify-center gap-1.5
              ${isProductAvailable(product)
                ? 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                : 'bg-blue-600/50'  // استخدام نفس اللون مع شفافية
              } 
              text-white`}  // نقل لون النص خارج الشرط للتوحيد
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;