// src/components/reviews/RatingStars.tsx
import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
  onChange?: (rating: number) => void;
}

const RatingStars: React.FC<RatingStarsProps> = ({ 
  rating, 
  size = 'md', 
  editable = false,
  onChange 
}) => {
  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleClick = (selectedRating: number) => {
    if (editable && onChange) {
      onChange(selectedRating);
    }
  };

  return (
    <div className="flex rtl">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          className={`${editable ? 'cursor-pointer' : 'cursor-default'} ml-1`}
          disabled={!editable}
          title={editable ? `قيم ${star} من 5` : undefined}
        >
          <Star
            className={`${starSizes[size]} ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            } transition-colors ${editable && 'hover:text-yellow-500'}`}
          />
        </button>
      ))}
    </div>
  );
};

export default RatingStars;