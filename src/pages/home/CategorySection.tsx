// src/components/home/CategorySection.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface Category {
  name: string;
  count: number;
  icon: string;
}

interface CategorySectionProps {
  categories: Category[];
}

const CategorySection: React.FC<CategorySectionProps> = ({ categories }) => {
  if (!categories || categories.length === 0) {
    return null;
  }
  
  // إجمالي عدد المنتجات في جميع الفئات
  const totalProducts = categories.reduce((total, category) => total + category.count, 0);
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        اكتشف الفئات
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* زر الكل (فئة افتراضية) */}
        <Link 
          to="/products"
          className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow text-center group"
        >
          <div className="w-16 h-16 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <h3 className="font-medium text-gray-800 group-hover:text-purple-600 transition-colors">
            الكل
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {totalProducts} منتج
          </p>
        </Link>
        
        {/* الفئات العادية */}
        {categories.map((category) => (
          <Link 
            key={category.name} 
            to={`/category/${category.name}`}
            className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow text-center group"
          >
            <div className="w-16 h-16 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              {/* أيقونة للفئة */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={category.icon} />
              </svg>
            </div>
            <h3 className="font-medium text-gray-800 group-hover:text-purple-600 transition-colors">
              {category.name}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {category.count} منتج
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategorySection;