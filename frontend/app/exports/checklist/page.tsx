'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Printer, ArrowLeft, Square } from 'lucide-react';

export default function ChecklistExport() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    try {
      // Security check
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth');
        return;
      }

      setAuthorized(true);

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      setUserData(data);
    } catch (err) {
      console.error('Auth error:', err);
      router.push('/auth');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checklist...</p>
        </div>
      </div>
    );
  }

  // Wedding planning checklist by timeline
  const checklistSections = [
    {
      title: '12+ Months Before',
      tasks: [
        'Set wedding date',
        'Determine budget',
        'Create guest list (preliminary)',
        'Hire wedding planner (optional)',
        'Book ceremony venue',
        'Book reception venue',
        'Choose wedding party',
        'Start dress shopping',
        'Research photographers',
        'Research caterers'
      ]
    },
    {
      title: '9-11 Months Before',
      tasks: [
        'Book photographer',
        'Book videographer',
        'Book caterer',
        'Book florist',
        'Book DJ or band',
        'Order wedding dress',
        'Reserve hotel blocks for guests',
        'Send save-the-dates',
        'Start wedding website',
        'Register for gifts'
      ]
    },
    {
      title: '6-8 Months Before',
      tasks: [
        'Book hair and makeup artist',
        'Book transportation',
        'Order bridesmaids dresses',
        'Order groomsmen attire',
        'Plan honeymoon',
        'Book officiant',
        'Order wedding cake',
        'Finalize ceremony details',
        'Purchase wedding rings',
        'Start dance lessons (optional)'
      ]
    },
    {
      title: '4-5 Months Before',
      tasks: [
        'Finalize menu with caterer',
        'Order invitations',
        'Book rentals (tables, chairs, linens)',
        'Finalize flower arrangements',
        'Plan rehearsal dinner',
        'Purchase wedding favors',
        'Schedule dress fittings',
        'Create seating chart',
        'Get marriage license info',
        'Book bachelor/bachelorette parties'
      ]
    },
    {
      title: '2-3 Months Before',
      tasks: [
        'Mail invitations',
        'Have final dress fitting',
        'Finalize timeline with vendors',
        'Write vows (if personal)',
        'Break in wedding shoes',
        'Get wedding-day emergency kit',
        'Plan wedding day breakfast',
        'Confirm all vendor details',
        'Create day-of timeline',
        'Schedule final venue walkthrough'
      ]
    },
    {
      title: '1 Month Before',
      tasks: [
        'Get marriage license',
        'Final headcount to caterer',
        'Finalize seating chart',
        'Confirm final payments',
        'Create vendor tip envelopes',
        'Write thank you toasts',
        'Attend rehearsal',
        'Give final guest count to vendors',
        'Pack for honeymoon',
        'Confirm transportation times'
      ]
    },
    {
      title: '1 Week Before',
      tasks: [
        'Get manicure/pedicure',
        'Rehearsal dinner',
        'Give timeline to wedding party',
        'Prepare vendor payments',
        'Pack wedding day bag',
        'Confirm all vendor arrival times',
        'Get plenty of rest',
        'Eat healthy meals',
        'Hydrate',
        'Delegate day-of tasks'
      ]
    },
    {
      title: 'Wedding Day',
      tasks: [
        'Eat breakfast',
        'Stay hydrated',
        'Hair and makeup',
        'Get dressed',
        'Take photos',
        'Enjoy your ceremony',
        'Enjoy your reception',
        'Dance',
        'Eat cake',
        'Celebrate!'
      ]
    }
  ];

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          @page {
            margin: 0.5in;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .page-break {
            page-break-before: always;
          }
        }
      `}</style>

      {/* Screen-only controls */}
      <div className="no-print bg-gradient-to-br from-champagne-50 to-rose-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/exports')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Exports
            </button>
            <button
              onClick={handlePrint}
              className="px-6 py-2 bg-gradient-to-r from-champagne-400 to-rose-400 hover:from-champagne-500 hover:to-rose-500 text-white font-semibold rounded-lg flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Checklist
            </button>
          </div>
        </div>
      </div>

      {/* Printable content */}
      <div className="max-w-4xl mx-auto p-8 bg-white">
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-gray-200 pb-6">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
            Wedding Planning Checklist
          </h1>
          <h2 className="text-2xl text-gray-700 mb-2">{userData?.full_name || 'Your Wedding'}</h2>
          {userData?.wedding_date && (
            <p className="text-lg text-gray-600">
              {new Date(userData.wedding_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          )}
        </div>

        {/* Checklist sections */}
        {checklistSections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className={`mb-8 ${sectionIndex === 4 ? 'page-break' : ''}`}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-champagne-200">
              {section.title}
            </h2>
            <div className="space-y-2">
              {section.tasks.map((task, taskIndex) => (
                <div
                  key={taskIndex}
                  className="flex items-start gap-3 py-1.5"
                >
                  <div className="mt-0.5 flex-shrink-0">
                    <Square className="w-5 h-5 text-gray-400" />
                  </div>
                  <span className="text-gray-800 flex-1">{task}</span>
                  <div className="flex-shrink-0 text-xs text-gray-400 w-24">
                    Date: _______
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t-2 border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Generated from Bella Wedding AI | bellaweddingai.com
          </p>
          <p className="text-xs text-gray-400 text-center mt-2">
            Check off tasks as you complete them. Keep this checklist handy throughout your planning journey!
          </p>
        </div>
      </div>
    </>
  );
}
