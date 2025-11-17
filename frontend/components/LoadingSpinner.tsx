'use client';

import { Heart, Loader2 } from 'lucide-react';

interface Props {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  variant?: 'heart' | 'spinner';
}

export function LoadingSpinner({
  fullScreen = false,
  size = 'md',
  message,
  variant = 'heart'
}: Props) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const Icon = variant === 'heart' ? Heart : Loader2;
  const animation = variant === 'heart' ? 'animate-pulse' : 'animate-spin';

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <Icon className={`${sizeClasses[size]} text-champagne-600 ${animation}`} />
      {message && (
        <p className="text-gray-600 text-sm">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}

export default LoadingSpinner;
