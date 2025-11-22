'use client';

import { useState, useEffect } from 'react';

// Tailwind breakpoints (must match your tailwind.config)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Hook to check if a media query matches
 * @param query - CSS media query string
 * @returns boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    // Create listener
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);

    // Add listener
    media.addEventListener('change', listener);

    // Cleanup
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

/**
 * Hook to check if viewport is mobile size (< 768px)
 */
export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${BREAKPOINTS.md - 1}px)`);
}

/**
 * Hook to check if viewport is tablet size (768px - 1023px)
 */
export function useIsTablet(): boolean {
  return useMediaQuery(
    `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`
  );
}

/**
 * Hook to check if viewport is desktop size (>= 1024px)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);
}

/**
 * Hook to get current breakpoint
 */
export function useBreakpoint(): Breakpoint | '2xl' | 'xs' {
  const [breakpoint, setBreakpoint] = useState<Breakpoint | '2xl' | 'xs'>('xs');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;

      if (width >= BREAKPOINTS['2xl']) {
        setBreakpoint('2xl');
      } else if (width >= BREAKPOINTS.xl) {
        setBreakpoint('xl');
      } else if (width >= BREAKPOINTS.lg) {
        setBreakpoint('lg');
      } else if (width >= BREAKPOINTS.md) {
        setBreakpoint('md');
      } else if (width >= BREAKPOINTS.sm) {
        setBreakpoint('sm');
      } else {
        setBreakpoint('xs');
      }
    };

    // Set initial value
    updateBreakpoint();

    // Listen for resize
    window.addEventListener('resize', updateBreakpoint);

    // Cleanup
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
}

/**
 * Hook to get viewport dimensions
 */
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
}

/**
 * Responsive helper classes
 */
export const responsiveClasses = {
  // Container padding
  containerPadding: 'px-4 sm:px-6 lg:px-8',

  // Section spacing
  sectionSpacing: 'py-8 sm:py-12 lg:py-16',

  // Card padding
  cardPadding: 'p-4 sm:p-6 lg:p-8',

  // Text sizes
  heading1: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl',
  heading2: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl',
  heading3: 'text-xl sm:text-2xl md:text-3xl',
  heading4: 'text-lg sm:text-xl md:text-2xl',
  body: 'text-base sm:text-lg',
  small: 'text-sm sm:text-base',

  // Grid layouts
  grid2: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
  grid3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
  grid4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',

  // Touch targets (minimum 44px for mobile)
  touchTarget: 'min-h-[44px] min-w-[44px]',

  // Button sizes
  buttonSm: 'px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base',
  buttonMd: 'px-4 py-2 sm:px-6 sm:py-3 text-base sm:text-lg',
  buttonLg: 'px-6 py-3 sm:px-8 sm:py-4 text-lg sm:text-xl',
};

/**
 * Check if touch device
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get responsive grid columns based on item count
 */
export function getResponsiveGridCols(itemCount: number): string {
  if (itemCount === 1) return 'grid-cols-1';
  if (itemCount === 2) return 'grid-cols-1 sm:grid-cols-2';
  if (itemCount === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  if (itemCount === 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  if (itemCount === 5) return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';
  return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
}

/**
 * Clamp function for responsive sizing
 */
export function clamp(min: number, value: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Convert px to rem
 */
export function pxToRem(px: number, base: number = 16): string {
  return `${px / base}rem`;
}

/**
 * Get responsive font size
 */
export function getResponsiveFontSize(
  mobile: number,
  desktop: number,
  viewport: number = typeof window !== 'undefined' ? window.innerWidth : 768
): number {
  const minWidth = BREAKPOINTS.sm;
  const maxWidth = BREAKPOINTS.lg;

  if (viewport <= minWidth) return mobile;
  if (viewport >= maxWidth) return desktop;

  // Linear interpolation
  const ratio = (viewport - minWidth) / (maxWidth - minWidth);
  return mobile + (desktop - mobile) * ratio;
}
