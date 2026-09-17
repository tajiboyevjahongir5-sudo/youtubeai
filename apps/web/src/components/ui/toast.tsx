import React from 'react';

// Simplified Toast placeholder
export const Toast = ({ title, description }: any) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white p-4 rounded shadow-lg border">
      <h4 className="font-medium">{title}</h4>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
  );
};
