import React from 'react';
import { clsx } from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, error, label, ...props }, ref) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">{label}</label>}
      <input
        ref={ref}
        className={clsx(
          "flex h-11 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-white placeholder:text-gray-500 backdrop-blur-md transition-all focus:outline-none focus:border-red-500/80 focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs font-medium text-red-400">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';
