'use client';

import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface LoadingAnimationProps {
  className?: string;
  text?: string;
}

export default function LoadingAnimation({ className, text = 'Generando respuesta...' }: LoadingAnimationProps) {
  return (
    <div className={cn("space-y-6 w-full max-w-2xl", className)}>
      {/* Header with animated icon */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 bg-primary-400 rounded-full blur-md opacity-20 animate-pulse" />
          <div className="relative p-2 bg-primary-50 rounded-lg text-primary-600">
            <Sparkles className="w-4 h-4 animate-bounce" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-primary-600 font-semibold text-xs uppercase tracking-wider">
            Agente
          </span>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm font-medium">{text}</span>
            <div className="flex gap-1">
              <span className="w-1 h-1 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1 h-1 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1 h-1 bg-primary-400 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </div>

      {/* Modern Shimmer Skeletons */}
      <div className="space-y-4">
        <div className="relative h-4 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-primary-50/50 to-transparent shadow-[0_0_20px_rgba(255,255,255,0.8)]" />
        </div>
        <div className="relative h-4 w-[92%] bg-gray-100 rounded-full overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-primary-50/50 to-transparent shadow-[0_0_20px_rgba(255,255,255,0.8)] [animation-delay:0.2s]" />
        </div>
        <div className="relative h-4 w-[85%] bg-gray-100 rounded-full overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-primary-50/50 to-transparent shadow-[0_0_20px_rgba(255,255,255,0.8)] [animation-delay:0.4s]" />
        </div>
        <div className="relative h-4 w-[78%] bg-gray-100 rounded-full overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-primary-50/50 to-transparent shadow-[0_0_20px_rgba(255,255,255,0.8)] [animation-delay:0.6s]" />
        </div>
      </div>
    </div>
  );
}
