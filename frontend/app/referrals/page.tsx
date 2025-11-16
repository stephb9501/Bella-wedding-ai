'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import AuthWall from '@/components/AuthWall';
import {
  Gift,
  Users,
  DollarSign,
  Copy,
  Check,
  Share2,
  Mail,
  MessageCircle,
  Facebook,
  Twitter,
  Sparkles,
  TrendingUp,
  Award,
  Calendar,
  ExternalLink,
} from 'lucide-react';

interface Referral {
  id: string;
  referredUser: string;
  referredUserEmail: string;
  userType: 'bride' | 'vendor';
  signupDate: Date;
  status: 'pending' | 'credited' | 'cancelled';
  creditAmount: number;
  creditedDate?: Date;
}

interface CreditTransaction {
  id: string;
  date: Date;
  amount: number;
  type: 'referral_earned' | 'credit_applied' | 'credit_expired';
  description: string;
  referralId?: string;
}

export default function ReferralsPage() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();
  const [userType, setUserType] = useState<'bride' | 'vendor'>('bride');
  const [referralCode, setReferralCode] = useState('');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [creditBalance, setCreditBalance] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Credit amounts per user type
  const VENDOR_CREDIT = 10; // $10 per referred customer
  const BRIDE_CREDIT = 5;   // $5 per referred bride

  const myCreditAmount = userType === 'vendor' ? VENDOR_CREDIT : BRIDE_CREDIT;

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadReferralData();
    }
  }, [isAuthenticated, user]);

  const loadReferralData = () => {
    // In production, fetch from Supabase
    // For demo, use localStorage

    // Generate or load referral code
    const storedCode = localStorage.getItem(`bella_referral_code_${user?.id}`);
    if (storedCode) {
      setReferralCode(storedCode);
    } else {
      const newCode = generateReferralCode();
      localStorage.setItem(`bella_referral_code_${user?.id}`, newCode);
      setReferralCode(newCode);
    }

    // Load user type
    const storedUserType = localStorage.getItem(`bella_user_type_${user?.id}`) as 'bride' | 'vendor';
    if (storedUserType) {
      setUserType(storedUserType);
    }

    // Load referrals
    const storedReferrals = localStorage.getItem(`bella_referrals_${user?.id}`);
    if (storedReferrals) {
      const parsed = JSON.parse(storedReferrals);
      setReferrals(parsed.map((ref: any) => ({
        ...ref,
        signupDate: new Date(ref.signupDate),
        creditedDate: ref.creditedDate ? new Date(ref.creditedDate) : undefined,
      })));
    } else {
      // Sample data for demo
      const sampleReferrals: Referral[] = [
        {
          id: '1',
          referredUser: 'Sarah Johnson',
          referredUserEmail: 'sarah.j@email.com',
          userType: 'bride',
          signupDate: new Date('2025-01-10'),
          status: 'credited',
          creditAmount: myCreditAmount,
          creditedDate: new Date('2025-01-11'),
        },
        {
          id: '2',
          referredUser: 'Mike Chen',
          referredUserEmail: 'mike.chen@email.com',
          userType: 'vendor',
          signupDate: new Date('2025-01-15'),
          status: 'credited',
          creditAmount: myCreditAmount,
          creditedDate: new Date('2025-01-16'),
        },
        {
          id: '3',
          referredUser: 'Emily Davis',
          referredUserEmail: 'emily.d@email.com',
          userType: 'bride',
          signupDate: new Date('2025-01-20'),
          status: 'pending',
          creditAmount: myCreditAmount,
        },
      ];
      setReferrals(sampleReferrals);
    }

    // Load transactions
    const storedTransactions = localStorage.getItem(`bella_credit_transactions_${user?.id}`);
    if (storedTransactions) {
      const parsed = JSON.parse(storedTransactions);
      setTransactions(parsed.map((txn: any) => ({
        ...txn,
        date: new Date(txn.date),
      })));
    } else {
      // Sample transactions
      const sampleTransactions: CreditTransaction[] = [
        {
          id: '1',
          date: new Date('2025-01-11'),
          amount: myCreditAmount,
          type: 'referral_earned',
          description: 'Referral credit for Sarah Johnson',
          referralId: '1',
        },
        {
          id: '2',
          date: new Date('2025-01-16'),
          amount: myCreditAmount,
          type: 'referral_earned',
          description: 'Referral credit for Mike Chen',
          referralId: '2',
        },
        {
          id: '3',
          date: new Date('2025-02-01'),
          amount: -myCreditAmount,
          type: 'credit_applied',
          description: 'Credit applied to February subscription',
        },
      ];
      setTransactions(sampleTransactions);
    }

    // Calculate credit balance
    const balance = calculateCreditBalance();
    setCreditBalance(balance);
  };

  const calculateCreditBalance = () => {
    // In production, fetch from database
    // For demo, calculate from transactions
    const storedTransactions = localStorage.getItem(`bella_credit_transactions_${user?.id}`);
    if (storedTransactions) {
      const parsed = JSON.parse(storedTransactions);
      return parsed.reduce((sum: number, txn: any) => sum + txn.amount, 0);
    }
    // Sample balance for demo
    return myCreditAmount; // $10 or $5 depending on user type
  };

  const generateReferralCode = () => {
    // Generate unique code based on user ID and name
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BELLA${randomPart}`;
  };

  const getReferralLink = () => {
    return `https://bellaweddingai.com/signup?ref=${referralCode}`;
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(getReferralLink());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Check out Bella Wedding AI!');
    const body = encodeURIComponent(
      `Hi! I've been using Bella Wedding AI for my wedding planning and thought you might find it helpful too.\n\nUse my referral code ${referralCode} when you sign up:\n${getReferralLink()}\n\nIt's an amazing platform for planning your perfect wedding!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaSocial = (platform: 'facebook' | 'twitter') => {
    const text = encodeURIComponent(`Plan your perfect wedding with Bella Wedding AI! Use code ${referralCode}`);
    const url = encodeURIComponent(getReferralLink());

    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'credited') return 'bg-green-100 text-green-700';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-700';
    if (status === 'cancelled') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getTransactionIcon = (type: string) => {
    if (type === 'referral_earned') return <Gift className="w-5 h-5 text-green-600" />;
    if (type === 'credit_applied') return <DollarSign className="w-5 h-5 text-blue-600" />;
    return <Calendar className="w-5 h-5 text-gray-600" />;
  };

  const stats = {
    totalReferrals: referrals.length,
    creditedReferrals: referrals.filter((r) => r.status === 'credited').length,
    pendingReferrals: referrals.filter((r) => r.status === 'pending').length,
    totalEarned: referrals
      .filter((r) => r.status === 'credited')
      .reduce((sum, r) => sum + r.creditAmount, 0),
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-champagne-50 to-purple-50 flex items-center justify-center">
        <Gift className="w-12 h-12 text-champagne-600 animate-pulse" />
      </div>
    );
  }

  // Show AuthWall if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthWall
        featureName="Referral Program"
        previewContent={
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
              <Gift className="w-16 h-16 text-champagne-600 mx-auto mb-4" />
              <h2 className="text-3xl font-serif text-champagne-900 mb-4">Earn Rewards by Sharing</h2>
              <p className="text-champagne-700 max-w-2xl mx-auto">
                Refer friends and earn monthly subscription credits that roll over!
              </p>
            </div>
          </div>
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b-4 border-purple-600">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Gift className="w-10 h-10 text-purple-600" />
            </div>
            <div>
              <h1 className="text-4xl font-serif text-champagne-900 font-bold">Referral Program</h1>
              <p className="text-champagne-600 mt-1">Share Bella Wedding AI and earn subscription credits!</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-green-700 font-medium">Credit Balance</div>
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-900">${creditBalance.toFixed(2)}</div>
              <div className="text-xs text-green-600 mt-1">Rolls over monthly</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-purple-700 font-medium">Total Referrals</div>
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-900">{stats.totalReferrals}</div>
              <div className="text-xs text-purple-600 mt-1">All time</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-blue-700 font-medium">Pending</div>
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-900">{stats.pendingReferrals}</div>
              <div className="text-xs text-blue-600 mt-1">Awaiting payment</div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border-2 border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-yellow-700 font-medium">Total Earned</div>
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-yellow-900">${stats.totalEarned.toFixed(2)}</div>
              <div className="text-xs text-yellow-600 mt-1">Lifetime earnings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Referral Code & Sharing */}
          <div className="lg:col-span-1 space-y-6">
            {/* How It Works */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-8 h-8" />
                <h2 className="text-2xl font-bold">How It Works</h2>
              </div>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-bold mb-1">Share Your Code</p>
                    <p className="text-purple-100">Send your unique referral code to friends planning their wedding</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-bold mb-1">They Sign Up & Pay</p>
                    <p className="text-purple-100">When they subscribe to any paid plan, you both win!</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-bold mb-1">Earn Credits</p>
                    <p className="text-purple-100">
                      Get ${myCreditAmount}/month credit that rolls over! {userType === 'vendor' ? 'Vendors earn $10' : 'Brides earn $5'} per referral.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <p className="font-bold mb-1">Credits Apply Automatically</p>
                    <p className="text-purple-100">Your credits reduce your monthly subscription cost automatically</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Your Referral Code */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-champagne-900 mb-4">Your Referral Code</h2>
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-4 mb-4 border-2 border-purple-300">
                <div className="text-sm text-champagne-600 mb-2">Share this code:</div>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-purple-900 tracking-wider">{referralCode}</div>
                  <button
                    onClick={copyReferralCode}
                    className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    {copiedCode ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="bg-champagne-50 rounded-xl p-4 mb-4">
                <div className="text-sm text-champagne-600 mb-2">Or share this link:</div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={getReferralLink()}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-champagne-200 rounded-lg text-sm"
                  />
                  <button
                    onClick={copyReferralLink}
                    className="p-2 bg-champagne-600 text-white rounded-lg hover:bg-champagne-700 transition"
                  >
                    {copiedLink ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-bold text-champagne-900">Quick Share:</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={shareViaEmail}
                    className="px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition flex flex-col items-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    <span className="text-xs font-medium">Email</span>
                  </button>
                  <button
                    onClick={() => shareViaSocial('facebook')}
                    className="px-4 py-3 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition flex flex-col items-center gap-2"
                  >
                    <Facebook className="w-5 h-5" />
                    <span className="text-xs font-medium">Facebook</span>
                  </button>
                  <button
                    onClick={() => shareViaSocial('twitter')}
                    className="px-4 py-3 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition flex flex-col items-center gap-2"
                  >
                    <Twitter className="w-5 h-5" />
                    <span className="text-xs font-medium">Twitter</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Referrals & Transactions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Your Referrals */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-champagne-900 mb-6">Your Referrals</h2>
              {referrals.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-champagne-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-champagne-900 mb-2">No referrals yet</h3>
                  <p className="text-champagne-600 mb-6">Start sharing your code to earn credits!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {referrals.map((referral) => (
                    <div
                      key={referral.id}
                      className="flex items-center justify-between p-4 bg-champagne-50 rounded-xl border border-champagne-200 hover:border-purple-300 transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-bold text-champagne-900">{referral.referredUser}</div>
                          <div className="text-sm text-champagne-600">{referral.referredUserEmail}</div>
                          <div className="text-xs text-champagne-500 mt-1">
                            Signed up {referral.signupDate.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold mb-2 ${getStatusBadge(referral.status)}`}>
                          {referral.status.toUpperCase()}
                        </div>
                        <div className="font-bold text-green-600">${referral.creditAmount.toFixed(2)}</div>
                        {referral.creditedDate && (
                          <div className="text-xs text-champagne-500">
                            Credited {referral.creditedDate.toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Credit History */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-champagne-900 mb-6">Credit History</h2>
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 text-champagne-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-champagne-900 mb-2">No transactions yet</h3>
                  <p className="text-champagne-600">Your credit activity will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-champagne-50 rounded-xl border border-champagne-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <div className="font-medium text-champagne-900">{transaction.description}</div>
                          <div className="text-sm text-champagne-600">
                            {transaction.date.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`text-xl font-bold ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
