import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types/product';
import ProductCard from './ProductCard';

interface ProductStripProps {
  title: string;
  products: Product[];
  viewAllLink: string;
  emptyMessage?: string;
  onAddToCart: (product: Product) => void;
  onAddToFavorite: (product: Product) => void;
  isProductInFavorites: (productId: number) => boolean;
  isProductAvailable: (product: Product) => boolean;
  hideWhenEmpty?: boolean; // خاصية جديدة للتحكم في إخفاء القسم عند عدم وجود منتجات
}

const ProductStrip: React.FC<ProductStripProps> = ({
  title,
  products,
  viewAllLink,
  emptyMessage = 'لا توجد منتجات متاحة حالياً',
  onAddToCart,
  onAddToFavorite,
  isProductInFavorites,
  isProductAvailable,
  hideWhenEmpty = true // القيمة الافتراضية هي إخفاء القسم عند عدم وجود منتجات
}) => {
  // إذا كانت المنتجات غير موجودة أو فارغة وكانت خاصية الإخفاء نشطة، لا تعرض أي شيء
  if ((!products || products.length === 0) && hideWhenEmpty) {
    return null;
  }

  // إذا كانت المنتجات غير موجودة أو فارغة وخاصية الإخفاء غير نشطة، عرض رسالة فارغة
  if (!products || products.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
            </svg>
            {title}
          </h2>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
          </svg>
          {title}
        </h2>
        <Link to={viewAllLink} className="text-purple-600 text-sm font-medium hover:text-purple-800 transition-colors flex items-center gap-1">
          عرض الكل
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onAddToFavorite={onAddToFavorite}
            isInFavorites={isProductInFavorites(product.id)}
            isAvailable={isProductAvailable(product)}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductStrip;