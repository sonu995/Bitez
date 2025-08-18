import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Package, Wallet, Star, Clock, MapPin, Plus, Pause, Play, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, updateWallet } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const recentOrders = [
    {
      id: 'ORD001',
      restaurant: 'Healthy Mess Co.',
      items: ['Dal Rice', 'Paneer Curry', 'Roti'],
      amount: 150,
      status: 'delivered',
      date: '2024-01-15',
      rating: 4.5
    },
    {
      id: 'ORD002',
      restaurant: 'Student Tiffin Service',
      items: ['Rajma Chawal', 'Mixed Vegetables'],
      amount: 120,
      status: 'delivered',
      date: '2024-01-14',
      rating: 4.2
    }
  ];

  const upcomingMeals = [
    { date: '2024-01-16', meal: 'Lunch', menu: 'Chole Bhature, Lassi' },
    { date: '2024-01-16', meal: 'Dinner', menu: 'Aloo Gobi, Dal, Roti' },
    { date: '2024-01-17', meal: 'Lunch', menu: 'Biryani, Raita, Pickle' }
  ];

  const handleAddMoney = () => {
    updateWallet(500);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please login to continue</h2>
          <Link to="/login" className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
          <p className="text-gray-600 mt-2">Manage your orders, subscriptions, and account settings</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Wallet Balance</p>
                <p className="text-2xl font-bold text-gray-900">₹{user.walletBalance.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {user.subscription && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Remaining Meals</p>
                  <p className="text-2xl font-bold text-gray-900">{user.subscription.remainingMeals}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Loyalty Points</p>
                <p className="text-2xl font-bold text-gray-900">1,250</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'orders', label: 'Orders' },
                { key: 'subscription', label: 'Subscription' },
                { key: 'wallet', label: 'Wallet' }
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
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Current Subscription */}
                {user.subscription && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Current Subscription</h3>
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-bold">{user.subscription.plan}</h4>
                          <p className="opacity-90">Active until {user.subscription.expiryDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{user.subscription.remainingMeals}</p>
                          <p className="text-sm opacity-90">meals left</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-30">
                          <Pause className="w-4 h-4 inline mr-2" />
                          Pause Plan
                        </button>
                        <button className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-30">
                          <Settings className="w-4 h-4 inline mr-2" />
                          Manage
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upcoming Meals */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Upcoming Meals</h3>
                    <Link to="/menu" className="text-orange-500 text-sm font-medium hover:text-orange-600">
                      View Full Menu
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {upcomingMeals.map((meal, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{meal.meal} - {meal.date}</p>
                          <p className="text-gray-600 text-sm">{meal.menu}</p>
                        </div>
                        <button className="text-orange-500 text-sm font-medium hover:text-orange-600">
                          Skip
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Recent Orders</h3>
                  <Link to="/menu" className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600">
                    Order Now
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold">{order.restaurant}</h4>
                          <p className="text-gray-600 text-sm">{order.items.join(', ')}</p>
                          <p className="text-sm text-gray-500 mt-1">{order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{order.amount}</p>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm">{order.rating}</span>
                        </div>
                        <div className="space-x-2">
                          <button className="text-orange-500 text-sm hover:text-orange-600">
                            Rate Order
                          </button>
                          <button className="text-orange-500 text-sm hover:text-orange-600">
                            Reorder
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'subscription' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Subscription Management</h3>
                  <Link to="/plans" className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600">
                    Browse Plans
                  </Link>
                </div>
                
                {user.subscription ? (
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold mb-4">{user.subscription.plan}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Remaining Meals</p>
                        <p className="text-2xl font-bold">{user.subscription.remainingMeals}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Expiry Date</p>
                        <p className="font-semibold">{user.subscription.expiryDate}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Status</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
                        <Pause className="w-4 h-4 inline mr-2" />
                        Pause Subscription
                      </button>
                      <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
                        Upgrade Plan
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold mb-2">No Active Subscription</h4>
                    <p className="text-gray-600 mb-6">Subscribe to a meal plan and save money on your daily meals</p>
                    <Link to="/plans" className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600">
                      Choose a Plan
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wallet' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Wallet & Payments</h3>
                  <button 
                    onClick={handleAddMoney}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Add Money
                  </button>
                </div>
                
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6">
                  <h4 className="text-lg font-semibold mb-2">Current Balance</h4>
                  <p className="text-3xl font-bold">₹{user.walletBalance.toFixed(2)}</p>
                  <p className="text-sm opacity-90 mt-2">Available for orders and subscriptions</p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Recent Transactions</h4>
                  <div className="space-y-3">
                    {[
                      { type: 'debit', description: 'Order payment - Healthy Mess Co.', amount: 150, date: '2024-01-15' },
                      { type: 'credit', description: 'Wallet top-up', amount: 500, date: '2024-01-14' },
                      { type: 'debit', description: 'Order payment - Student Tiffin Service', amount: 120, date: '2024-01-14' }
                    ].map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-600">{transaction.date}</p>
                        </div>
                        <p className={`font-semibold ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;