"use client";

import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingProps {
  value: number;
  onValueChange: (value: number) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

const Rating: React.FC<RatingProps> = ({
  value,
  onValueChange,
  max = 5,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1;
        return (
          <button
            key={index}
            onClick={() => onValueChange(starValue)}
            className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
            aria-label={`Rate ${starValue} out of ${max}`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                'transition-colors text-muted-foreground group-hover:text-yellow-400',
                starValue <= value ? 'text-yellow-400 fill-yellow-400' : 'fill-muted'
              )}
            />
          </button>
        );
      })}
    </div>
  );
};

export default Rating;