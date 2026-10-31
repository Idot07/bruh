import React from 'react';

export interface IconProps {
  name: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
  'aria-hidden'?: boolean;
}

// Simple inline SVG icons - consistent stroke weight, 24x24 viewBox
const icons: Record<string, React.ReactNode> = {
  // Navigation
  'chevron-left': <>M15 18l-6-6 6-6</>,
  'chevron-right': <>M9 18l6-6-6-6</>,
  'chevron-down': <>M6 9l6 6 6-6</>,
  'chevron-up': <>M18 15l-6-6-6 6</>,
  'rotate-ccw': <>M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8</>,
  'plus': <>M12 5v14M5 12h14</>,
  'minus': <>M5 12h14</>,
  'x': <>M18 6L6 18M6 6l12 12</>,
  'trash': <>M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2</>,
  'edit': <>M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z</>,
  'settings': <>M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06-.06a1.65 1.65 0 0 0 1.82-.33H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82-.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06.06a1.65 1.65 0 0 0-1.82.33H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1</>,
  'download': <>M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3</>,
  'upload': <>M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12</>,
  'search': <>M11 11a8 8 0 1 0 0 16M21 21l-4.35-4.35</>,
  'filter': <>M22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3</>,
  'grid': <>M3 3h7v7H3zM14 3h7v7H14zM3 14h7v7H3zM14 14h7v7H14z</>,
  'list': <>M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01</>,
  // Tools
  'mouse-pointer': <>M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3zM13 13l6 6</>,
  'pen': <>M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5</>,
  'eraser': <>M20 20H7L5 16V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v4M18 7v9M13 12h6M13 17h4</>,
  'highlighter': <>M16 3h5v5M21 8V3M14 13l8-8M10 17l5-5M6 21l4-4</>,
  'type': <>M4 7 4 4 20 4 20 7M9 20h6M12 4v16</>,
  'square': <>M3 3h18v18H3z</>,
  'circle': <>M12 12a10 10 0 1 0 0-20 10 10 0 0 0 0 20z</>,
  'arrow-right': <>M5 12h14M12 5l7 7-7 7</>,
  'undo': <>M3 7v6h6M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13</>,
  'redo': <>M21 7v6h-6M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13</>,
  'link': <>M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71</>,
  'file-text': <>M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9h-.01M9 9h-.01M8 9h-.01</>,
};

export function Icon({ name, size = 20, strokeWidth = 2, className, 'aria-hidden': ariaHidden = true }: IconProps) {
  const iconContent = icons[name];
  
  if (!iconContent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      {iconContent}
    </svg>
  );
}