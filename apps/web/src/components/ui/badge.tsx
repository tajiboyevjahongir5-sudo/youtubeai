import React from 'react';
import { clsx } from 'clsx';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success';
}

export const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => {
  return (
    <div className={clsx(
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md transition-all",
      {
        "bg-red-500/15 text-red-400 border border-red-500/30 shadow-[0_0_12px_rgba(255,0,0,0.15)]": variant === 'default',
        "bg-white/[0.08] text-gray-300 border border-white/15": variant === 'secondary',
        "bg-rose-500/20 text-rose-300 border border-rose-500/40": variant === 'destructive',
        "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]": variant === 'success',
        "text-gray-300 border border-white/20 bg-transparent": variant === 'outline',
      },
      className
    )} {...props} />
  );
};
