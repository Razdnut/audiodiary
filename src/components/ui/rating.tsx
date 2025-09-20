import React from 'react';

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
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, index) => (
        <button
          key={index}
          onClick={() => onValueChange(index + 1)}
          className={`${sizeClasses[size]} rounded-full border-2 transition-colors ${
            index < value 
              ? 'bg-yellow-400 border-yellow-400' 
              : 'bg-white border-gray-300'
          } hover:bg-yellow-300 hover:border-yellow-400`}
          aria-label={`Rate ${index + 1} out of ${max}`}
        />
      ))}
    </div>
  );
};

export default Rating;