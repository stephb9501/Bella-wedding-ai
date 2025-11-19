'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Printer, ArrowLeft } from 'lucide-react';

export default function BudgetExport() {
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
          <p className="text-gray-600">Loading budget...</p>
        </div>
      </div>
    );
  }

  // Sample budget categories - in production this would come from database
  const budgetCategories = [
    { category: 'Venue', budgeted: 8000, spent: 8000, paid: true, notes: 'Deposit paid' },
    { category: 'Catering', budgeted: 12000, spent: 0, paid: false, notes: 'Final count due 2 weeks before' },
    { category: 'Photography', budgeted: 3500, spent: 1000, paid: false, notes: 'Deposit paid, balance due day-of' },
    { category: 'Videography', budgeted: 2500, spent: 750, paid: false, notes: 'Deposit paid' },
    { category: 'Flowers', budgeted: 2000, spent: 600, paid: false, notes: 'Deposit paid' },
    { category: 'DJ/Music', budgeted: 1500, spent: 500, paid: false, notes: 'Deposit paid' },
    { category: 'Wedding Dress', budgeted: 2500, spent: 2200, paid: true, notes: 'Paid in full' },
    { category: 'Groom Attire', budgeted: 500, spent: 450, paid: true, notes: 'Paid in full' },
    { category: 'Bridesmaids Dresses', budgeted: 0, spent: 0, paid: true, notes: 'Paid by bridesmaids' },
    { category: 'Groomsmen Attire', budgeted: 0, spent: 0, paid: true, notes: 'Paid by groomsmen' },
    { category: 'Invitations', budgeted: 600, spent: 550, paid: true, notes: 'Paid in full' },
    { category: 'Wedding Cake', budgeted: 800, spent: 200, paid: false, notes: 'Deposit paid' },
    { category: 'Decorations', budgeted: 1500, spent: 400, paid: false, notes: 'In progress' },
    { category: 'Favors', budgeted: 400, spent: 0, paid: false, notes: 'Not ordered yet' },
    { category: 'Transportation', budgeted: 800, spent: 400, paid: false, notes: 'Deposit paid' },
    { category: 'Hair & Makeup', budgeted: 1000, spent: 0, paid: false, notes: 'Final payment day-of' },
    { category: 'Rehearsal Dinner', budgeted: 2000, spent: 0, paid: false, notes: 'Not booked yet' },
    { category: 'Honeymoon', budgeted: 5000, spent: 1500, paid: false, notes: 'Deposit paid' },
    { category: 'Rings', budgeted: 3000, spent: 2800, paid: true, notes: 'Paid in full' },
    { category: 'Marriage License', budgeted: 100, spent: 0, paid: false, notes: 'Get 1 month before' },
    { category: 'Miscellaneous', budgeted: 1000, spent: 250, paid: false, notes: 'Ongoing expenses' },
  ];

  const totalBudgeted = budgetCategories.reduce((sum, cat) => sum + cat.budgeted, 0);
  const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);
  const remaining = totalBudgeted - totalSpent;
  const percentSpent = (totalSpent / totalBudgeted) * 100;

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
        }
      `}</style>

      {/* Screen-only controls */}
      <div className="no-print bg-gradient-to-br from-champagne-50 to-rose-50 p-4">
        <div className="max-w-6xl mx-auto">
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
              Print Budget
            </button>
          </div>
        </div>
      </div>

      {/* Printable content */}
      <div className="max-w-6xl mx-auto p-8 bg-white">
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-gray-200 pb-6">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
            Wedding Budget Summary
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

        {/* Budget Overview */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg text-center border-2 border-blue-200">
            <div className="text-sm text-gray-600 mb-1">Total Budget</div>
            <div className="text-2xl font-bold text-blue-900">
              ${totalBudgeted.toLocaleString()}
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center border-2 border-red-200">
            <div className="text-sm text-gray-600 mb-1">Total Spent</div>
            <div className="text-2xl font-bold text-red-900">
              ${totalSpent.toLocaleString()}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center border-2 border-green-200">
            <div className="text-sm text-gray-600 mb-1">Remaining</div>
            <div className="text-2xl font-bold text-green-900">
              ${remaining.toLocaleString()}
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center border-2 border-purple-200">
            <div className="text-sm text-gray-600 mb-1">% Spent</div>
            <div className="text-2xl font-bold text-purple-900">
              {percentSpent.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Budget Table */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="text-left p-3 font-bold text-gray-900">Category</th>
              <th className="text-right p-3 font-bold text-gray-900">Budgeted</th>
              <th className="text-right p-3 font-bold text-gray-900">Spent</th>
              <th className="text-right p-3 font-bold text-gray-900">Remaining</th>
              <th className="text-center p-3 font-bold text-gray-900">Status</th>
              <th className="text-left p-3 font-bold text-gray-900">Notes</th>
            </tr>
          </thead>
          <tbody>
            {budgetCategories.map((item, index) => {
              const itemRemaining = item.budgeted - item.spent;
              const isOverBudget = item.spent > item.budgeted;

              return (
                <tr
                  key={index}
                  className={`border-b border-gray-200 ${
                    isOverBudget ? 'bg-red-50' : index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <td className="p-3 text-gray-900">{item.category}</td>
                  <td className="p-3 text-right text-gray-900">
                    ${item.budgeted.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-gray-900">
                    ${item.spent.toLocaleString()}
                  </td>
                  <td className={`p-3 text-right font-semibold ${
                    isOverBudget ? 'text-red-700' : 'text-green-700'
                  }`}>
                    ${itemRemaining.toLocaleString()}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                      item.paid ? 'bg-green-200 text-green-900' : 'bg-yellow-200 text-yellow-900'
                    }`}>
                      {item.paid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-600">{item.notes}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-200 border-t-2 border-gray-400 font-bold">
              <td className="p-3 text-gray-900">TOTAL</td>
              <td className="p-3 text-right text-gray-900">
                ${totalBudgeted.toLocaleString()}
              </td>
              <td className="p-3 text-right text-gray-900">
                ${totalSpent.toLocaleString()}
              </td>
              <td className="p-3 text-right text-green-900">
                ${remaining.toLocaleString()}
              </td>
              <td className="p-3"></td>
              <td className="p-3"></td>
            </tr>
          </tfoot>
        </table>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t-2 border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Generated from Bella Wedding AI | bellaweddingai.com
          </p>
          <p className="text-xs text-gray-400 text-center mt-2">
            Keep this budget updated as you make payments and finalize contracts
          </p>
        </div>
      </div>
    </>
  );
}
