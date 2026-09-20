import React from 'react';
import { Card, CardContent } from './card';

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: string;
  className?: string;
  delay?: number;
  accent?: 'cyan' | 'amber' | 'violet' | 'emerald' | 'red';
}

const accentStyles = {
  cyan: {
    borderHover: 'hover:border-cyan-500/40',
    iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]',
    glow: 'from-cyan-500/[0.04]',
    trend: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },
  amber: {
    borderHover: 'hover:border-amber-500/40',
    iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    glow: 'from-amber-500/[0.04]',
    trend: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  violet: {
    borderHover: 'hover:border-violet-500/40',
    iconBg: 'bg-violet-500/10 text-violet-400 border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.15)]',
    glow: 'from-violet-500/[0.04]',
    trend: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  },
  emerald: {
    borderHover: 'hover:border-emerald-500/40',
    iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    glow: 'from-emerald-500/[0.04]',
    trend: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  red: {
    borderHover: 'hover:border-red-500/40',
    iconBg: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]',
    glow: 'from-red-500/[0.04]',
    trend: 'text-red-400 bg-red-500/10 border-red-500/20',
  },
};

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  description, 
  icon,
  trend,
  className = '',
  delay = 0,
  accent = 'red'
}) => {
  const styles = accentStyles[accent] || accentStyles.red;

  return (
    <Card 
      className={`liquid-card-hover relative overflow-hidden bg-gradient-to-b ${styles.glow} to-transparent border border-white/10 ${styles.borderHover} animate-fade-in-up glass-surface transition-all duration-300 ${className}`} 
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      <CardContent className="p-5 flex flex-row items-center justify-between relative z-10">
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold tracking-wider uppercase text-gray-400">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black tracking-tight text-white">{value}</p>
            {trend && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${styles.trend} inline-flex items-center gap-1`}>
                <span className="text-[12px]">↑</span> {trend}
              </span>
            )}
          </div>
          {description && <p className="text-xs text-gray-400 font-normal">{description}</p>}
        </div>
        {icon && (
          <div className={`p-3 rounded-2xl border ${styles.iconBg} flex items-center justify-center transition-transform group-hover:scale-110`}>
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

