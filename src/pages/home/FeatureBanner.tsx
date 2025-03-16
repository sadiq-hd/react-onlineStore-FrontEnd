// src/components/home/FeatureBanner.tsx
import React from 'react';

interface FeatureBannerProps {
  mainImageUrl: string;
  mobileImageUrl: string;
  title: string;
  description: string;
  buttonText: string;
  onButtonClick?: () => void;
}

const FeatureBanner: React.FC<FeatureBannerProps> = ({
  mainImageUrl,
  mobileImageUrl,
  title,
  description,
  buttonText,
  onButtonClick
}) => {
  return (
    <div className="mb-8 rounded-xl overflow-hidden shadow-lg relative">

        
        {/* محتوى البانر */}
        <div className="absolute inset-0 flex items-center justify-end pr-4 sm:pr-10">
          <div className="bg-purple-900 bg-opacity-80 p-4 sm:p-6 rounded-lg text-right max-w-md">
            <span className="inline-block bg-yellow-500 text-white text-xs px-2 py-1 rounded-full mb-2">
              حصري لفترة محدودة
            </span>
            <h2 className="text-xl sm:text-3xl font-bold mb-2 text-white">{title}</h2>
            <p className="text-purple-100 mb-4 text-sm sm:text-base">
              {description}
            </p>
            <button 
              onClick={onButtonClick} 
              className="bg-white text-purple-700 px-4 sm:px-6 py-2 rounded-lg font-medium hover:bg-purple-100 transition-colors duration-300 text-sm sm:text-base flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              {buttonText}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
 );
};

export default FeatureBanner;