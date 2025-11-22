'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  showHalfStars?: boolean;
  showValue?: boolean;
  className?: string;
}

export function StarRating({
  rating,
  onChange,
  size = 'md',
  interactive = false,
  showHalfStars = false,
  showValue = false,
  className = '',
}: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState(0);

  // Size mapping
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const starSize = sizeClasses[size];

  // Handle click for interactive mode
  const handleClick = (starValue: number) => {
    if (interactive && onChange) {
      onChange(starValue);
    }
  };

  // Handle hover for interactive mode
  const handleMouseEnter = (starValue: number) => {
    if (interactive) {
      setHoveredRating(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoveredRating(0);
    }
  };

  // Determine display rating (hover takes precedence in interactive mode)
  const displayRating = interactive && hoveredRating > 0 ? hoveredRating : rating;

  // Generate stars
  const renderStars = () => {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= Math.floor(displayRating);
      const isHalf = showHalfStars && i > Math.floor(displayRating) && i <= Math.ceil(displayRating);

      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleClick(i)}
          onMouseEnter={() => handleMouseEnter(i)}
          onMouseLeave={handleMouseLeave}
          disabled={!interactive}
          className={`
            ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
            ${interactive ? 'focus:outline-none' : ''}
            relative
          `}
          aria-label={`${i} star${i !== 1 ? 's' : ''}`}
        >
          {/* Half star implementation */}
          {isHalf && showHalfStars ? (
            <div className="relative">
              {/* Background (empty) star */}
              <Star className={`${starSize} text-gray-300`} />
              {/* Foreground (half-filled) star */}
              <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
                <Star className={`${starSize} fill-amber-400 text-amber-400`} />
              </div>
            </div>
          ) : (
            <Star
              className={`${starSize} ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
          )}
        </button>
      );
    }

    return stars;
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {renderStars()}
      {showValue && (
        <span className="ml-2 text-sm text-gray-600 font-medium">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

// Preset configurations for common use cases
export function DisplayStarRating({ rating, size = 'md', showValue = false }: {
  rating: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showValue?: boolean;
}) {
  return (
    <StarRating
      rating={rating}
      size={size}
      interactive={false}
      showHalfStars={true}
      showValue={showValue}
    />
  );
}

export function InteractiveStarRating({ rating, onChange, size = 'lg' }: {
  rating: number;
  onChange: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  return (
    <StarRating
      rating={rating}
      onChange={onChange}
      size={size}
      interactive={true}
      showHalfStars={false}
    />
  );
}
