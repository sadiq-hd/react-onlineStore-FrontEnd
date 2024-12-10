import React from 'react';
import { useHome } from '../../typerScript/useHome';

const Home: React.FC = () => {
  const {
    currentImageIndex,
    nextImage,
    prevImage,
    setCurrentImageIndex,
    favorites,
    selectedCategory,
    handleFavorite,
    handleAddToCart,
    isProductAvailable,
    handleCategoryChange,
    filteredProducts,
    uniqueCategories
  } = useHome();

  return (
    <div className="container mx-auto px-4 py-8 rtl">
      {/* شريط البحث */}
      <div className="flex justify-center mb-8">
        <div className="w-full max-w-2xl flex space-x-4 rtl:space-x-reverse">
          <input
            type="text"
            placeholder="ابحث هنا..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* فلتر التصنيف */}
      <div className="flex justify-center mb-8 px-4">
        <div className="flex flex-wrap justify-center gap-2">
          <button
            className={`px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-base rounded-lg transition-colors ${
              selectedCategory === null
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => handleCategoryChange(null)}
          >
            الكل
          </button>
          {uniqueCategories.map(category => (
            <button
              key={category}
              className={`px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-base rounded-lg transition-colors ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>


{/* شبكة المنتجات */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {filteredProducts.map((product) => (
    <div key={product.id} 
         className="group bg-white rounded-2xl shadow-sm hover:shadow-xl 
                  transition-all duration-300 border border-gray-100 overflow-hidden">
      {/* قسم الصورة */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* شارة المخزون */}
        <div className="absolute top-3 right-3 z-10">
          {product.stock > 10 ? (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              متوفر
            </span>
          ) : product.stock > 0 ? (
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
              كمية محدودة
            </span>
          ) : (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              نفذ المخزون
            </span>
          )}
        </div>
              
              <img 
                src={product.images[currentImageIndex[product.id] || 0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 
                         group-hover:scale-110"
              />
              
              {/* أزرار التنقل بين الصور */}
              <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 
                            group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    prevImage(product.id, product.images.length);
                  }}
                  className="bg-white/90 text-gray-800 w-8 h-8 rounded-full flex items-center 
                            justify-center hover:bg-white transition-colors shadow-lg"
                >
                  &#10094;
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    nextImage(product.id, product.images.length);
                  }}
                  className="bg-white/90 text-gray-800 w-8 h-8 rounded-full flex items-center 
                            justify-center hover:bg-white transition-colors shadow-lg"
                >
                  &#10095;
                </button>
              </div>

              {/* مؤشرات الصور */}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 
                              ${(currentImageIndex[product.id] || 0) === index 
                                ? 'bg-white w-3' 
                                : 'bg-white/60'}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentImageIndex(prev => ({
                        ...prev,
                        [product.id]: index
                      }));
                    }}
                  />
                ))}
              </div>
            </div>
            
            {/* محتوى المنتج */}
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-gray-800 hover:text-blue-600 
                             transition-colors duration-300">
                  {product.name}
                </h3>
                <button 
                  onClick={() => handleFavorite(product)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-6 w-6 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                    />
                  </svg>
                </button>
              </div>

              <p className="text-gray-600 text-sm mb-4">
                {product.description}
              </p>

              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <span className="text-2xl font-bold text-blue-600">
                    {new Intl.NumberFormat('ar-SA', {
                      style: 'currency',
                      currency: 'SAR'
                    }).format(product.price)}
                  </span>
                  <div className="flex items-center gap-1">
                    {product.stock <= 10 && (
                      <>
                        <span className="text-sm text-gray-500">المخزون:</span>
                        <span className="text-sm font-medium text-red-600">
                          {product.stock}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => isProductAvailable(product) && handleAddToCart(product)}
                  className={`px-6 py-2.5 rounded-lg transition-all duration-300
                              flex items-center gap-2
                              ${isProductAvailable(product)
                                ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                  disabled={!isProductAvailable(product)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" 
                       fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {isProductAvailable(product) ? 'إضافة للسلة' : 'غير متوفر'}
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