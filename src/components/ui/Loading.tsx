'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullPage?: boolean;
}

export default function Loading({ 
  className, 
  size = 'md', 
  text, 
  fullPage = false 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const containerClasses = cn(
    'flex flex-col items-center justify-center gap-3',
    fullPage ? 'fixed inset-0 bg-white/80 backdrop-blur-sm z-50' : 'w-full h-full min-h-[100px]',
    className
  );

  return (
    <div className={containerClasses}>
      <div className="relative">
        <Loader2 
          className={cn(
            'text-primary-600 animate-spin',
            sizeClasses[size]
          )} 
        />
        <div 
          className={cn(
            'absolute inset-0 border-4 border-primary-100 rounded-full opacity-20',
            sizeClasses[size]
          )}
        />
      </div>
      {text && (
        <p className={cn(
          'text-gray-500 font-medium animate-pulse',
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}>
          {text}
        </p>
      )}
    </div>
  );
}
