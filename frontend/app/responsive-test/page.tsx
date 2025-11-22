'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Smartphone,
  Tablet,
  Monitor,
  Maximize2,
  Check,
  X,
  Menu,
  Home,
} from 'lucide-react';
import {
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useBreakpoint,
  useViewport,
  BREAKPOINTS,
  responsiveClasses,
} from '@/lib/responsive-utils';

export default function ResponsiveTest() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  const breakpoint = useBreakpoint();
  const viewport = useViewport();
  const [showGrid, setShowGrid] = useState(true);

  const getBreakpointColor = (bp: string) => {
    const colors: Record<string, string> = {
      xs: 'bg-red-500',
      sm: 'bg-orange-500',
      md: 'bg-yellow-500',
      lg: 'bg-green-500',
      xl: 'bg-blue-500',
      '2xl': 'bg-purple-500',
    };
    return colors[bp] || 'bg-gray-500';
  };

  const getBreakpointName = (bp: string) => {
    const names: Record<string, string> = {
      xs: 'Extra Small (< 640px)',
      sm: 'Small (640px+)',
      md: 'Medium (768px+)',
      lg: 'Large (1024px+)',
      xl: 'Extra Large (1280px+)',
      '2xl': '2X Large (1536px+)',
    };
    return names[bp] || bp;
  };

  const breakpointTests = [
    { name: 'Extra Small (xs)', min: 0, max: BREAKPOINTS.sm - 1, active: breakpoint === 'xs' },
    { name: 'Small (sm)', min: BREAKPOINTS.sm, max: BREAKPOINTS.md - 1, active: breakpoint === 'sm' },
    { name: 'Medium (md)', min: BREAKPOINTS.md, max: BREAKPOINTS.lg - 1, active: breakpoint === 'md' },
    { name: 'Large (lg)', min: BREAKPOINTS.lg, max: BREAKPOINTS.xl - 1, active: breakpoint === 'lg' },
    { name: 'Extra Large (xl)', min: BREAKPOINTS.xl, max: BREAKPOINTS['2xl'] - 1, active: breakpoint === 'xl' },
    { name: '2X Large (2xl)', min: BREAKPOINTS['2xl'], max: 9999, active: breakpoint === '2xl' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50">
      {/* Fixed Breakpoint Indicator */}
      <div className={`fixed top-4 right-4 z-50 ${getBreakpointColor(breakpoint)} text-white px-4 py-2 rounded-lg shadow-lg font-bold`}>
        {breakpoint.toUpperCase()}
      </div>

      {/* Header */}
      <header className="bg-white border-b border-champagne-200 sticky top-0 z-40">
        <div className={`max-w-7xl mx-auto ${responsiveClasses.containerPadding} py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl font-serif font-bold text-gray-900">Responsive Test</h1>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900 px-3 py-2 min-h-[44px]"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className={`max-w-7xl mx-auto ${responsiveClasses.containerPadding} ${responsiveClasses.sectionSpacing}`}>
        {/* Hero */}
        <div className="text-center mb-8">
          <h2 className={`${responsiveClasses.heading1} font-serif font-bold text-gray-900 mb-4`}>
            Responsive Breakpoint Tester
          </h2>
          <p className={`${responsiveClasses.body} text-gray-600`}>
            Test responsive design across different screen sizes
          </p>
        </div>

        {/* Current Viewport Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8 border-4 border-champagne-300">
          <h3 className={`${responsiveClasses.heading3} font-bold text-gray-900 mb-6`}>
            Current Viewport
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-champagne-600 mb-1">
                {viewport.width}px
              </div>
              <div className="text-sm text-gray-600">Width</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-champagne-600 mb-1">
                {viewport.height}px
              </div>
              <div className="text-sm text-gray-600">Height</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold mb-1 ${getBreakpointColor(breakpoint)} text-white px-3 py-2 rounded-lg inline-block`}>
                {breakpoint.toUpperCase()}
              </div>
              <div className="text-sm text-gray-600 mt-2">Breakpoint</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {isMobile && <Smartphone className="w-6 h-6 text-red-600" />}
                {isTablet && <Tablet className="w-6 h-6 text-yellow-600" />}
                {isDesktop && <Monitor className="w-6 h-6 text-green-600" />}
              </div>
              <div className="text-sm font-medium text-gray-900">
                {isMobile && 'Mobile'}
                {isTablet && 'Tablet'}
                {isDesktop && 'Desktop'}
              </div>
            </div>
          </div>

          <div className="text-center text-gray-600 text-sm">
            {getBreakpointName(breakpoint)}
          </div>
        </div>

        {/* Breakpoint Reference */}
        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 mb-8">
          <h3 className={`${responsiveClasses.heading3} font-bold text-gray-900 mb-6`}>
            Tailwind Breakpoints
          </h3>

          <div className="space-y-3">
            {breakpointTests.map((test) => (
              <div
                key={test.name}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition ${
                  test.active
                    ? 'border-champagne-500 bg-champagne-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {test.active ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <X className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <div className="font-bold text-gray-900">{test.name}</div>
                    <div className="text-sm text-gray-600">
                      {test.min}px - {test.max === 9999 ? '∞' : `${test.max}px`}
                    </div>
                  </div>
                </div>
                {test.active && (
                  <span className="bg-champagne-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                    ACTIVE
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Responsive Grid Test */}
        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className={`${responsiveClasses.heading3} font-bold text-gray-900`}>
              Responsive Grid Tests
            </h3>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className="px-4 py-2 bg-champagne-600 text-white rounded-lg hover:bg-champagne-700 transition min-h-[44px]"
            >
              {showGrid ? 'Hide' : 'Show'} Grids
            </button>
          </div>

          {showGrid && (
            <div className="space-y-8">
              {/* 2 Column Grid */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3">2 Column Grid (1 → 2)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-champagne-100 border-2 border-champagne-300 rounded-lg p-4 text-center font-bold text-champagne-700">
                      Column {i}
                    </div>
                  ))}
                </div>
              </div>

              {/* 3 Column Grid */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3">3 Column Grid (1 → 2 → 3)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4 text-center font-bold text-blue-700">
                      Column {i}
                    </div>
                  ))}
                </div>
              </div>

              {/* 4 Column Grid */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3">4 Column Grid (1 → 2 → 4)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-purple-100 border-2 border-purple-300 rounded-lg p-4 text-center font-bold text-purple-700">
                      Column {i}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Typography Tests */}
        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 mb-8">
          <h3 className={`${responsiveClasses.heading3} font-bold text-gray-900 mb-6`}>
            Responsive Typography
          </h3>

          <div className="space-y-6">
            <div>
              <div className="text-xs text-gray-500 mb-1">Heading 1</div>
              <div className={`${responsiveClasses.heading1} font-bold text-gray-900`}>
                The quick brown fox
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Heading 2</div>
              <div className={`${responsiveClasses.heading2} font-bold text-gray-900`}>
                The quick brown fox
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Heading 3</div>
              <div className={`${responsiveClasses.heading3} font-bold text-gray-900`}>
                The quick brown fox
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Body Text</div>
              <div className={`${responsiveClasses.body} text-gray-700`}>
                The quick brown fox jumps over the lazy dog. This is body text that should be readable at all screen sizes.
              </div>
            </div>
          </div>
        </div>

        {/* Touch Target Tests */}
        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 mb-8">
          <h3 className={`${responsiveClasses.heading3} font-bold text-gray-900 mb-6`}>
            Touch Target Tests (Minimum 44px)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="bg-champagne-600 text-white rounded-lg hover:bg-champagne-700 transition min-h-[44px] px-4 py-2 font-medium">
              44px Minimum Button
            </button>

            <button className="bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition min-h-[52px] px-4 py-2 font-medium">
              52px Button
            </button>

            <button className="bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition min-h-[60px] px-4 py-2 font-medium">
              60px Large Button
            </button>
          </div>

          <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Accessibility Tip:</strong> All touch targets should be at least 44x44px for mobile accessibility. Use <code className="bg-green-100 px-1 rounded">min-h-[44px]</code> and <code className="bg-green-100 px-1 rounded">min-w-[44px]</code> classes.
            </p>
          </div>
        </div>

        {/* Visibility Tests */}
        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
          <h3 className={`${responsiveClasses.heading3} font-bold text-gray-900 mb-6`}>
            Responsive Visibility
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-red-100 border-2 border-red-300 rounded-lg md:hidden">
              <p className="text-red-800 font-bold">Visible only on mobile (hidden md:hidden)</p>
            </div>

            <div className="p-4 bg-yellow-100 border-2 border-yellow-300 rounded-lg hidden md:block lg:hidden">
              <p className="text-yellow-800 font-bold">Visible only on tablet (hidden md:block lg:hidden)</p>
            </div>

            <div className="p-4 bg-green-100 border-2 border-green-300 rounded-lg hidden lg:block">
              <p className="text-green-800 font-bold">Visible only on desktop (hidden lg:block)</p>
            </div>

            <div className="p-4 bg-blue-100 border-2 border-blue-300 rounded-lg block sm:hidden">
              <p className="text-blue-800 font-bold">Visible on extra small only (block sm:hidden)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
