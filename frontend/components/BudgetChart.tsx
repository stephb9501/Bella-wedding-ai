'use client';

import { useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface BudgetItem {
  id: string;
  category: string;
  budgeted_amount: number;
  spent_amount: number;
}

interface Props {
  items: BudgetItem[];
  totalBudget: number;
}

export function BudgetChart({ items, totalBudget }: Props) {
  const stats = useMemo(() => {
    const totalSpent = items.reduce((sum, item) => sum + (item.spent_amount || 0), 0);
    const totalBudgeted = items.reduce((sum, item) => sum + (item.budgeted_amount || 0), 0);
    const remaining = totalBudget - totalSpent;
    const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Category breakdown
    const categoryData = items.map(item => ({
      category: item.category,
      budgeted: item.budgeted_amount,
      spent: item.spent_amount || 0,
      remaining: item.budgeted_amount - (item.spent_amount || 0),
      percentage: item.budgeted_amount > 0
        ? ((item.spent_amount || 0) / item.budgeted_amount) * 100
        : 0,
    })).sort((a, b) => b.spent - a.spent);

    return {
      totalSpent,
      totalBudgeted,
      remaining,
      percentageUsed,
      categoryData,
    };
  }, [items, totalBudget]);

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600 bg-red-50';
    if (percentage >= 80) return 'text-amber-600 bg-amber-50';
    return 'text-green-600 bg-green-50';
  };

  const getBarColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-amber-500';
    return 'bg-champagne-500';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Budget</span>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${totalBudget.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Spent</span>
            <TrendingUp className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${stats.totalSpent.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.percentageUsed.toFixed(1)}% of budget
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Remaining</span>
            <TrendingDown className="w-5 h-5 text-green-500" />
          </div>
          <p className={`text-2xl font-bold ${stats.remaining < 0 ? 'text-red-600' : 'text-gray-900'}`}>
            ${Math.abs(stats.remaining).toLocaleString()}
          </p>
          {stats.remaining < 0 && (
            <p className="text-xs text-red-600 mt-1">Over budget</p>
          )}
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900">Overall Progress</h3>
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(stats.percentageUsed)}`}>
            {stats.percentageUsed.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all ${getBarColor(stats.percentageUsed)}`}
            style={{ width: `${Math.min(stats.percentageUsed, 100)}%` }}
          />
        </div>
        {stats.percentageUsed >= 80 && (
          <div className="flex items-center gap-2 mt-3 text-sm text-amber-700">
            <AlertCircle className="w-4 h-4" />
            {stats.percentageUsed >= 100
              ? 'You are over budget!'
              : 'Warning: Approaching budget limit'}
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4">Spending by Category</h3>
        <div className="space-y-4">
          {stats.categoryData.map((cat, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-900">{cat.category}</span>
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">
                    ${cat.spent.toLocaleString()} / ${cat.budgeted.toLocaleString()}
                  </span>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(cat.percentage)}`}>
                    {cat.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getBarColor(cat.percentage)}`}
                  style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {stats.percentageUsed >= 75 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-bold text-blue-900 mb-2">Budget Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Consider negotiating with vendors for better rates</li>
            <li>• Look for off-season discounts</li>
            <li>• Prioritize must-have items and cut non-essentials</li>
            <li>• DIY some decorations to save costs</li>
          </ul>
        </div>
      )}
    </div>
  );
}
