import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Package, Star, Clock, MapPin, Phone, Repeat, MessageCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import FeedbackModal from '../components/FeedbackModal';
import { ordersAPI } from '../services/api';

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUserOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await ordersAPI.getMyOrders();
      if (data?.orders) {
        const formatted = data.orders.map((o: any) => {
          const itemNames = Array.isArray(o.items)
            ? o.items.map((i: any) => typeof i === 'string' ? i : `${i.name || 'Item'} x${i.quantity || 1}`)
            : ['Special Meal'];
          const orderDate = o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : 'Recent';
          const orderTime = o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '12:30 PM';

          return {
            id: o.orderId || o._id || o.id,
            restaurant: o.restaurant || 'Healthy Mess & Kitchen',
            items: itemNames,
            amount: o.totalAmount,
            status: o.status,
            date: orderDate,
            time: orderTime,
            deliveryTime: o.status === 'delivered' ? '30 mins' : `${o.estimatedMinutes || 35} mins`,
            rating: o.rating || null,
            image: o.items?.[0]?.image || 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=300',
            deliveryAddress: o.deliveryAddress || '123 Main Street, Delhi',
            paymentMethod: o.paymentMethod || 'Cash on Delivery',
            paymentStatus: o.paymentStatus || (o.paymentMethod === 'Cash on Delivery' ? (o.status === 'delivered' ? 'paid' : 'pending') : 'paid'),
            deliverWithMeal: o.deliverWithMeal,
            attachedMealSlot: o.attachedMealSlot || o.mealSlot,
            isExtraOrder: o.isExtraOrder
          };
        });
        setOrders(formatted);
      }
    } catch {
      // Offline or network error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'preparing': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'on-the-way': return 'bg-orange-500 text-white shadow-xs';
      case 'delivered': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'cancelled': return 'bg-rose-50 text-rose-700 border border-rose-200 line-through';
      default: return 'bg-slate-100 text-slate-700 border border-slate-200';
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
              <p className="text-gray-600 mb-6">Explore our fresh menu and place your first instant order</p>
              <Link 
                to="/menu" 
                className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-orange-600 transition-all inline-block"
              >
                Explore Instant Order Menu
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-gray-900">{order.restaurant}</h3>
                          {(order.deliverWithMeal || order.isExtraOrder) && (
                            <span className="text-[10px] font-black uppercase text-orange-800 bg-orange-100 border border-orange-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              🍱 With {order.attachedMealSlot || 'Meal'} Tiffin
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{order.items.join(', ')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">₹{order.amount}</p>
                        <div className="flex flex-col items-end gap-1 mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                          {order.paymentMethod === 'Cash on Delivery' ? (
                            order.paymentStatus === 'paid' ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                ✓ Cash Collected
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                💵 Pay ₹{order.amount} on Arrival
                              </span>
                            )
                          ) : order.paymentMethod?.includes('Wallet') ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              ✓ Paid via Wallet
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                              ✓ Paid Online (UPI)
                            </span>
                          )}
                        </div>
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
                                <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
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
        <div className="mt-12 bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              to="/menu" 
              className="flex items-center space-x-3 p-4 bg-orange-50 border border-orange-100 rounded-xl hover:bg-orange-100/80 transition duration-200"
            >
              <Package className="w-6 h-6 text-orange-600" />
              <span className="font-bold text-slate-900">Explore Instant Order</span>
            </Link>
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-3 p-4 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200/80 transition duration-200"
            >
              <Calendar className="w-6 h-6 text-slate-800" />
              <span className="font-bold text-slate-900">User Dashboard</span>
            </Link>
            <Link 
              to="/support" 
              className="flex items-center space-x-3 p-4 bg-orange-50 border border-orange-100 rounded-xl hover:bg-orange-100/80 transition duration-200"
            >
              <MessageCircle className="w-6 h-6 text-orange-600" />
              <span className="font-bold text-slate-900">Get Support</span>
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