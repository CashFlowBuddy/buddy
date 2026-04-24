'use client';

import React from 'react';

interface DitherBackgroundProps {
  className?: string;
}

export const DitherBackground: React.FC<DitherBackgroundProps> = ({
  className = '',
}) => {
  return (
    <div className={`pointer-events-none absolute inset-0 w-full h-full overflow-hidden ${className}`}>
      <svg className="absolute inset-0 w-full h-full opacity-[0.15]" preserveAspectRatio="none">
        <filter id="react-bits-dither">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix
            type="matrix"
            values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 255 -128
            "
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#react-bits-dither)" />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
};

export default DitherBackground;
