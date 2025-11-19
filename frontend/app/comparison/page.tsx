'use client';

import { useState, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  X,
  Sparkles,
  DollarSign,
  Crown,
  Users,
  MessageSquare,
  Zap,
  Shield,
  Star,
  TrendingUp,
  Heart,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ComparisonFeature {
  category: string;
  features: {
    name: string;
    bella: boolean | string;
    theKnot: boolean | string;
    weddingWire: boolean | string;
    zola: boolean | string;
    joy: boolean | string;
    minted: boolean | string;
  }[];
}

export default function ComparisonPage() {
  const router = useRouter();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    'Pricing',
    'AI Features',
    'Planning Tools'
  ]);

  const toggleCategory = (category: string) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter(c => c !== category));
    } else {
      setExpandedCategories([...expandedCategories, category]);
    }
  };

  const comparisonData: ComparisonFeature[] = [
    {
      category: 'Pricing',
      features: [
        {
          name: 'Free Plan',
          bella: 'Full Featured',
          theKnot: 'Limited',
          weddingWire: 'Limited',
          zola: 'Limited',
          joy: 'Basic Only',
          minted: 'Limited'
        },
        {
          name: 'Pro Plan (Monthly)',
          bella: '$29/mo',
          theKnot: '$49/mo',
          weddingWire: '$39/mo',
          zola: '$35/mo',
          joy: '$45/mo',
          minted: '$42/mo'
        },
        {
          name: 'Premium Plan',
          bella: '$49/mo',
          theKnot: '$99/mo',
          weddingWire: '$79/mo',
          zola: '$69/mo',
          joy: '$89/mo',
          minted: '$75/mo'
        },
        {
          name: 'Free Trial Period',
          bella: '30 days',
          theKnot: '14 days',
          weddingWire: '14 days',
          zola: '7 days',
          joy: '14 days',
          minted: '7 days'
        },
        {
          name: 'Money-Back Guarantee',
          bella: true,
          theKnot: false,
          weddingWire: false,
          zola: false,
          joy: false,
          minted: false
        }
      ]
    },
    {
      category: 'AI Features',
      features: [
        {
          name: 'AI Wedding Planner',
          bella: 'Advanced',
          theKnot: false,
          weddingWire: false,
          zola: false,
          joy: false,
          minted: false
        },
        {
          name: 'AI Vow Writer',
          bella: true,
          theKnot: false,
          weddingWire: false,
          zola: false,
          joy: false,
          minted: false
        },
        {
          name: 'Smart Vendor Matching',
          bella: 'AI-Powered',
          theKnot: 'Basic',
          weddingWire: 'Basic',
          zola: false,
          joy: false,
          minted: false
        },
        {
          name: 'Intelligent Budget Suggestions',
          bella: true,
          theKnot: false,
          weddingWire: false,
          zola: 'Basic',
          joy: false,
          minted: false
        },
        {
          name: 'AI Timeline Generator',
          bella: true,
          theKnot: false,
          weddingWire: false,
          zola: false,
          joy: false,
          minted: false
        }
      ]
    },
    {
      category: 'Planning Tools',
      features: [
        {
          name: 'Guest Management',
          bella: true,
          theKnot: true,
          weddingWire: true,
          zola: true,
          joy: true,
          minted: true
        },
        {
          name: 'Seating Chart Builder',
          bella: 'Drag & Drop',
          theKnot: 'Basic',
          weddingWire: 'Basic',
          zola: true,
          joy: 'Basic',
          minted: false
        },
        {
          name: 'Budget Tracker',
          bella: 'Advanced',
          theKnot: 'Basic',
          weddingWire: 'Basic',
          zola: 'Basic',
          joy: 'Basic',
          minted: false
        },
        {
          name: 'Wedding Timeline',
          bella: 'Minute-by-Minute',
          theKnot: 'Basic',
          weddingWire: 'Basic',
          zola: false,
          joy: 'Basic',
          minted: false
        },
        {
          name: 'Smart Checklist',
          bella: 'Adaptive',
          theKnot: 'Static',
          weddingWire: 'Static',
          zola: 'Static',
          joy: 'Static',
          minted: 'Static'
        },
        {
          name: 'Bridal Party Management',
          bella: true,
          theKnot: 'Limited',
          weddingWire: 'Limited',
          zola: false,
          joy: 'Limited',
          minted: false
        }
      ]
    },
    {
      category: 'Vendor Features',
      features: [
        {
          name: 'Vendor Discovery',
          bella: 'Nationwide',
          theKnot: 'Nationwide',
          weddingWire: 'Nationwide',
          zola: 'Limited',
          joy: 'Limited',
          minted: 'Limited'
        },
        {
          name: 'Direct Vendor Messaging',
          bella: true,
          theKnot: true,
          weddingWire: true,
          zola: 'Limited',
          joy: 'Limited',
          minted: false
        },
        {
          name: 'Vendor Reviews',
          bella: 'Verified',
          theKnot: 'Mixed',
          weddingWire: 'Mixed',
          zola: 'Limited',
          joy: 'Limited',
          minted: 'Limited'
        },
        {
          name: 'Contract Management',
          bella: true,
          theKnot: false,
          weddingWire: false,
          zola: false,
          joy: false,
          minted: false
        },
        {
          name: 'Payment Processing',
          bella: true,
          theKnot: false,
          weddingWire: false,
          zola: 'Limited',
          joy: false,
          minted: false
        }
      ]
    },
    {
      category: 'Wedding Website',
      features: [
        {
          name: 'Custom Wedding Website',
          bella: true,
          theKnot: true,
          weddingWire: true,
          zola: true,
          joy: true,
          minted: true
        },
        {
          name: 'Custom Domain',
          bella: true,
          theKnot: 'Premium',
          weddingWire: 'Premium',
          zola: 'Premium',
          joy: 'Premium',
          minted: 'Premium'
        },
        {
          name: 'Templates Available',
          bella: '50+',
          theKnot: '30+',
          weddingWire: '25+',
          zola: '40+',
          joy: '20+',
          minted: '35+'
        },
        {
          name: 'Mobile Optimized',
          bella: true,
          theKnot: true,
          weddingWire: true,
          zola: true,
          joy: true,
          minted: true
        },
        {
          name: 'RSVP Tracking',
          bella: 'Advanced',
          theKnot: 'Basic',
          weddingWire: 'Basic',
          zola: 'Advanced',
          joy: 'Basic',
          minted: 'Basic'
        }
      ]
    },
    {
      category: 'Support & Service',
      features: [
        {
          name: 'Customer Support',
          bella: '24/7 Chat',
          theKnot: 'Email Only',
          weddingWire: 'Email Only',
          zola: 'Business Hours',
          joy: 'Email Only',
          minted: 'Limited'
        },
        {
          name: 'Phone Support',
          bella: true,
          theKnot: 'Premium Only',
          weddingWire: 'Premium Only',
          zola: false,
          joy: false,
          minted: false
        },
        {
          name: 'Onboarding Assistance',
          bella: true,
          theKnot: false,
          weddingWire: false,
          zola: 'Limited',
          joy: false,
          minted: false
        },
        {
          name: 'Video Tutorials',
          bella: 'Extensive',
          theKnot: 'Limited',
          weddingWire: 'Limited',
          zola: 'Basic',
          joy: 'Limited',
          minted: 'Basic'
        },
        {
          name: 'Community Forum',
          bella: true,
          theKnot: true,
          weddingWire: true,
          zola: false,
          joy: 'Limited',
          minted: false
        }
      ]
    },
    {
      category: 'Additional Features',
      features: [
        {
          name: 'Gift Registry',
          bella: 'Integrated',
          theKnot: true,
          weddingWire: 'Limited',
          zola: true,
          joy: 'Limited',
          minted: true
        },
        {
          name: 'Photo Gallery',
          bella: 'Unlimited',
          theKnot: 'Limited',
          weddingWire: 'Limited',
          zola: 'Limited',
          joy: 'Limited',
          minted: 'Premium'
        },
        {
          name: 'Digital Invitations',
          bella: true,
          theKnot: true,
          weddingWire: 'Limited',
          zola: true,
          joy: true,
          minted: true
        },
        {
          name: 'Honeymoon Planning',
          bella: true,
          theKnot: 'Affiliate',
          weddingWire: 'Affiliate',
          zola: true,
          joy: false,
          minted: false
        },
        {
          name: 'Mobile App',
          bella: 'Coming Soon',
          theKnot: true,
          weddingWire: true,
          zola: true,
          joy: true,
          minted: 'Limited'
        }
      ]
    }
  ];

  const renderValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-6 h-6 text-green-600 mx-auto" />
      ) : (
        <X className="w-6 h-6 text-red-400 mx-auto" />
      );
    }
    return <span className="text-sm font-medium text-gray-900">{value}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 flex items-center justify-center gap-3">
              <Sparkles className="w-12 h-12" />
              Why Choose Bella Wedding AI?
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              See how Bella Wedding AI compares to other wedding planning platforms.
              We offer more features, better pricing, and the only AI-powered planning assistant.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/auth')}
                className="px-8 py-4 bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-100 transition text-lg shadow-lg"
              >
                Start Free Trial
              </button>
              <button
                onClick={() => router.push('/pricing')}
                className="px-8 py-4 bg-purple-700 text-white font-bold rounded-lg hover:bg-purple-800 transition text-lg"
              >
                View Pricing
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Advantages */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-purple-500">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">AI-Powered</h3>
            <p className="text-gray-600">
              The only platform with advanced AI wedding planning assistant. Get intelligent
              suggestions, automated task management, and personalized recommendations.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-green-500">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Best Value</h3>
            <p className="text-gray-600">
              40-50% cheaper than competitors with more features included. Our Pro plan at $29/mo
              offers what others charge $49-99/mo for.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-blue-500">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Bride-First</h3>
            <p className="text-gray-600">
              Built by brides, for brides. Every feature is designed to make wedding planning
              easier, more organized, and actually enjoyable.
            </p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
            <h2 className="text-3xl font-bold mb-2">Feature Comparison</h2>
            <p className="text-white/90">
              Detailed side-by-side comparison with leading wedding planning platforms
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 sticky left-0 bg-gray-50 z-10">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center min-w-[140px]">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-2">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div className="font-bold text-purple-600 text-lg">Bella AI</div>
                      <div className="text-xs text-gray-500">Our Platform</div>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center min-w-[140px]">
                    <div className="font-semibold text-gray-700">The Knot</div>
                    <div className="text-xs text-gray-500">Market Leader</div>
                  </th>
                  <th className="px-6 py-4 text-center min-w-[140px]">
                    <div className="font-semibold text-gray-700">WeddingWire</div>
                    <div className="text-xs text-gray-500">WeddingWire</div>
                  </th>
                  <th className="px-6 py-4 text-center min-w-[140px]">
                    <div className="font-semibold text-gray-700">Zola</div>
                    <div className="text-xs text-gray-500">Registry Focus</div>
                  </th>
                  <th className="px-6 py-4 text-center min-w-[140px]">
                    <div className="font-semibold text-gray-700">Joy</div>
                    <div className="text-xs text-gray-500">Website Focus</div>
                  </th>
                  <th className="px-6 py-4 text-center min-w-[140px]">
                    <div className="font-semibold text-gray-700">Minted</div>
                    <div className="text-xs text-gray-500">Design Focus</div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {comparisonData.map((section, sectionIdx) => (
                  <Fragment key={sectionIdx}>
                    <tr
                      className="bg-gray-100 border-t-2 border-gray-300 cursor-pointer hover:bg-gray-200 transition"
                      onClick={() => toggleCategory(section.category)}
                    >
                      <td
                        colSpan={7}
                        className="px-6 py-4 font-bold text-gray-900 sticky left-0 bg-gray-100 z-10"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg">{section.category}</span>
                          {expandedCategories.includes(section.category) ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                      </td>
                    </tr>

                    {expandedCategories.includes(section.category) &&
                      section.features.map((feature, featureIdx) => (
                        <tr
                          key={featureIdx}
                          className={`border-b border-gray-200 ${
                            featureIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-inherit z-10">
                            {feature.name}
                          </td>
                          <td className="px-6 py-4 text-center bg-purple-50">
                            <div className="font-semibold">{renderValue(feature.bella)}</div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {renderValue(feature.theKnot)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {renderValue(feature.weddingWire)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {renderValue(feature.zola)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {renderValue(feature.joy)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {renderValue(feature.minted)}
                          </td>
                        </tr>
                      ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Plan Your Dream Wedding?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of brides who chose Bella Wedding AI for smarter, easier wedding planning.
            Start your free 30-day trial today - no credit card required.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/auth')}
              className="px-10 py-4 bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-100 transition text-lg shadow-lg"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => router.push('/contact')}
              className="px-10 py-4 bg-purple-700 text-white font-bold rounded-lg hover:bg-purple-800 transition text-lg border-2 border-white/30"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-sm text-blue-900">
            All comparisons based on publicly available information as of January 2025.
            Features and pricing may vary. Check individual platforms for current details.
          </p>
        </div>
      </div>
    </div>
  );
}
