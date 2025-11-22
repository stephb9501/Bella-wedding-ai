'use client';

import { CheckCircle, Shield } from 'lucide-react';
import { useState } from 'react';

interface VerificationBadgeProps {
  isVerified: boolean;
  verifiedAt?: string | null;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'checkmark' | 'shield' | 'full';
  showTooltip?: boolean;
}

export default function VerificationBadge({
  isVerified,
  verifiedAt,
  size = 'md',
  variant = 'full',
  showTooltip = true,
}: VerificationBadgeProps) {
  const [showTooltipState, setShowTooltipState] = useState(false);

  if (!isVerified) {
    return null;
  }

  const sizeClasses = {
    sm: {
      icon: 'w-4 h-4',
      container: 'px-2 py-1 text-xs gap-1',
      text: 'text-xs',
    },
    md: {
      icon: 'w-5 h-5',
      container: 'px-3 py-1.5 text-sm gap-1.5',
      text: 'text-sm',
    },
    lg: {
      icon: 'w-6 h-6',
      container: 'px-4 py-2 text-base gap-2',
      text: 'text-base',
    },
  };

  const config = sizeClasses[size];

  // Checkmark only variant
  if (variant === 'checkmark') {
    return (
      <div className="relative inline-block">
        <div
          className="inline-flex items-center"
          onMouseEnter={() => setShowTooltipState(true)}
          onMouseLeave={() => setShowTooltipState(false)}
        >
          <CheckCircle className={`${config.icon} text-blue-600 fill-current`} />
        </div>
        {showTooltip && showTooltipState && (
          <TooltipContent verifiedAt={verifiedAt} />
        )}
      </div>
    );
  }

  // Shield only variant
  if (variant === 'shield') {
    return (
      <div className="relative inline-block">
        <div
          className="inline-flex items-center"
          onMouseEnter={() => setShowTooltipState(true)}
          onMouseLeave={() => setShowTooltipState(false)}
        >
          <Shield className={`${config.icon} text-blue-600 fill-blue-100`} />
        </div>
        {showTooltip && showTooltipState && (
          <TooltipContent verifiedAt={verifiedAt} />
        )}
      </div>
    );
  }

  // Full badge variant (default)
  return (
    <div className="relative inline-block">
      <div
        className={`
          inline-flex items-center font-semibold rounded-full border-2
          bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400
          ${config.container}
          shadow-sm hover:shadow-md transition-all duration-200
        `}
        onMouseEnter={() => setShowTooltipState(true)}
        onMouseLeave={() => setShowTooltipState(false)}
      >
        <CheckCircle className={`${config.icon} fill-current`} />
        <span className={config.text}>Verified</span>
      </div>
      {showTooltip && showTooltipState && (
        <TooltipContent verifiedAt={verifiedAt} />
      )}
    </div>
  );
}

function TooltipContent({ verifiedAt }: { verifiedAt?: string | null }) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 pointer-events-none">
      <div className="bg-gray-900 text-white text-sm rounded-lg p-3 shadow-xl">
        <div className="flex items-start gap-2">
          <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold mb-1">Verified Vendor</div>
            <div className="text-gray-300 text-xs leading-relaxed">
              This vendor has been verified by our team for authenticity, quality, and reliability.
            </div>
            {verifiedAt && (
              <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-400">
                Verified on {formatDate(verifiedAt)}
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
  );
}
