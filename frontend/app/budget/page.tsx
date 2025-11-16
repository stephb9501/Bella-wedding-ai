'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, DollarSign, Plus, Edit, Trash2, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import AuthWall from '@/components/AuthWall';

interface BudgetItem {
  id: string;
  category: string;
  estimated: number;
  actual: number;
  paid: boolean;
}

const INITIAL_BUDGET: BudgetItem[] = [
  { id: '1', category: 'Venue', estimated: 8000, actual: 7500, paid: true },
  { id: '2', category: 'Catering', estimated: 6000, actual: 0, paid: false },
  { id: '3', category: 'Photography', estimated: 3000, actual: 2800, paid: true },
  { id: '4', category: 'Videography', estimated: 2500, actual: 0, paid: false },
  { id: '5', category: 'Florist', estimated: 2000, actual: 0, paid: false },
  { id: '6', category: 'DJ/Music', estimated: 1500, actual: 0, paid: false },
  { id: '7', category: 'Wedding Dress', estimated: 2000, actual: 1800, paid: true },
  { id: '8', category: 'Groom Attire', estimated: 500, actual: 450, paid: true },
  { id: '9', category: 'Invitations', estimated: 400, actual: 0, paid: false },
  { id: '10', category: 'Wedding Cake', estimated: 600, actual: 0, paid: false },
  { id: '11', category: 'Hair & Makeup', estimated: 800, actual: 0, paid: false },
  { id: '12', category: 'Transportation', estimated: 500, actual: 0, paid: false },
  { id: '13', category: 'Decorations', estimated: 1000, actual: 0, paid: false },
  { id: '14', category: 'Favors', estimated: 300, actual: 0, paid: false },
  { id: '15', category: 'Rings', estimated: 2000, actual: 1900, paid: true },
  { id: '16', category: 'Honeymoon', estimated: 4000, actual: 0, paid: false },
  { id: '17', category: 'Miscellaneous', estimated: 500, actual: 250, paid: false },
];

export default function Budget() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [budget, setBudget] = useState<BudgetItem[]>(INITIAL_BUDGET);
  const [totalBudget, setTotalBudget] = useState(40000);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center">
        <Heart className="w-12 h-12 text-champagne-600 animate-pulse" />
      </div>
    );
  }

  // Preview content - show budget categories
  const previewContent = (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Budget Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {INITIAL_BUDGET.map(item => (
            <div key={item.id} className="flex items-center gap-2 text-gray-700">
              <DollarSign className="w-4 h-4 text-champagne-600" />
              <span className="text-sm">{item.category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return <AuthWall featureName="Budget Tracker" previewContent={previewContent} fullLock={false} />;
  }

  const stats = {
    estimated: budget.reduce((sum, item) => sum + item.estimated, 0),
    actual: budget.reduce((sum, item) => sum + item.actual, 0),
    remaining: totalBudget - budget.reduce((sum, item) => sum + item.actual, 0),
    paid: budget.filter(item => item.paid).reduce((sum, item) => sum + item.actual, 0),
  };

  const percentageSpent = Math.round((stats.actual / totalBudget) * 100);
  const isOverBudget = stats.estimated > totalBudget;

  const updateActual = (id: string, value: number) => {
    setBudget(budget.map(item =>
      item.id === id ? { ...item, actual: value } : item
    ));
  };

  const togglePaid = (id: string) => {
    setBudget(budget.map(item =>
      item.id === id ? { ...item, paid: !item.paid } : item
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 via-rose-50 to-champagne-50">
      {/* Header */}
      <header className="bg-white border-b border-champagne-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-serif font-bold text-gray-900">Budget Tracker</h1>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      {/* Hero Banner with Photo */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/wedding-photos/deltalow-447.jpg')",
            backgroundPosition: 'center center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-24 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-12 bg-green-400/60"></div>
            <DollarSign className="w-8 h-8 text-green-400" />
            <div className="h-px w-12 bg-green-400/60"></div>
          </div>

          <h2 className="text-5xl md:text-6xl font-serif font-bold text-white mb-6">
            Wedding Budget
          </h2>
          <p className="text-2xl text-white/95 font-light max-w-3xl mx-auto">
            Track your spending across all categories and stay on budget for your perfect day
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Total Budget</span>
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">${totalBudget.toLocaleString()}</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Actual Spent</span>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-600">${stats.actual.toLocaleString()}</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className={`h-2 rounded-full transition-all ${
                  percentageSpent > 100 ? 'bg-red-600' : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(percentageSpent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">{percentageSpent}% of budget</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Remaining</span>
              <TrendingDown className="w-5 h-5 text-emerald-600" />
            </div>
            <div className={`text-3xl font-bold ${stats.remaining < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              ${Math.abs(stats.remaining).toLocaleString()}
            </div>
            {stats.remaining < 0 && (
              <p className="text-xs text-red-600 mt-2">Over budget!</p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Paid</span>
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-600">${stats.paid.toLocaleString()}</div>
          </div>
        </div>

        {/* Warning */}
        {isOverBudget && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-8 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-900">Your estimated costs exceed your budget!</p>
              <p className="text-sm text-red-700 mt-1">
                Consider adjusting your budget or reducing estimated costs in some categories.
              </p>
            </div>
          </div>
        )}

        {/* Budget Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Estimated</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actual</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Difference</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Paid</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {budget.map((item) => {
                  const difference = item.actual - item.estimated;
                  const percentOfEstimate = item.estimated > 0
                    ? Math.round((item.actual / item.estimated) * 100)
                    : 0;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{item.category}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900">
                        ${item.estimated.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <input
                          type="number"
                          value={item.actual}
                          onChange={(e) => updateActual(item.id, Number(e.target.value))}
                          className="w-28 px-3 py-1 text-right border border-gray-300 rounded-lg focus:outline-none focus:border-champagne-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-medium ${
                          difference > 0 ? 'text-red-600' : difference < 0 ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {difference > 0 && '+'}${difference.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={item.paid}
                          onChange={() => togglePaid(item.id)}
                          className="w-5 h-5 rounded border-gray-300 text-champagne-600 focus:ring-champagne-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.actual === 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Not Started
                          </span>
                        ) : item.paid ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr className="font-bold">
                  <td className="px-6 py-4 text-gray-900">TOTAL</td>
                  <td className="px-6 py-4 text-right text-gray-900">${stats.estimated.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-gray-900">${stats.actual.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`${
                      stats.actual > stats.estimated ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {stats.actual > stats.estimated && '+'}${(stats.actual - stats.estimated).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
