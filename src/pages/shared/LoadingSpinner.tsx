// src/components/shared/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  fullScreen?: boolean;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'border-purple-500',
  fullScreen = false,
  message
}) => {
  const sizeClass = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-4'
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex flex-col items-center justify-center">
        <div className={`${sizeClass[size]} ${color} border-t-transparent rounded-full animate-spin`}></div>
        {message && <p className="mt-4 text-gray-600 font-medium">{message}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`${sizeClass[size]} ${color} border-t-transparent rounded-full animate-spin`}></div>
      {message && <p className="mt-2 text-gray-600 text-sm">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;