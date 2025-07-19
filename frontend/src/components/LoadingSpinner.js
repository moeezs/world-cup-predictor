import React from 'react';

const LoadingSpinner = ({ size = 'lg', text = 'Loading World Cup Data...' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  };

  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="relative">
        <div className={`animate-spin rounded-full border-4 border-gray-200 border-t-world-cup-gold ${sizeClasses[size]}`}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">⚽</span>
        </div>
      </div>
      <div className="mt-6 text-center">
        <p className="text-gray-700 font-bold text-lg">{text}</p>
        <div className="flex items-center justify-center mt-2 space-x-1">
          <div className="w-2 h-2 bg-world-cup-gold rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-soccer-green rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-world-cup-gold rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
