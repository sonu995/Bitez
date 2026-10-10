import React, { useState } from 'react';
import { Gift, Star, Users, Trophy, Zap, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  type: 'discount' | 'freebie' | 'upgrade';
  icon: React.ReactNode;
  claimed: boolean;
}

const LoyaltyProgram: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('rewards');

  // Mock loyalty data
  const loyaltyData = {
    currentPoints: 1250,
    tier: 'Gold',
    nextTier: 'Platinum',
    pointsToNextTier: 250,
    totalOrders: 24,
    totalSpent: 5680
  };

  const availableRewards: Reward[] = [
    {
      id: '1',
      title: '10% Off Next Order',
      description: 'Get 10% discount on your next order above ₹200',
      points: 500,
      type: 'discount',
      icon: <Star className="w-6 h-6 text-amber-500" />,
      claimed: false
    },
    {
      id: '2',
      title: 'Free Dessert',
      description: 'Get a complimentary dessert with your meal',
      points: 300,
      type: 'freebie',
      icon: <Gift className="w-6 h-6 text-rose-500" />,
      claimed: false
    },
    {
      id: '3',
      title: 'Priority Delivery',
      description: 'Get your orders delivered with priority for a week',
      points: 800,
      type: 'upgrade',
      icon: <Zap className="w-6 h-6 text-orange-500" />,
      claimed: false
    },
    {
      id: '4',
      title: 'Free Meal',
      description: 'Get one meal completely free (up to ₹150)',
      points: 1000,
      type: 'freebie',
      icon: <Crown className="w-6 h-6 text-emerald-500" />,
      claimed: false
    }
  ];

  const recentActivity = [
    { action: 'Order completed', points: 50, date: '2024-01-15' },
    { action: 'Daily check-in', points: 10, date: '2024-01-15' },
    { action: 'Review submitted', points: 25, date: '2024-01-14' },
    { action: 'Order completed', points: 45, date: '2024-01-14' },
    { action: 'Friend referral', points: 100, date: '2024-01-13' }
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze': return 'text-amber-800 bg-amber-100 border border-amber-300';
      case 'Silver': return 'text-slate-700 bg-slate-100 border border-slate-300';
      case 'Gold': return 'text-amber-800 bg-amber-100 border border-amber-300';
      case 'Platinum': return 'text-purple-800 bg-purple-100 border border-purple-300';
      default: return 'text-slate-700 bg-slate-100 border border-slate-200';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Bronze': return <Trophy className="w-4 h-4" />;
      case 'Silver': return <Trophy className="w-4 h-4" />;
      case 'Gold': return <Crown className="w-4 h-4" />;
      case 'Platinum': return <Crown className="w-4 h-4" />;
      default: return <Trophy className="w-4 h-4" />;
    }
  };

  const handleClaimReward = (rewardId: string, points: number) => {
    if (loyaltyData.currentPoints >= points) {
      alert(`Reward claimed successfully! ${points} points deducted.`);
    } else {
      alert(`Insufficient points. You need ${points - loyaltyData.currentPoints} more points.`);
    }
  };

  if (!user) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <Gift className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Join Our Loyalty Program</h2>
        <p className="text-slate-600 mb-6">Login to start earning points and unlock amazing rewards!</p>
        <button className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-sm">
          Login to Join
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Loyalty Status Card - Warm Sunset Orange Brand Theme */}
      <div className="bg-gradient-to-br from-[#FF5200] via-[#EA4E00] to-[#C2410C] text-white rounded-2xl p-8 border border-orange-400/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${getTierColor(loyaltyData.tier)}`}>
                  {getTierIcon(loyaltyData.tier)}
                  <span>{loyaltyData.tier} Member</span>
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Welcome, {user.name}!</h2>
              <p className="text-slate-400 text-sm">Keep ordering from Bitez to earn points and unlock perks.</p>
            </div>
            <div className="sm:text-right">
              <p className="text-3xl font-extrabold text-orange-500">{loyaltyData.currentPoints}</p>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Loyalty Points</p>
            </div>
          </div>

          {/* Progress to Next Tier */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-slate-300 font-medium">Progress to {loyaltyData.nextTier}</span>
              <span className="text-orange-400 font-bold">{loyaltyData.pointsToNextTier} points to go</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((loyaltyData.currentPoints % 1500) / 1500) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm">
          <Trophy className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-slate-900">{loyaltyData.totalOrders}</p>
          <p className="text-slate-500 text-sm font-medium mt-1">Total Orders</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm">
          <Star className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-slate-900">₹{loyaltyData.totalSpent}</p>
          <p className="text-slate-500 text-sm font-medium mt-1">Total Spent</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm">
          <Users className="w-10 h-10 text-blue-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-slate-900">5</p>
          <p className="text-slate-500 text-sm font-medium mt-1">Friends Referred</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'rewards', label: 'Available Rewards' },
              { key: 'activity', label: 'Recent Activity' },
              { key: 'referral', label: 'Refer Friends' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-bold text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'rewards' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900">Claim Your Rewards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableRewards.map((reward) => (
                  <div key={reward.id} className="border border-slate-200 rounded-xl p-5 hover:border-orange-400 transition-colors">
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="p-2.5 bg-orange-50 rounded-xl shrink-0">
                        {reward.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{reward.title}</h4>
                        <p className="text-sm text-slate-500 mt-0.5">{reward.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                      <span className="text-lg font-bold text-orange-600">{reward.points} pts</span>
                      <button
                        onClick={() => handleClaimReward(reward.id, reward.points)}
                        disabled={loyaltyData.currentPoints < reward.points}
                        className="px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-lg hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {loyaltyData.currentPoints >= reward.points ? 'Claim Reward' : 'Need More Points'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900">Points History</h3>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-slate-100 last:border-b-0">
                    <div>
                      <p className="font-semibold text-slate-900">{activity.action}</p>
                      <p className="text-xs text-slate-500">{activity.date}</p>
                    </div>
                    <span className="text-orange-600 font-bold">+{activity.points} points</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'referral' && (
            <div className="space-y-6">
              <div className="text-center max-w-md mx-auto">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Refer Friends & Earn</h3>
                <p className="text-slate-600 text-sm mb-6">Invite your campus friends and earn 100 points for each successful referral!</p>
                
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Your referral code:</p>
                  <div className="flex items-center justify-center space-x-2">
                    <code className="bg-white px-4 py-2 rounded-lg border border-slate-200 font-mono font-bold text-slate-900">
                      BITEZ{user.id?.slice(-4).toUpperCase()}
                    </code>
                    <button className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-600 transition-colors text-sm">
                      Copy
                    </button>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-orange-500/25 active:scale-98 cursor-pointer">
                  Share with Friends
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoyaltyProgram;