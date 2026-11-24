import React from 'react';

interface BrandMarkProps {
  size?: 'sm' | 'md';
}

export const BrandMark: React.FC<BrandMarkProps> = ({ size = 'md' }) => {
  const iconDim = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';
  const textSize = size === 'sm' ? 'text-lg' : 'text-xl';

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <div
        className={`${iconDim} rounded-lg bg-[#6D28D9] text-white flex items-center justify-center shrink-0`}
        aria-hidden="true"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      </div>
      <span
        className={`${textSize} font-display font-bold tracking-tight text-[#181424] whitespace-nowrap shrink-0`}
      >
        DoList
      </span>
    </div>
  );
};
