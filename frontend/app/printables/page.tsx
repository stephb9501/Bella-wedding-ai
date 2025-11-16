'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import AuthWall from '@/components/AuthWall';
import { Heart, Download, FileText, CheckCircle, Calendar, Users, DollarSign, Printer, Lock } from 'lucide-react';

interface UserTier {
  tier: 'free' | 'standard' | 'premium';
  exportsRemaining: number;
}

export default function PrintablesPage() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();
  const [userTier, setUserTier] = useState<UserTier>({ tier: 'standard', exportsRemaining: 1 });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // In real app, fetch from API
      // For now, mock Standard tier with 1 export remaining
      setUserTier({ tier: 'standard', exportsRemaining: 1 });
    }
  }, [isAuthenticated, user]);

  const printables = [
    {
      id: 'complete-binder',
      title: 'Complete Wedding Binder',
      description: 'Everything you need in one printable package',
      icon: FileText,
      color: 'purple',
      pages: '25-40 pages',
      includes: [
        'Wedding details cover page',
        'Complete timeline & schedule',
        'Full 90-task checklist',
        'Budget tracker with categories',
        'Vendor contact list',
        'Décor zone plans & packing lists',
        'Emergency items checklist',
        'Day-of timeline',
        'Guest list summary',
        'Notes pages'
      ],
      tier: 'standard'
    },
    {
      id: 'day-of-timeline',
      title: 'Day-Of Timeline',
      description: 'Hour-by-hour wedding day schedule',
      icon: Calendar,
      color: 'blue',
      pages: '3-5 pages',
      includes: [
        'Getting ready schedule',
        'Ceremony timeline',
        'Reception schedule',
        'Vendor arrival times',
        'Photo schedule',
        'Key contact numbers'
      ],
      tier: 'standard'
    },
    {
      id: 'vendor-contacts',
      title: 'Vendor Contact Sheet',
      description: 'All your vendor info in one place',
      icon: Users,
      color: 'green',
      pages: '2-3 pages',
      includes: [
        'Vendor names & companies',
        'Phone numbers & emails',
        'Service details',
        'Arrival times',
        'Payment status',
        'Contract notes'
      ],
      tier: 'standard'
    },
    {
      id: 'budget-breakdown',
      title: 'Budget Breakdown',
      description: 'Complete budget tracking sheets',
      icon: DollarSign,
      color: 'yellow',
      pages: '4-6 pages',
      includes: [
        'Category budget allocations',
        'Estimated vs actual costs',
        'Payment tracking',
        'Deposit schedules',
        'Outstanding balances',
        'Cost-saving tips'
      ],
      tier: 'standard'
    },
    {
      id: 'seating-chart',
      title: 'Seating Chart & Place Cards',
      description: 'Print-ready seating assignments',
      icon: Users,
      color: 'rose',
      pages: '5-10 pages',
      includes: [
        'Table assignments',
        'Guest seating layout',
        'Printable place cards',
        'Table number cards',
        'Dietary notes',
        'VIP table markers'
      ],
      tier: 'premium'
    },
    {
      id: 'custom-timeline',
      title: 'Custom Planning Timeline',
      description: 'Month-by-month planning guide',
      icon: CheckCircle,
      color: 'orange',
      pages: '8-12 pages',
      includes: [
        'Customized task timeline',
        '12-month planning calendar',
        'Priority task lists',
        'Deadline trackers',
        'Milestone celebrations',
        'Weekly planning pages'
      ],
      tier: 'premium'
    }
  ];

  const handleDownload = async (printableId: string) => {
    const printable = printables.find(p => p.id === printableId);
    if (!printable) return;

    // Check tier access
    if (printable.tier === 'premium' && userTier.tier !== 'premium') {
      alert('This printable is only available for Premium subscribers. Upgrade to access!');
      router.push('/pricing');
      return;
    }

    // Check exports remaining for Standard tier
    if (userTier.tier === 'standard' && userTier.exportsRemaining <= 0) {
      alert('You\'ve used your 1 free export on Standard plan. Upgrade to Premium for unlimited exports!');
      router.push('/pricing');
      return;
    }

    setIsGenerating(true);

    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    // In real app, generate actual PDF here
    alert(`✅ ${printable.title} generated successfully!\n\nIn production, this would download a PDF file.\n\nExports remaining: ${userTier.tier === 'premium' ? 'Unlimited' : userTier.exportsRemaining - 1}`);

    // Decrement exports for Standard tier
    if (userTier.tier === 'standard') {
      setUserTier(prev => ({ ...prev, exportsRemaining: prev.exportsRemaining - 1 }));
    }

    setIsGenerating(false);
  };

  const getColorClasses = (color: string) => {
    const colors = {
      purple: { bg: 'bg-purple-50', icon: 'text-purple-600', button: 'bg-purple-600 hover:bg-purple-700' },
      blue: { bg: 'bg-blue-50', icon: 'text-blue-600', button: 'bg-blue-600 hover:bg-blue-700' },
      green: { bg: 'bg-green-50', icon: 'text-green-600', button: 'bg-green-600 hover:bg-green-700' },
      yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600', button: 'bg-yellow-600 hover:bg-yellow-700' },
      rose: { bg: 'bg-rose-50', icon: 'text-rose-600', button: 'bg-rose-600 hover:bg-rose-700' },
      orange: { bg: 'bg-orange-50', icon: 'text-orange-600', button: 'bg-orange-600 hover:bg-orange-700' }
    };
    return colors[color as keyof typeof colors];
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-purple-50 flex items-center justify-center">
        <Heart className="w-12 h-12 text-champagne-600 animate-pulse" />
      </div>
    );
  }

  // Show AuthWall if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthWall
        featureName="Printable Wedding Binder"
        previewContent={
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
              <Printer className="w-16 h-16 text-champagne-600 mx-auto mb-4" />
              <h2 className="text-3xl font-serif text-champagne-900 mb-4">Professional Printable Binders</h2>
              <p className="text-champagne-700 max-w-2xl mx-auto">
                Export your entire wedding plan as a beautiful printable binder. Perfect for day-of reference and as a keepsake!
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <FileText className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-champagne-900 mb-2">Complete Binder</h3>
                <p className="text-sm text-champagne-600">25-40 pages with everything you need</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-champagne-900 mb-2">Day-Of Timeline</h3>
                <p className="text-sm text-champagne-600">Hour-by-hour wedding day schedule</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <Download className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-champagne-900 mb-2">Instant Download</h3>
                <p className="text-sm text-champagne-600">Print-ready PDF files</p>
              </div>
            </div>
          </div>
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Printer className="w-10 h-10 text-champagne-600" />
            <h1 className="text-4xl font-serif text-champagne-900">Printable Wedding Binder</h1>
          </div>
          <p className="text-champagne-700 mb-4">
            Download professional printables for your wedding planning and day-of coordination
          </p>

          {/* Tier & Exports Status */}
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-champagne-200">
              <div className="text-xs text-champagne-600">Your Plan</div>
              <div className="font-semibold text-champagne-900 capitalize">{userTier.tier}</div>
            </div>
            <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-champagne-200">
              <div className="text-xs text-champagne-600">Complete Binder Exports</div>
              <div className="font-semibold text-champagne-900">
                {userTier.tier === 'premium' ? 'Unlimited ✨' : `${userTier.exportsRemaining} remaining`}
              </div>
            </div>
            {userTier.tier === 'standard' && (
              <button
                onClick={() => router.push('/pricing')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
              >
                Upgrade for Unlimited
              </button>
            )}
          </div>
        </div>

        {/* Printables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {printables.map((printable) => {
            const Icon = printable.icon;
            const colors = getColorClasses(printable.color);
            const isLocked = printable.tier === 'premium' && userTier.tier !== 'premium';
            const noExportsLeft = printable.id === 'complete-binder' && userTier.tier === 'standard' && userTier.exportsRemaining <= 0;

            return (
              <div
                key={printable.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Header */}
                <div className={`${colors.bg} px-6 py-6 relative`}>
                  {isLocked && (
                    <div className="absolute top-4 right-4">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <Icon className={`w-12 h-12 ${colors.icon} mb-3`} />
                  <h3 className="text-xl font-serif text-champagne-900 mb-1">{printable.title}</h3>
                  <p className="text-sm text-champagne-600 mb-2">{printable.description}</p>
                  <div className="text-xs text-champagne-500">{printable.pages}</div>
                  {printable.tier === 'premium' && (
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                        Premium Only
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-champagne-900 mb-2">Includes:</div>
                    <ul className="space-y-1">
                      {printable.includes.slice(0, 4).map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs text-champagne-700">
                          <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                      {printable.includes.length > 4 && (
                        <li className="text-xs text-champagne-500 pl-5">
                          + {printable.includes.length - 4} more items
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={() => handleDownload(printable.id)}
                    disabled={isGenerating || (isLocked || noExportsLeft)}
                    className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors flex items-center justify-center gap-2 ${
                      isLocked || noExportsLeft
                        ? 'bg-gray-400 cursor-not-allowed'
                        : colors.button
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating...
                      </>
                    ) : isLocked ? (
                      <>
                        <Lock className="w-4 h-4" />
                        Upgrade to Access
                      </>
                    ) : noExportsLeft ? (
                      <>
                        <Lock className="w-4 h-4" />
                        No Exports Left
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Download PDF
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Banner */}
        <div className="mt-12 bg-champagne-100 border-l-4 border-champagne-600 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <FileText className="w-6 h-6 text-champagne-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-champagne-900 mb-2">About Your Printables</h3>
              <p className="text-sm text-champagne-700 mb-3">
                All printables are generated with your current wedding details, budget, timeline, vendors, and décor plans.
                Keep your information up-to-date in Settings for the most accurate exports!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-semibold text-champagne-900 mb-1">Standard Plan</div>
                  <div className="text-champagne-600">1 Complete Binder export + unlimited single printables</div>
                </div>
                <div>
                  <div className="font-semibold text-champagne-900 mb-1">Premium Plan</div>
                  <div className="text-champagne-600">Unlimited exports of all printables + exclusive templates</div>
                </div>
                <div>
                  <div className="font-semibold text-champagne-900 mb-1">Print Quality</div>
                  <div className="text-champagne-600">High-resolution PDFs optimized for home or professional printing</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
