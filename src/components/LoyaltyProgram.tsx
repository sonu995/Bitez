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
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      claimed: false
    },
    {
      id: '2',
      title: 'Free Dessert',
      description: 'Get a complimentary dessert with your meal',
      points: 300,
      type: 'freebie',
      icon: <Gift className="w-6 h-6 text-pink-500" />,
      claimed: false
    },
    {
      id: '3',
      title: 'Priority Delivery',
      description: 'Get your orders delivered with priority for a week',
      points: 800,
      type: 'upgrade',
      icon: <Zap className="w-6 h-6 text-blue-500" />,
      claimed: false
    },
    {
      id: '4',
      title: 'Free Meal',
      description: 'Get one meal completely free (up to ₹150)',
      points: 1000,
      type: 'freebie',
      icon: <Crown className="w-6 h-6 text-purple-500" />,
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
      case 'Bronze': return 'text-orange-600 bg-orange-100';
      case 'Silver': return 'text-gray-600 bg-gray-100';
      case 'Gold': return 'text-yellow-600 bg-yellow-100';
      case 'Platinum': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Bronze': return <Trophy className="w-5 h-5" />;
      case 'Silver': return <Trophy className="w-5 h-5" />;
      case 'Gold': return <Crown className="w-5 h-5" />;
      case 'Platinum': return <Crown className="w-5 h-5" />;
      default: return <Trophy className="w-5 h-5" />;
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
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Our Loyalty Program</h2>
        <p className="text-gray-600 mb-6">Login to start earning points and unlock amazing rewards!</p>
        <button className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600">
          Login to Join
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Loyalty Status Card */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1 ${getTierColor(loyaltyData.tier)}`}>
                {getTierIcon(loyaltyData.tier)}
                <span>{loyaltyData.tier} Member</span>
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome, {user.name}!</h2>
            <p className="opacity-90">You're doing great! Keep ordering to unlock more rewards.</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{loyaltyData.currentPoints}</p>
            <p className="text-sm opacity-90">loyalty points</p>
          </div>
        </div>

        {/* Progress to Next Tier */}
        <div className="bg-white bg-opacity-20 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">Progress to {loyaltyData.nextTier}</span>
            <span className="text-sm">{loyaltyData.pointsToNextTier} points to go</span>
          </div>
          <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${((loyaltyData.currentPoints % 1500) / 1500) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <Trophy className="w-12 h-12 text-orange-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-gray-900">{loyaltyData.totalOrders}</p>
          <p className="text-gray-600">Total Orders</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <Star className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-gray-900">₹{loyaltyData.totalSpent}</p>
          <p className="text-gray-600">Total Spent</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <Users className="w-12 h-12 text-blue-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-gray-900">5</p>
          <p className="text-gray-600">Friends Referred</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'rewards', label: 'Available Rewards' },
              { key: 'activity', label: 'Recent Activity' },
              { key: 'referral', label: 'Refer Friends' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
              <h3 className="text-lg font-semibold">Claim Your Rewards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableRewards.map((reward) => (
                  <div key={reward.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {reward.icon}
                        <div>
                          <h4 className="font-semibold">{reward.title}</h4>
                          <p className="text-sm text-gray-600">{reward.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-orange-500">{reward.points} points</span>
                      <button
                        onClick={() => handleClaimReward(reward.id, reward.points)}
                        disabled={loyaltyData.currentPoints < reward.points}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loyaltyData.currentPoints >= reward.points ? 'Claim' : 'Need More Points'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Points History</h3>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.date}</p>
                    </div>
                    <span className="text-green-600 font-semibold">+{activity.points} points</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'referral' && (
            <div className="space-y-6">
              <div className="text-center">
                <Users className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Refer Friends & Earn</h3>
                <p className="text-gray-600 mb-6">Invite your friends and earn 100 points for each successful referral!</p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-2">Your referral code:</p>
                  <div className="flex items-center justify-center space-x-2">
                    <code className="bg-white px-4 py-2 rounded border font-mono">FOODIE{user.id?.slice(-4).toUpperCase()}</code>
                    <button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
                      Copy
                    </button>
                  </div>
                </div>

                <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600">
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