import React from 'react';

export const PageHeader = ({ title, description, actions }: { title: string, description?: string, actions?: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 animate-fade-in">
    <div className="space-y-1.5">
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-[0_0_25px_rgba(255,0,0,0.15)]">
        {title}
      </h1>
      {description && (
        <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">{description}</p>
      )}
      <div className="h-0.5 w-12 rounded-full bg-gradient-to-r from-red-500 to-red-500/0 mt-2" />
    </div>
    {actions && <div className="mt-2 sm:mt-0 flex-shrink-0">{actions}</div>}
  </div>
);
