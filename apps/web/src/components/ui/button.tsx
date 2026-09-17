import React from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'glass';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = 'primary', size = 'md', ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={clsx(
        'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 active:scale-95 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer',
        {
          'yt-btn-red text-white': variant === 'primary',
          'bg-white/10 text-white hover:bg-white/15 border border-white/10': variant === 'secondary',
          'border border-white/20 bg-transparent text-gray-200 hover:bg-white/5 hover:border-red-500/50': variant === 'outline',
          'bg-transparent text-gray-300 hover:text-white hover:bg-white/5': variant === 'ghost',
          'bg-red-600/80 text-white hover:bg-red-700 border border-red-500/30': variant === 'destructive',
          'liquid-glass text-white hover:border-red-500/40': variant === 'glass',
          'h-8 px-3 text-xs': size === 'sm',
          'h-10 px-4 py-2 text-sm': size === 'md',
          'h-12 px-6 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    />
  );
});
Button.displayName = 'Button';
