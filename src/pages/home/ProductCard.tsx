// src/components/home/ProductCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types/product';
import ProductImageCarousel from '../../components/ProductImageCarousel';
import SaudiRiyal from "../../assets/Saudi_Riyal.png";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onAddToFavorite: (product: Product) => void;
  isInFavorites: boolean;
  isAvailable: boolean;
  index: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onAddToFavorite,
  isInFavorites,
  isAvailable,
  index
}) => {
  return (
    <div 
      className="group bg-white rounded-xl shadow-sm hover:shadow-xl 
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

        {/* زر المفضلة محسن */}
        <button 
          onClick={() => onAddToFavorite(product)}
          className={`absolute top-2 left-2 z-10 p-1.5 rounded-full 
                   ${isInFavorites 
                     ? 'bg-red-500 text-white' 
                     : 'bg-white/80 text-gray-500 hover:bg-white hover:text-red-500'}
                   transition-colors duration-300 shadow-sm`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5"
            fill={isInFavorites ? 'currentColor' : 'none'}
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* محتوى المنتج */}
      <div className="p-3 sm:p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm sm:text-base font-bold text-gray-800 line-clamp-2 
                       hover:text-purple-600 transition-colors duration-300 mb-1">
            {product.name}
          </h3>
        </Link>

        <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* قسم عرض السعر والخصم */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="space-y-0.5">
            {product.hasDiscount ? (
              <div className="flex flex-col">
                <div className="flex items-center mb-1">
                  <span className="text-sm line-through text-gray-500 ml-2">
                    {product.price.toLocaleString('ar-SA')}
                  </span>
                  <img src={SaudiRiyal} alt="SAR" className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-lg sm:text-xl font-bold text-green-600">
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
                <span className="text-lg sm:text-xl font-bold text-purple-600">
                  {product.price.toLocaleString('ar-SA')}
                </span>
                <img src={SaudiRiyal} alt="SAR" className="w-5 h-5" />
              </div>
            )}

            {product.stock <= 10 && product.stock > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">المخزون:</span>
                <span className="text-xs font-medium text-red-600">
                  {product.stock}
                </span>
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={() => isAvailable && onAddToCart(product)}
          disabled={!isAvailable}
          className={`w-full px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg 
                    transition-all duration-300
                    flex items-center justify-center gap-1.5 mt-3
                    ${isAvailable
                      ? 'bg-purple-600 hover:bg-purple-700 active:scale-95'
                      : 'bg-purple-300 cursor-not-allowed'
                    } 
                    text-white`}
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
            {isAvailable ? 'إضافة للسلة' : 'غير متوفر'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;