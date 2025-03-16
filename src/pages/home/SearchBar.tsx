// src/components/home/SearchBar.tsx
import React from 'react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  loading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery, loading }) => {
  return (
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
  );
};

export default SearchBar;