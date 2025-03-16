// src/components/home/PromoBanner.tsx
import React from 'react';

interface PromoBannerProps {
  title: string;
  subtitle: string;
  buttonText: string;
  onButtonClick?: () => void;
  imageSrc?: string;
}

const PromoBanner: React.FC<PromoBannerProps> = ({
  title,
  subtitle,
  buttonText,
  onButtonClick,
  imageSrc
}) => {
  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg overflow-hidden shadow-md border border-purple-200">
        <div className="flex flex-col sm:flex-row items-center p-6">
          <div className="flex-1 text-center sm:text-right mb-4 sm:mb-0">
            <h3 className="text-lg sm:text-xl font-bold text-purple-800 mb-2">{title}</h3>
            <p className="text-sm text-purple-700 mb-4">{subtitle}</p>
            <button 
              onClick={onButtonClick}
              className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors duration-300 shadow-md"
            >
              {buttonText}
            </button>
          </div>
          {imageSrc && (
            <div className="hidden sm:block w-1/3">
              <img src={imageSrc} alt={title} className="w-full h-auto rounded-lg shadow-sm" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;