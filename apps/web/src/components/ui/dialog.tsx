import React from 'react';

// Simplified Dialog placeholder
export const Dialog = ({ open, onOpenChange, children }: any) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
        <button onClick={() => onOpenChange(false)} className="absolute top-4 right-4">&times;</button>
        {children}
      </div>
    </div>
  );
};
