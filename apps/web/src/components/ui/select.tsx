import React from 'react';

export const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => {
  return (
    <select 
      className="flex h-11 w-full rounded-xl border border-white/15 bg-[#161622] px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/80 focus:ring-2 focus:ring-red-500/20 cursor-pointer backdrop-blur-md transition-all" 
      {...props}
    >
      {props.children}
    </select>
  );
};
