import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Package, Star, Clock, MapPin, Phone, Repeat, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import FeedbackModal from '../components/FeedbackModal';

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const orders = [
    {
      id: 'ORD001',
      restaurant: 'Healthy Mess Co.',
      items: ['Dal Rice Combo', 'Paneer Curry', 'Roti x2'],
      amount: 240,
      status: 'delivered',
      date: '2024-01-15',
      time: '1:30 PM',
      deliveryTime: '35 mins',
      rating: 4.5,
      image: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=300',
      deliveryAddress: '123 Main Street, Delhi - 110001'
    },
    {
      id: 'ORD002',
      restaurant: 'Student Tiffin Service',
      items: ['Rajma Chawal', 'Mixed Vegetables', 'Pickle'],
      amount: 180,
      status: 'delivered',
      date: '2024-01-14',
      time: '12:45 PM',
      deliveryTime: '28 mins',
      rating: 4.2,
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300',
      deliveryAddress: '123 Main Street, Delhi - 110001'
    },
    {
      id: 'ORD003',
      restaurant: 'Quick Bites Express',
      items: ['Chicken Biryani', 'Raita', 'Boiled Egg'],
      amount: 220,
      status: 'on-the-way',
      date: '2024-01-16',
      time: '12:30 PM',
      deliveryTime: 'Expected in 15 mins',
      rating: null,
      image: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=300',
      deliveryAddress: '123 Main Street, Delhi - 110001'
    },
    {
      id: 'ORD004',
      restaurant: 'Premium Meal Plans',
      items: ['Chole Bhature', 'Lassi', 'Pickle', 'Onions'],
      amount: 160,
      status: 'preparing',
      date: '2024-01-16',
      time: '12:15 PM',
      deliveryTime: 'Expected in 25 mins',
      rating: null,
      image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=300',
      deliveryAddress: '123 Main Street, Delhi - 110001'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'on-the-way': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Order Confirmed';
      case 'preparing': return 'Being Prepared';
      case 'on-the-way': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return ['confirmed', 'preparing', 'on-the-way'].includes(order.status);
    if (activeTab === 'delivered') return order.status === 'delivered';
    return true;
  });

  const handleReorder = (order: any) => {
    alert(`Reordering items from ${order.restaurant}. Items will be added to your cart.`);
  };

  const handleRateOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    setSelectedOrder(order);
    setShowFeedbackModal(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please login to view orders</h2>
          <Link to="/login" className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track your current orders and browse your order history</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            {[
              { key: 'all', label: 'All Orders' },
              { key: 'active', label: 'Active' },
              { key: 'delivered', label: 'Delivered' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition duration-200 ${
                  activeTab === tab.key
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600 mb-6">Start exploring restaurants and place your first order</p>
              <Link 
                to="/" 
                className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
              >
                Browse Restaurants
              </Link>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start space-x-4">
                  {/* Order Image */}
                  <img
                    src={order.image}
                    alt={order.restaurant}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />

                  {/* Order Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{order.restaurant}</h3>
                        <p className="text-sm text-gray-600">{order.items.join(', ')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">₹{order.amount}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>

                    {/* Order Meta Info */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{order.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{order.time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>Order #{order.id}</span>
                      </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{order.deliveryAddress}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{order.deliveryTime}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-3">
                        {order.status === 'delivered' ? (
                          <>
                            <button 
                              onClick={() => handleReorder(order)}
                              className="flex items-center space-x-1 text-orange-500 hover:text-orange-600 font-medium"
                            >
                              <Repeat className="w-4 h-4" />
                              <span>Reorder</span>
                            </button>
                            {order.rating ? (
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-medium">{order.rating}</span>
                              </div>
                            ) : (
                              <button 
                                onClick={() => handleRateOrder(order.id)}
                                className="flex items-center space-x-1 text-orange-500 hover:text-orange-600 font-medium"
                              >
                                <Star className="w-4 h-4" />
                                <span>Rate Order</span>
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            <Link 
                              to={`/track/${order.id}`}
                              className="flex items-center space-x-1 text-orange-500 hover:text-orange-600 font-medium"
                            >
                              <MapPin className="w-4 h-4" />
                              <span>Track Order</span>
                            </Link>
                            <button className="flex items-center space-x-1 text-orange-500 hover:text-orange-600 font-medium">
                              <Phone className="w-4 h-4" />
                              <span>Call</span>
                            </button>
                          </>
                        )}
                      </div>

                      <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
                        <MessageCircle className="w-4 h-4" />
                        <span>Help</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              to="/" 
              className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition duration-200"
            >
              <Package className="w-6 h-6 text-orange-500" />
              <span className="font-medium text-orange-700">Browse Restaurants</span>
            </Link>
            <Link 
              to="/subscriptions" 
              className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition duration-200"
            >
              <Calendar className="w-6 h-6 text-green-500" />
              <span className="font-medium text-green-700">View Meal Plans</span>
            </Link>
            <Link 
              to="/support" 
              className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition duration-200"
            >
              <MessageCircle className="w-6 h-6 text-blue-500" />
              <span className="font-medium text-blue-700">Get Support</span>
            </Link>
          </div>
        </div>

        {/* Feedback Modal */}
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedOrder(null);
          }}
          orderId={selectedOrder?.id}
          restaurantName={selectedOrder?.restaurant}
        />
      </div>
    </div>
  );
};

export default Orders;