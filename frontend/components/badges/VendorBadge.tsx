'use client';

import {
  CheckCircle,
  Star,
  Zap,
  Crown,
  MessageCircle,
  Award,
  Leaf,
  Shield
} from 'lucide-react';
import { useState } from 'react';

export type BadgeType =
  | 'verified'
  | 'premium'
  | 'elite'
  | 'top_rated'
  | 'responsive'
  | 'featured'
  | 'certified'
  | 'eco_friendly';

interface VendorBadgeProps {
  type: BadgeType;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  metadata?: Record<string, any>;
}

const BADGE_CONFIG: Record<BadgeType, {
  icon: any;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}> = {
  verified: {
    icon: CheckCircle,
    label: 'Verified',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'This vendor has been verified by our team for authenticity and quality.',
  },
  premium: {
    icon: Star,
    label: 'Premium',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'Premium tier vendor with enhanced features and visibility.',
  },
  elite: {
    icon: Zap,
    label: 'Elite',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'Elite vendor with premium membership, verification, and top ratings.',
  },
  top_rated: {
    icon: Star,
    label: 'Top Rated',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    description: 'Maintains 4.5+ star rating with at least 10 reviews.',
  },
  responsive: {
    icon: MessageCircle,
    label: 'Responsive',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'Responds to 90%+ of messages within 24 hours.',
  },
  featured: {
    icon: Crown,
    label: 'Featured',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    description: 'Featured vendor highlighted for exceptional service.',
  },
  certified: {
    icon: Award,
    label: 'Certified',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    description: 'Holds industry certifications and credentials.',
  },
  eco_friendly: {
    icon: Leaf,
    label: 'Eco-Friendly',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: 'Committed to sustainable and eco-friendly practices.',
  },
};

const SIZE_CONFIG = {
  sm: {
    container: 'px-2 py-0.5 text-xs gap-1',
    icon: 'w-3 h-3',
    text: 'text-xs',
  },
  md: {
    container: 'px-3 py-1 text-sm gap-1.5',
    icon: 'w-4 h-4',
    text: 'text-sm',
  },
  lg: {
    container: 'px-4 py-2 text-base gap-2',
    icon: 'w-5 h-5',
    text: 'text-base',
  },
};

export default function VendorBadge({
  type,
  size = 'md',
  showTooltip = true,
  metadata,
}: VendorBadgeProps) {
  const [showTooltipState, setShowTooltipState] = useState(false);
  const config = BADGE_CONFIG[type];
  const sizeConfig = SIZE_CONFIG[size];
  const Icon = config.icon;

  return (
    <div className="relative inline-block">
      <div
        className={`
          inline-flex items-center font-medium rounded-full border
          ${config.color} ${config.bgColor} ${config.borderColor}
          ${sizeConfig.container}
          transition-all duration-200 hover:shadow-md
        `}
        onMouseEnter={() => setShowTooltipState(true)}
        onMouseLeave={() => setShowTooltipState(false)}
      >
        <Icon className={sizeConfig.icon} />
        <span className={sizeConfig.text}>{config.label}</span>
      </div>

      {/* Tooltip */}
      {showTooltip && showTooltipState && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 pointer-events-none">
          <div className="bg-gray-900 text-white text-sm rounded-lg p-3 shadow-xl">
            <div className="flex items-start gap-2 mb-2">
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold mb-1">{config.label}</div>
                <div className="text-gray-300 text-xs leading-relaxed">
                  {config.description}
                </div>
                {metadata && Object.keys(metadata).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-400">
                    {metadata.rating && (
                      <div>Rating: {metadata.rating}/5.0</div>
                    )}
                    {metadata.review_count && (
                      <div>Reviews: {metadata.review_count}</div>
                    )}
                    {metadata.response_rate && (
                      <div>Response Rate: {metadata.response_rate}%</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
              <div className="border-8 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
