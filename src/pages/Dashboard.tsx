import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Edit, Wallet, Utensils, Package, TrendingUp, Crown, Plus, Truck, Users, Settings, Star, Clock } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = ['Overview', 'Subscription', 'Orders', 'Wallet', 'Profile'];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wallet */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-5 text-white flex justify-between items-center shadow-md shadow-orange-500/20">
          <div>
            <p className="text-orange-100 text-sm font-medium mb-1">Wallet Balance</p>
            <h3 className="text-3xl font-bold">₹1250</h3>
          </div>
          <Wallet size={36} strokeWidth={1.5} className="opacity-90" />
        </div>
        {/* Meals Remaining */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">Meals Remaining</p>
            <h3 className="text-3xl font-bold text-slate-900">45</h3>
          </div>
          <Utensils size={36} strokeWidth={1.5} className="text-orange-500" />
        </div>
        {/* Orders This Month */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">Orders This Month</p>
            <h3 className="text-3xl font-bold text-slate-900">24</h3>
          </div>
          <Package size={36} strokeWidth={1.5} className="text-slate-700" />
        </div>
        {/* Money Saved */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">Money Saved</p>
            <h3 className="text-3xl font-bold text-orange-600">₹480</h3>
          </div>
          <TrendingUp size={36} strokeWidth={1.5} className="text-orange-500" />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Meal & Extras */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="text-2xl">🍲</span> Upcoming Lunch
              </h3>
              <span className="bg-orange-50 text-orange-600 border border-orange-100 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Clock size={12} /> Today, 1:00 PM
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-orange-50/40 p-4 rounded-xl mb-6 border border-orange-100">
              <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm shrink-0 hidden sm:block bg-slate-100">
                <img src="https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=200" alt="Lunch" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 text-base mb-1">Paneer Butter Masala + Dal + 3 Roti</h4>
                <p className="text-slate-500 text-sm">Included in your Premium Plan</p>
              </div>
              <button className="w-full sm:w-auto px-4 py-2 bg-white text-slate-700 text-sm font-bold border border-slate-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 rounded-lg transition-all shadow-sm cursor-pointer">
                Skip Meal
              </button>
            </div>

            {/* Add Extra Dish Section */}
            <div className="border-t border-slate-100 pt-5">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-800 flex items-center gap-2"><Plus className="w-4 h-4 text-orange-600" /> Add Extra Dish</h4>
                <p className="text-xs text-slate-400 hidden sm:block">Auto-deducted from wallet</p>
              </div>
              
              <div className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
                {[
                  { name: "Extra Roti (2)", price: 15, img: "https://images.pexels.com/photos/10860591/pexels-photo-10860591.jpeg?auto=compress&cs=tinysrgb&w=150" },
                  { name: "Gulab Jamun", price: 30, img: "https://images.pexels.com/photos/13435133/pexels-photo-13435133.jpeg?auto=compress&cs=tinysrgb&w=150" },
                  { name: "Lassi", price: 25, img: "https://images.pexels.com/photos/10153303/pexels-photo-10153303.jpeg?auto=compress&cs=tinysrgb&w=150" },
                  { name: "Extra Paneer", price: 50, img: "https://images.pexels.com/photos/9738981/pexels-photo-9738981.jpeg?auto=compress&cs=tinysrgb&w=150" },
                  { name: "Boiled Eggs", price: 25, img: "https://images.pexels.com/photos/824635/pexels-photo-824635.jpeg?auto=compress&cs=tinysrgb&w=150" },
                ].map((item, i) => (
                  <div key={i} className="min-w-[120px] snap-center bg-white border border-slate-200 rounded-xl p-3 text-center shadow-sm hover:shadow-md transition-all group flex-shrink-0">
                    <img src={item.img} alt={item.name} className="w-12 h-12 mx-auto rounded-full object-cover mb-2 border border-slate-100 group-hover:scale-105 transition-transform" />
                    <h5 className="text-xs font-bold text-slate-900 mb-1 truncate">{item.name}</h5>
                    <p className="text-orange-600 font-extrabold text-sm mb-2">₹{item.price}</p>
                    <button className="w-full bg-orange-50 hover:bg-orange-500 text-orange-600 hover:text-white text-xs font-bold py-1.5 rounded-lg transition-colors cursor-pointer">
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Current Subscription */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Crown className="text-orange-500" size={20} /> Current Subscription
            </h3>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-xl font-bold text-slate-900 mb-1">Premium Thali Mess</h4>
                <p className="text-slate-500 text-sm">₹2299/month</p>
              </div>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                active
              </span>
            </div>
            
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-slate-600">Meals Used</span>
              <span className="font-bold text-slate-900">45/90</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mb-6">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: '50%' }}></div>
            </div>

            <div className="flex justify-between text-sm">
              <div>
                <p className="text-slate-500 mb-1">Next Billing</p>
                <p className="font-bold text-slate-900">Feb 15, 2025</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500 mb-1">Days Left</p>
                <p className="font-bold text-slate-900">12 days</p>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm overflow-hidden">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Orders</h3>
            <div className="divide-y divide-slate-100">
              {[
                { id: '#ORD-8821', rest: 'Healthy Mess Co.', items: 'Paneer Butter Masala Combo', price: '₹140', time: 'Yesterday, 8:30 PM', status: 'Delivered', rating: 5 },
                { id: '#ORD-8819', rest: 'Quick Bites Express', items: 'Crispy Veg Burger + Coke', price: '₹110', time: 'Jan 12, 2:15 PM', status: 'Delivered', rating: 4 },
                { id: '#ORD-8810', rest: 'Student Tiffin Service', items: 'Dal Tadka + Jeera Rice Thali', price: '₹99', time: 'Jan 10, 1:00 PM', status: 'Delivered', rating: 5 },
              ].map((order, i) => (
                <div key={i} className="py-4 flex items-center justify-between hover:bg-orange-50/20 px-2 rounded-lg transition">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                      🍱
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm mb-1">{order.id}</p>
                      <p className="text-orange-600 text-xs font-semibold">{order.rest}</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-slate-700 text-sm mb-1">{order.items}</p>
                      <p className="text-slate-400 text-xs">{order.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-bold text-slate-900">{order.price}</span>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full">{order.status}</span>
                    <div className="flex items-center gap-1 text-orange-500 font-bold text-sm w-8">
                      <Star size={14} fill="currentColor" /> {order.rating}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <button onClick={() => navigate('/orders')} className="px-5 py-2 bg-white border border-slate-200 text-slate-800 text-sm font-bold rounded-lg hover:bg-orange-50 hover:text-orange-600 transition shadow-xs cursor-pointer">
                View All Orders
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button onClick={() => navigate('/menu')} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-2.5 px-4 rounded-lg shadow-md shadow-orange-500/20 transition cursor-pointer">
                <Plus size={18} /> Instant Order
              </button>
              <button onClick={() => navigate('/orders')} className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-lg hover:bg-orange-50 transition shadow-2xs hover:text-orange-600 cursor-pointer">
                <Truck size={18} /> Track Order
              </button>
              <button className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-lg hover:bg-orange-50 transition shadow-2xs hover:text-orange-600">
                <Users size={18} /> Refer Friends
              </button>
              <button className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-lg hover:bg-orange-50 transition shadow-2xs hover:text-orange-600">
                <Settings size={18} /> Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1 flex items-center gap-2">
              Welcome back, Sonu! <span className="text-2xl">👋</span>
            </h1>
            <p className="text-slate-500 text-sm">Here is what is happening with your daily meals and orders today</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-orange-50 hover:text-orange-600 transition shadow-2xs cursor-pointer">
              <Bell size={16} /> Notifications
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg shadow-md shadow-orange-500/20 transition cursor-pointer">
              <Edit size={16} /> Edit Profile
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto bg-white p-1.5 rounded-xl mb-8 border border-orange-100 shadow-2xs">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`flex-1 min-w-[120px] py-2 px-4 text-sm font-bold rounded-lg transition-all text-center ${
                activeTab === tab.toLowerCase()
                  ? 'bg-orange-50 text-orange-700 shadow-xs border border-orange-200'
                  : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Main Content */}
        {activeTab === 'overview' ? (
          renderOverview()
        ) : (
          <div className="bg-white border border-orange-100 rounded-xl p-12 text-center text-slate-500 shadow-sm">
            <p className="text-lg font-medium">{tabs.find(t => t.toLowerCase() === activeTab)} content coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}