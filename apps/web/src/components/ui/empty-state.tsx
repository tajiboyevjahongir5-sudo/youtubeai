import React from 'react';
import { Button } from './button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ icon, title, description, actionLabel, onAction }: EmptyStateProps) => {
  return (
    <div className="liquid-glass rounded-2xl p-10 flex flex-col items-center justify-center text-center border border-dashed border-white/15">
      {icon && <div className="mb-4 p-4 rounded-2xl bg-white/[0.05] border border-white/10 text-red-500 shadow-inner">{icon}</div>}
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
};
