import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, Star, Check, Pause, Play, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Subscriptions: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('plans');

  const mealPlans = [
    {
      id: 'basic-weekly',
      name: 'Weekly Basic',
      duration: '7 days',
      meals: 14,
      price: 1200,
      originalPrice: 1400,
      savings: 200,
      features: [
        'Lunch & Dinner',
        '2 Free Meal Skips',
        'Basic Menu Options',
        'Standard Support'
      ],
      popular: false,
      type: 'weekly'
    },
    {
      id: 'premium-monthly',
      name: 'Monthly Premium',
      duration: '30 days',
      meals: 60,
      price: 4500,
      originalPrice: 5400,
      savings: 900,
      features: [
        'All Meals (Breakfast, Lunch, Dinner)',
        '5 Free Meal Skips',
        'Premium Menu Options',
        'Priority Support',
        'Free Delivery',
        'Nutritional Information'
      ],
      popular: true,
      type: 'monthly'
    },
    {
      id: 'student-special',
      name: 'Student Special',
      duration: '15 days',
      meals: 30,
      price: 2100,
      originalPrice: 2400,
      savings: 300,
      features: [
        'Lunch & Dinner',
        '3 Free Meal Skips',
        'Student-Friendly Menu',
        'Budget-Friendly Pricing',
        'Exam Period Flexibility'
      ],
      popular: false,
      type: 'student'
    },
    {
      id: 'custom-plan',
      name: 'Custom Plan',
      duration: 'Flexible',
      meals: 'Choose',
      price: 'Custom',
      originalPrice: null,
      savings: 'Up to 30%',
      features: [
        'Choose Your Duration',
        'Select Meal Times',
        'Unlimited Skips',
        'All Menu Options',
        'Dedicated Support',
        'Flexible Scheduling'
      ],
      popular: false,
      type: 'custom'
    }
  ];

  const currentSubscription = user?.subscription;

  const upcomingMeals = [
    { date: '2024-01-16', day: 'Today', meals: [
      { type: 'Lunch', menu: 'Dal Rice, Aloo Sabzi, Roti, Pickle', time: '12:00-2:00 PM' },
      { type: 'Dinner', menu: 'Rajma, Jeera Rice, Chapati, Salad', time: '7:00-9:00 PM' }
    ]},
    { date: '2024-01-17', day: 'Tomorrow', meals: [
      { type: 'Lunch', menu: 'Chole Bhature, Lassi, Pickle', time: '12:00-2:00 PM' },
      { type: 'Dinner', menu: 'Mixed Dal, Rice, Sabzi, Roti', time: '7:00-9:00 PM' }
    ]},
    { date: '2024-01-18', day: 'Thursday', meals: [
      { type: 'Lunch', menu: 'Biryani, Raita, Boiled Egg', time: '12:00-2:00 PM' },
      { type: 'Dinner', menu: 'Palak Paneer, Rice, Naan', time: '7:00-9:00 PM' }
    ]}
  ];

  const handleSkipMeal = (date: string, mealType: string) => {
    alert(`Meal skip request for ${mealType} on ${date} has been submitted. Cut-off time is 8:00 AM.`);
  };

  const handlePauseSubscription = () => {
    alert('Subscription pause request submitted. You can resume anytime.');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Meal Subscription Plans</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose from our carefully crafted meal plans designed for students and working professionals. 
            Save money, time, and enjoy delicious homestyle meals.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex justify-center">
            <div className="bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setActiveTab('plans')}
                className={`px-6 py-2 rounded-md font-medium transition duration-200 ${
                  activeTab === 'plans'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Available Plans
              </button>
              {user && (
                <button
                  onClick={() => setActiveTab('current')}
                  className={`px-6 py-2 rounded-md font-medium transition duration-200 ${
                    activeTab === 'current'
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  My Subscription
                </button>
              )}
            </div>
          </div>
        </div>

        {activeTab === 'plans' && (
          <>
            {/* Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {mealPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-white rounded-2xl shadow-lg p-8 relative transform hover:scale-105 transition duration-200 ${
                    plan.popular ? 'ring-2 ring-orange-500' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4">{plan.duration}</p>
                    
                    <div className="mb-6">
                      {typeof plan.price === 'number' ? (
                        <>
                          <div className="text-4xl font-bold text-orange-500 mb-2">₹{plan.price}</div>
                          {plan.originalPrice && (
                            <div className="text-lg text-gray-500 line-through">₹{plan.originalPrice}</div>
                          )}
                          <p className="text-green-600 font-medium">Save ₹{plan.savings}</p>
                        </>
                      ) : (
                        <>
                          <div className="text-4xl font-bold text-orange-500 mb-2">{plan.price}</div>
                          <p className="text-green-600 font-medium">{plan.savings}</p>
                        </>
                      )}
                    </div>

                    <div className="text-left mb-8">
                      <p className="text-sm text-gray-600 mb-3">
                        {typeof plan.meals === 'number' ? `${plan.meals} meals included` : `${plan.meals} meals`}
                      </p>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-700">
                            <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      className={`w-full py-3 rounded-lg font-semibold transition duration-200 ${
                        plan.popular
                          ? 'bg-orange-500 text-white hover:bg-orange-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {plan.type === 'custom' ? 'Customize Plan' : 'Subscribe Now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Features Section */}
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-12">
              <h2 className="text-2xl font-bold text-center mb-8">Why Choose Our Meal Plans?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Flexible Scheduling</h3>
                  <p className="text-gray-600">Skip meals, pause subscription, and customize your schedule as needed.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Quality Food</h3>
                  <p className="text-gray-600">Fresh, homestyle meals prepared with quality ingredients and love.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Community</h3>
                  <p className="text-gray-600">Join thousands of satisfied customers who trust us for their daily meals.</p>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'current' && user && (
          <div className="space-y-8">
            {currentSubscription ? (
              <>
                {/* Current Subscription Card */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{currentSubscription.plan}</h2>
                      <p className="opacity-90">Active until {currentSubscription.expiryDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">{currentSubscription.remainingMeals}</p>
                      <p className="text-sm opacity-90">meals remaining</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button 
                      onClick={handlePauseSubscription}
                      className="bg-white bg-opacity-20 text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-30 transition duration-200"
                    >
                      <Pause className="w-4 h-4 inline mr-2" />
                      Pause Plan
                    </button>
                    <Link 
                      to="/dashboard"
                      className="bg-white bg-opacity-20 text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-30 transition duration-200"
                    >
                      <Settings className="w-4 h-4 inline mr-2" />
                      Manage
                    </Link>
                  </div>
                </div>

                {/* Upcoming Meals */}
                <div className="bg-white rounded-2xl shadow-sm p-8">
                  <h2 className="text-2xl font-bold mb-6">Upcoming Meals</h2>
                  <div className="space-y-6">
                    {upcomingMeals.map((day, index) => (
                      <div key={index} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{day.day}</h3>
                            <p className="text-gray-600">{day.date}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {day.meals.map((meal, mealIndex) => (
                            <div key={mealIndex} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-orange-600">{meal.type}</h4>
                                <button
                                  onClick={() => handleSkipMeal(day.date, meal.type)}
                                  className="text-sm text-red-500 hover:text-red-700 font-medium"
                                >
                                  Skip
                                </button>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">{meal.menu}</p>
                              <p className="text-xs text-gray-500">{meal.time}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Meal skip requests must be made before 8:00 AM on the day of delivery.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">No Active Subscription</h2>
                <p className="text-gray-600 mb-8">Choose a meal plan to start enjoying delicious, homestyle meals.</p>
                <button 
                  onClick={() => setActiveTab('plans')}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
                >
                  Browse Plans
                </button>
              </div>
            )}
          </div>
        )}

        {!user && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Login to Subscribe</h2>
            <p className="text-gray-600 mb-6">Create an account or login to choose your meal plan and start saving.</p>
            <div className="space-x-4">
              <Link 
                to="/login" 
                className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;