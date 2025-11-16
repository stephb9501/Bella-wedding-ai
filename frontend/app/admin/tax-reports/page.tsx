'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  BarChart3,
  Filter,
  Search,
  ChevronDown,
  Printer,
  Mail,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface TaxRecord {
  id: string;
  date: Date;
  customerName: string;
  customerEmail: string;
  customerType: 'bride' | 'vendor';
  transactionType: 'subscription' | 'commission' | 'booking' | 'refund';
  subscriptionTier?: string;
  amount: number;
  taxAmount: number;
  netAmount: number;
  status: 'completed' | 'pending' | 'refunded';
  paymentMethod: string;
  invoiceNumber: string;
}

interface MonthlySummary {
  month: string;
  subscriptionRevenue: number;
  commissionRevenue: number;
  refunds: number;
  netRevenue: number;
  taxCollected: number;
  transactions: number;
}

export default function TaxReportsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<TaxRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<TaxRecord[]>([]);
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('all');

  useEffect(() => {
    loadTaxRecords();
    generateMonthlySummaries();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, selectedYear, selectedMonth, selectedType, searchTerm, selectedQuarter]);

  const loadTaxRecords = () => {
    // In production, fetch from Supabase
    // For demo, generate sample data
    const sampleRecords: TaxRecord[] = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Generate sample transactions
    for (let i = 0; i < 150; i++) {
      const monthIndex = Math.floor(Math.random() * 12);
      const day = Math.floor(Math.random() * 28) + 1;
      const isBride = Math.random() > 0.6;
      const transactionTypes: ('subscription' | 'commission' | 'booking' | 'refund')[] = ['subscription', 'commission'];
      const transactionType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];

      let amount = 0;
      let tier = '';

      if (transactionType === 'subscription') {
        if (isBride) {
          const tiers = ['standard', 'premium'];
          tier = tiers[Math.floor(Math.random() * tiers.length)];
          amount = tier === 'standard' ? 19.99 : 29.99;
        } else {
          const vendorTiers = ['premium', 'featured', 'elite'];
          tier = vendorTiers[Math.floor(Math.random() * vendorTiers.length)];
          amount = tier === 'premium' ? 34.99 : tier === 'featured' ? 49.99 : 79.99;
        }
      } else if (transactionType === 'commission') {
        amount = Math.floor(Math.random() * 500) + 50; // $50-$550 commission
      }

      const taxRate = 0.08; // 8% tax
      const taxAmount = amount * taxRate;
      const netAmount = amount - taxAmount;

      sampleRecords.push({
        id: `txn-${i + 1}`,
        date: new Date(selectedYear, monthIndex, day),
        customerName: `Customer ${i + 1}`,
        customerEmail: `customer${i + 1}@email.com`,
        customerType: isBride ? 'bride' : 'vendor',
        transactionType,
        subscriptionTier: transactionType === 'subscription' ? tier : undefined,
        amount,
        taxAmount,
        netAmount,
        status: Math.random() > 0.95 ? 'refunded' : Math.random() > 0.9 ? 'pending' : 'completed',
        paymentMethod: Math.random() > 0.3 ? 'card' : 'bank',
        invoiceNumber: `INV-2025-${String(i + 1).padStart(5, '0')}`,
      });
    }

    setRecords(sampleRecords.sort((a, b) => b.date.getTime() - a.date.getTime()));
  };

  const generateMonthlySummaries = () => {
    const summaries: MonthlySummary[] = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 12; i++) {
      const monthRecords = records.filter(
        (r) => r.date.getMonth() === i && r.date.getFullYear() === selectedYear
      );

      summaries.push({
        month: months[i],
        subscriptionRevenue: monthRecords
          .filter((r) => r.transactionType === 'subscription' && r.status === 'completed')
          .reduce((sum, r) => sum + r.amount, 0),
        commissionRevenue: monthRecords
          .filter((r) => r.transactionType === 'commission' && r.status === 'completed')
          .reduce((sum, r) => sum + r.amount, 0),
        refunds: monthRecords
          .filter((r) => r.status === 'refunded')
          .reduce((sum, r) => sum + r.amount, 0),
        netRevenue: monthRecords
          .filter((r) => r.status === 'completed')
          .reduce((sum, r) => sum + r.netAmount, 0),
        taxCollected: monthRecords
          .filter((r) => r.status === 'completed')
          .reduce((sum, r) => sum + r.taxAmount, 0),
        transactions: monthRecords.filter((r) => r.status === 'completed').length,
      });
    }

    setMonthlySummaries(summaries);
  };

  const filterRecords = () => {
    let filtered = [...records];

    // Year filter
    filtered = filtered.filter((r) => r.date.getFullYear() === selectedYear);

    // Month filter
    if (selectedMonth !== 'all') {
      const monthIndex = parseInt(selectedMonth);
      filtered = filtered.filter((r) => r.date.getMonth() === monthIndex);
    }

    // Quarter filter
    if (selectedQuarter !== 'all') {
      const quarter = parseInt(selectedQuarter);
      const startMonth = (quarter - 1) * 3;
      const endMonth = startMonth + 2;
      filtered = filtered.filter((r) => {
        const month = r.date.getMonth();
        return month >= startMonth && month <= endMonth;
      });
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter((r) => r.transactionType === selectedType);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRecords(filtered);
  };

  const calculateYearlyTotals = () => {
    const completedRecords = records.filter(
      (r) => r.status === 'completed' && r.date.getFullYear() === selectedYear
    );

    return {
      totalRevenue: completedRecords.reduce((sum, r) => sum + r.amount, 0),
      totalTax: completedRecords.reduce((sum, r) => sum + r.taxAmount, 0),
      totalNet: completedRecords.reduce((sum, r) => sum + r.netAmount, 0),
      totalSubscriptions: completedRecords.filter((r) => r.transactionType === 'subscription').reduce((sum, r) => sum + r.amount, 0),
      totalCommissions: completedRecords.filter((r) => r.transactionType === 'commission').reduce((sum, r) => sum + r.amount, 0),
      totalRefunds: records.filter((r) => r.status === 'refunded' && r.date.getFullYear() === selectedYear).reduce((sum, r) => sum + r.amount, 0),
      transactionCount: completedRecords.length,
    };
  };

  const exportToCSV = () => {
    const headers = [
      'Date',
      'Invoice #',
      'Customer Name',
      'Email',
      'Type',
      'Transaction Type',
      'Tier',
      'Gross Amount',
      'Tax',
      'Net Amount',
      'Status',
      'Payment Method',
    ];

    const rows = filteredRecords.map((r) => [
      r.date.toLocaleDateString(),
      r.invoiceNumber,
      r.customerName,
      r.customerEmail,
      r.customerType,
      r.transactionType,
      r.subscriptionTier || 'N/A',
      r.amount.toFixed(2),
      r.taxAmount.toFixed(2),
      r.netAmount.toFixed(2),
      r.status,
      r.paymentMethod,
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax-report-${selectedYear}${selectedMonth !== 'all' ? `-${selectedMonth}` : ''}.csv`;
    a.click();
  };

  const printReport = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    if (status === 'completed') return 'bg-green-100 text-green-700';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-700';
    if (status === 'refunded') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle className="w-4 h-4" />;
    if (status === 'pending') return <Clock className="w-4 h-4" />;
    if (status === 'refunded') return <AlertCircle className="w-4 h-4" />;
    return null;
  };

  const yearlyTotals = calculateYearlyTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b-4 border-purple-600">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FileText className="w-10 h-10 text-purple-600" />
              </div>
              <div>
                <h1 className="text-4xl font-serif text-champagne-900 font-bold">Tax Reports & Income Tracking</h1>
                <p className="text-champagne-600 mt-1">Comprehensive financial reports for tax filing</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Export CSV
              </button>
              <button
                onClick={printReport}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Print
              </button>
            </div>
          </div>

          {/* Yearly Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-green-700 font-medium">Total Revenue</div>
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-900">${yearlyTotals.totalRevenue.toLocaleString()}</div>
              <div className="text-xs text-green-600 mt-1">{selectedYear} gross income</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-blue-700 font-medium">Net Income</div>
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-900">${yearlyTotals.totalNet.toLocaleString()}</div>
              <div className="text-xs text-blue-600 mt-1">After taxes</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-purple-700 font-medium">Tax Collected</div>
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-900">${yearlyTotals.totalTax.toLocaleString()}</div>
              <div className="text-xs text-purple-600 mt-1">8% sales tax</div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border-2 border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-yellow-700 font-medium">Transactions</div>
                <BarChart3 className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-yellow-900">{yearlyTotals.transactionCount}</div>
              <div className="text-xs text-yellow-600 mt-1">Completed sales</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-champagne-600" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 border-2 border-champagne-200 rounded-lg focus:border-purple-400 focus:outline-none"
              >
                <option value={2025}>2025</option>
                <option value={2024}>2024</option>
                <option value={2023}>2023</option>
              </select>
            </div>

            <select
              value={selectedQuarter}
              onChange={(e) => {
                setSelectedQuarter(e.target.value);
                setSelectedMonth('all');
              }}
              className="px-4 py-2 border-2 border-champagne-200 rounded-lg focus:border-purple-400 focus:outline-none"
            >
              <option value="all">All Quarters</option>
              <option value="1">Q1 (Jan-Mar)</option>
              <option value="2">Q2 (Apr-Jun)</option>
              <option value="3">Q3 (Jul-Sep)</option>
              <option value="4">Q4 (Oct-Dec)</option>
            </select>

            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setSelectedQuarter('all');
              }}
              className="px-4 py-2 border-2 border-champagne-200 rounded-lg focus:border-purple-400 focus:outline-none"
            >
              <option value="all">All Months</option>
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border-2 border-champagne-200 rounded-lg focus:border-purple-400 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="subscription">Subscriptions</option>
              <option value="commission">Commissions</option>
            </select>

            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-champagne-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search customer, email, invoice..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-champagne-200 rounded-lg focus:border-purple-400 focus:outline-none"
              />
            </div>

            <div className="text-sm text-champagne-600">
              {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Monthly Breakdown */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-champagne-900 mb-6">Monthly Breakdown - {selectedYear}</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-champagne-200">
                  <th className="text-left py-3 px-4 text-champagne-700 font-medium">Month</th>
                  <th className="text-right py-3 px-4 text-champagne-700 font-medium">Subscriptions</th>
                  <th className="text-right py-3 px-4 text-champagne-700 font-medium">Commissions</th>
                  <th className="text-right py-3 px-4 text-champagne-700 font-medium">Refunds</th>
                  <th className="text-right py-3 px-4 text-champagne-700 font-medium">Tax Collected</th>
                  <th className="text-right py-3 px-4 text-champagne-700 font-medium">Net Revenue</th>
                  <th className="text-right py-3 px-4 text-champagne-700 font-medium">Transactions</th>
                </tr>
              </thead>
              <tbody>
                {monthlySummaries.map((summary, index) => (
                  <tr key={index} className="border-b border-champagne-100 hover:bg-champagne-50">
                    <td className="py-3 px-4 font-medium text-champagne-900">{summary.month}</td>
                    <td className="py-3 px-4 text-right text-green-600">${summary.subscriptionRevenue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-blue-600">${summary.commissionRevenue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-red-600">-${summary.refunds.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-purple-600">${summary.taxCollected.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-bold text-champagne-900">${summary.netRevenue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-champagne-600">{summary.transactions}</td>
                  </tr>
                ))}
                <tr className="bg-champagne-100 font-bold">
                  <td className="py-3 px-4">Total</td>
                  <td className="py-3 px-4 text-right text-green-700">${yearlyTotals.totalSubscriptions.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-blue-700">${yearlyTotals.totalCommissions.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-red-700">-${yearlyTotals.totalRefunds.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-purple-700">${yearlyTotals.totalTax.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-champagne-900">${yearlyTotals.totalNet.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-champagne-700">{yearlyTotals.transactionCount}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-champagne-900 mb-6">Transaction Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-champagne-200">
                  <th className="text-left py-3 px-4 text-champagne-700 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-champagne-700 font-medium">Invoice #</th>
                  <th className="text-left py-3 px-4 text-champagne-700 font-medium">Customer</th>
                  <th className="text-left py-3 px-4 text-champagne-700 font-medium">Type</th>
                  <th className="text-right py-3 px-4 text-champagne-700 font-medium">Gross</th>
                  <th className="text-right py-3 px-4 text-champagne-700 font-medium">Tax</th>
                  <th className="text-right py-3 px-4 text-champagne-700 font-medium">Net</th>
                  <th className="text-center py-3 px-4 text-champagne-700 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.slice(0, 50).map((record) => (
                  <tr key={record.id} className="border-b border-champagne-100 hover:bg-champagne-50">
                    <td className="py-3 px-4 text-sm text-champagne-600">
                      {record.date.toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm font-mono text-champagne-700">{record.invoiceNumber}</td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-champagne-900">{record.customerName}</div>
                      <div className="text-xs text-champagne-500">{record.customerEmail}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-champagne-900 capitalize">{record.transactionType}</div>
                      {record.subscriptionTier && (
                        <div className="text-xs text-champagne-500 capitalize">{record.subscriptionTier}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-champagne-900">
                      ${record.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-purple-600">
                      ${record.taxAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-green-600">
                      ${record.netAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <div className={`flex items-center justify-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(record.status)}`}>
                        {getStatusIcon(record.status)}
                        {record.status.toUpperCase()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredRecords.length > 50 && (
            <div className="mt-4 text-center text-sm text-champagne-600">
              Showing 50 of {filteredRecords.length} records. Export to CSV to see all.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
