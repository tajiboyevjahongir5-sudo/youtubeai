import React from 'react';
import { Card, CardContent } from './card';

export const StatCard = ({ 
  title, 
  value, 
  description, 
  icon,
  trend,
  className = '',
  delay = 0
}: { 
  title: string, 
  value: string | number, 
  description?: string, 
  icon?: React.ReactNode,
  trend?: string,
  className?: string,
  delay?: number
}) => (
  <Card className={`liquid-card-hover border border-white/10 hover:border-red-500/30 animate-fade-in-up glass-surface ${className}`} style={delay ? { animationDelay: `${delay}ms` } : undefined}>
    <CardContent className="p-5 flex flex-row items-center justify-between">
      <div className="space-y-1">
        <p className="text-xs font-medium tracking-wide uppercase text-gray-400">{title}</p>
        <p className="text-3xl font-extrabold tracking-tight text-white">{value}</p>
        {description && <p className="text-xs text-gray-400">{description}</p>}
        {trend && (
          <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-1">
            <span>↑</span> {trend}
          </p>
        )}
      </div>
      {icon && (
        <div className="p-3 rounded-xl bg-white/[0.05] border border-white/10 text-red-500 shadow-inner">
          {icon}
        </div>
      )}
    </CardContent>
  </Card>
);
