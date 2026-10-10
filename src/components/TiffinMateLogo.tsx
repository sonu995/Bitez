import React from 'react';

interface TiffinMateLogoProps {
  className?: string;
  showSubtitle?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const TiffinMateLogo: React.FC<TiffinMateLogoProps> = ({
  className = '',
  showSubtitle = true,
  size = 'md',
}) => {
  const iconSize = size === 'sm' ? 34 : size === 'lg' ? 48 : 42;
  const titleSize = size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-3xl' : 'text-2xl';
  const subtitleSize = size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-xs' : 'text-[11px]';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Custom Chef Hat with Fork & Spoon Icon */}
      <div className="relative flex-shrink-0" style={{ width: iconSize, height: iconSize }}>
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          <defs>
            <linearGradient id="bitezLogoGrad" x1="14" y1="9" x2="53" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF5200" />
              <stop offset="1" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          {/* Hat Crown Fill (Brand Warm Sunset Gradient) */}
          <path
            d="M14 36 C10 32 8 23 15 17 C16 11 23 9 27 12 C30 7 38 7 41 12 C45 9 52 11 53 17 C60 23 58 32 54 36 Z"
            fill="url(#bitezLogoGrad)"
          />
          {/* Chef Hat Outline */}
          <path
            d="M14 36 C10 32 8 23 15 17 C16 11 23 9 27 12 C30 7 38 7 41 12 C45 9 52 11 53 17 C60 23 58 32 54 36"
            stroke="#EA580C"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Interior folds of chef hat */}
          <path
            d="M27 14 C27 24 25 32 24 36"
            stroke="#EA580C"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.3"
          />
          <path
            d="M41 14 C41 24 43 32 44 36"
            stroke="#EA580C"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.3"
          />
          {/* Hat Brim / Base Band */}
          <rect
            x="14"
            y="36"
            width="40"
            height="18"
            rx="4"
            fill="#FFFFFF"
            stroke="#EA580C"
            strokeWidth="3.5"
          />
          {/* Left: Fork inside brim */}
          <path
            d="M23 41 L23 48 M21 41 L21 45 C21 46 25 46 25 45 L25 41"
            stroke="#EA580C"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Right: Spoon inside brim */}
          <path
            d="M33 48 L33 44 M33 44 C35 44 36 42.5 36 41 C36 39.5 35 39 33 39 C31 39 30 39.5 30 41 C30 42.5 31 44 33 44 Z"
            stroke="#EA580C"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Cute Knife / Accent on far right */}
          <path
            d="M43 41 L43 48 M43 41 C44.5 41 45 42 45 44 L43 44"
            stroke="#EA580C"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className={`font-black tracking-tight leading-none text-slate-900 ${titleSize}`}>
          <span>Bite</span>
          <span className="text-orange-600">z</span>
        </div>
        {showSubtitle && (
          <span className={`font-medium tracking-wide text-slate-500 mt-1 ${subtitleSize}`}>
            Mess + Instant Order
          </span>
        )}
      </div>
    </div>
  );
};

export default TiffinMateLogo;
