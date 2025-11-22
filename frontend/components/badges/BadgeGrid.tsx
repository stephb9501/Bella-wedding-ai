'use client';

import VendorBadge, { BadgeType } from './VendorBadge';

interface Badge {
  badge_type: BadgeType;
  awarded_at?: string;
  expires_at?: string | null;
  metadata?: Record<string, any>;
}

interface BadgeGridProps {
  badges: Badge[];
  size?: 'sm' | 'md' | 'lg';
  maxDisplay?: number;
  showTooltip?: boolean;
  layout?: 'horizontal' | 'grid';
}

export default function BadgeGrid({
  badges,
  size = 'md',
  maxDisplay,
  showTooltip = true,
  layout = 'horizontal',
}: BadgeGridProps) {
  if (!badges || badges.length === 0) {
    return null;
  }

  // Filter out expired badges
  const activeBadges = badges.filter(badge => {
    if (!badge.expires_at) return true;
    return new Date(badge.expires_at) > new Date();
  });

  if (activeBadges.length === 0) {
    return null;
  }

  // Sort badges by priority (verified, elite, featured, etc.)
  const badgePriority: Record<string, number> = {
    verified: 1,
    elite: 2,
    featured: 3,
    top_rated: 4,
    certified: 5,
    responsive: 6,
    premium: 7,
    eco_friendly: 8,
  };

  const sortedBadges = [...activeBadges].sort((a, b) => {
    const priorityA = badgePriority[a.badge_type] || 999;
    const priorityB = badgePriority[b.badge_type] || 999;
    return priorityA - priorityB;
  });

  // Limit display if maxDisplay is set
  const displayBadges = maxDisplay
    ? sortedBadges.slice(0, maxDisplay)
    : sortedBadges;

  const remainingCount = sortedBadges.length - displayBadges.length;

  const layoutClasses = layout === 'grid'
    ? 'grid grid-cols-2 gap-2'
    : 'flex flex-wrap gap-2';

  return (
    <div className={layoutClasses}>
      {displayBadges.map((badge, index) => (
        <VendorBadge
          key={`${badge.badge_type}-${index}`}
          type={badge.badge_type}
          size={size}
          showTooltip={showTooltip}
          metadata={badge.metadata}
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={`
            inline-flex items-center font-medium rounded-full border
            text-gray-600 bg-gray-50 border-gray-200
            ${size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-4 py-2 text-base' : 'px-3 py-1 text-sm'}
          `}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
