import React from 'react';
import { Button } from './button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorState = ({ title = 'Xatolik yuz berdi', message, onRetry }: { title?: string, message?: string, onRetry?: () => void }) => {
  return (
    <div className="liquid-glass rounded-2xl p-8 flex flex-col items-center justify-center text-center border border-red-500/30 bg-red-950/20 shadow-2xl animate-fade-in">
      <div className="p-3 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 mb-4 shadow-[0_0_20px_rgba(255,0,0,0.3)]">
        <AlertCircle size={28} />
      </div>
      <h3 className="text-lg font-bold text-white mb-1.5">{title}</h3>
      {message && <p className="text-sm text-gray-300 max-w-md mb-6 leading-relaxed">{message}</p>}
      {onRetry && (
        <Button variant="primary" onClick={onRetry} className="flex items-center gap-2">
          <RefreshCw size={16} /> Qayta urinish
        </Button>
      )}
    </div>
  );
};
