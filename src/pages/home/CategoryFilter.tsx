// src/components/home/CategoryFilter.tsx
import React from 'react';
import { ProductCategory, PRODUCT_CATEGORIES } from '../../types/product';

interface CategoryFilterProps {
  selectedCategory: ProductCategory | null;
  onCategoryChange: (category: ProductCategory | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onCategoryChange }) => {
  return (
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
            onClick={() => onCategoryChange(null)}
          >
            الكل
          </button>
          {PRODUCT_CATEGORIES.map((category) => (
            <button
              key={category}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg transition-colors 
                        ${selectedCategory === category
                          ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => onCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;