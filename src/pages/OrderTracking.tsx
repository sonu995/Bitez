import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Phone, CheckCircle, Package, Truck, Home } from 'lucide-react';
import { ordersAPI } from '../services/api';
import MealLoadingScreen from '../components/MealLoadingScreen';

const OrderTracking: React.FC = () => {
  const { orderId } = useParams();
  const [orderStatus, setOrderStatus] = useState<string>('confirmed');
  const [estimatedTime, setEstimatedTime] = useState<number>(30);
  const [liveOrder, setLiveOrder] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveOrder = async () => {
    if (!orderId) return;
    try {
      const res = await ordersAPI.getById(orderId);
      if (res?.order) {
        setLiveOrder(res.order);
        if (res.order.status) setOrderStatus(res.order.status);
        if (res.order.estimatedMinutes !== undefined) setEstimatedTime(res.order.estimatedMinutes);
        setError(null);
      } else {
        setError('Order not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveOrder();
    // Live polling every 6 seconds while order is active
    const pollInterval = setInterval(() => {
      if (orderStatus !== 'delivered' && orderStatus !== 'cancelled') {
        fetchLiveOrder();
      }
    }, 6000);
    return () => clearInterval(pollInterval);
  }, [orderId, orderStatus]);

  if (loading) {
    return (
      <MealLoadingScreen
        message="Tracking Your Food Delivery..."
        subMessage={`Connecting to delivery runner & kitchen for Order #${orderId}`}
      />
    );
  }

  if (error || !liveOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-200">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6 text-sm">We could not find any active order with ID "{orderId}".</p>
          <Link
            to="/orders"
            className="inline-block bg-orange-500 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-orange-600 transition"
          >
            Go to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const orderDetails = {
    id: liveOrder.orderId || liveOrder._id || orderId,
    restaurant: liveOrder.restaurant || 'Bitez Campus Kitchen',
    items: Array.isArray(liveOrder.items) ? liveOrder.items : [],
    total: liveOrder.totalAmount || 0,
    address: liveOrder.deliveryAddress || 'Campus Hostel / Room Delivery',
    phone: liveOrder.customerPhone || 'N/A',
    paymentMethod: liveOrder.paymentMethod || 'Cash on Delivery',
    paymentStatus: liveOrder.paymentStatus || (liveOrder.paymentMethod === 'Cash on Delivery' ? (orderStatus === 'delivered' ? 'paid' : 'pending') : 'paid'),
    orderTime: liveOrder.createdAt ? new Date(liveOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'
  };

  const deliveryPartner = liveOrder.deliveryPartner || {
    name: 'Assigned Campus Rider',
    phone: '+91 99999 99999',
    vehicle: 'Campus Electric Delivery'
  };

  const statusSteps = [
    { 
      key: 'confirmed', 
      title: 'Order Confirmed', 
      icon: CheckCircle, 
      time: orderDetails.orderTime,
      description: 'Your order has been confirmed by kitchen'
    },
    { 
      key: 'preparing', 
      title: 'Food Being Prepared', 
      icon: Package, 
      time: orderStatus === 'preparing' || orderStatus === 'on-the-way' || orderStatus === 'delivered' ? 'In Kitchen' : null,
      description: 'Chefs are preparing your meal fresh'
    },
    { 
      key: 'on-the-way', 
      title: 'Out for Delivery', 
      icon: Truck, 
      time: estimatedTime > 0 ? `${Math.ceil(estimatedTime)} mins` : 'Dispatched',
      description: 'Rider is on the way to your doorstep'
    },
    { 
      key: 'delivered', 
      title: 'Delivered', 
      icon: Home, 
      time: orderStatus === 'delivered' ? 'Delivered' : null,
      description: 'Order successfully delivered'
    }
  ];

  const getStatusIndex = () => {
    return statusSteps.findIndex(step => step.key === orderStatus);
  };

  const currentStatusIndex = getStatusIndex();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Order #{orderDetails.id}</h1>
              <p className="text-gray-600">From {orderDetails.restaurant}</p>
              <p className="text-sm text-gray-500">Placed at {orderDetails.orderTime}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-orange-600">₹{orderDetails.total}</p>
              <div className="flex flex-col items-end gap-1 mt-1">
                {orderDetails.paymentMethod === 'Cash on Delivery' ? (
                  orderDetails.paymentStatus === 'paid' ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      ✓ Cash Collected on Delivery
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      💵 Cash on Delivery (Pay ₹{orderDetails.total})
                    </span>
                  )
                ) : (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    ✓ Paid ({orderDetails.paymentMethod})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Progress */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              {/* Delivery OTP Card */}
              {orderStatus !== 'delivered' && orderStatus !== 'cancelled' && (
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-2 border-orange-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-black uppercase text-orange-600 tracking-wider block">
                      Delivery Verification OTP
                    </span>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Share this 4-digit code with your delivery rider upon doorstep arrival.
                    </p>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-xl border border-orange-300 shadow-xs text-center shrink-0 ml-3">
                    <span className="text-2xl font-black font-mono tracking-widest text-orange-600">
                      {liveOrder.otp || '4821'}
                    </span>
                  </div>
                </div>
              )}

              {/* Order Delivered Banner */}
              {orderStatus === 'delivered' && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-lg shrink-0">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Order Delivered Successfully!</h3>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Delivered at {liveOrder.deliveredAt || 'Doorstep'}. Enjoy your meal!
                    </p>
                  </div>
                </div>
              )}

              <h2 className="text-lg font-semibold mb-6">Order Status</h2>
              
              <div className="relative">
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const StepIcon = step.icon;

                  return (
                    <div key={step.key} className="relative flex items-center mb-8 last:mb-0">
                      {/* Vertical Line */}
                      {index < statusSteps.length - 1 && (
                        <div className={`absolute left-6 top-12 w-0.5 h-16 ${
                          isCompleted ? 'bg-orange-500' : 'bg-gray-300'
                        }`} />
                      )}
                      
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-orange-500' : 'bg-gray-300'
                      }`}>
                        <StepIcon className="w-6 h-6 text-white" />
                      </div>

                      {/* Content */}
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between items-center">
                          <h3 className={`font-semibold ${
                            isCompleted ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {step.title}
                          </h3>
                          {step.time && (
                            <span className={`text-sm ${
                              isCompleted ? 'text-orange-600' : 'text-gray-500'
                            }`}>
                              {step.time}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${
                          isCompleted ? 'text-gray-700' : 'text-gray-500'
                        }`}>
                          {step.description}
                        </p>
                        
                        {isCurrent && estimatedTime > 0 && (
                          <div className="mt-2">
                            <div className="flex items-center text-sm text-orange-600">
                              <Clock className="w-4 h-4 mr-1" />
                              Estimated delivery in {estimatedTime} minutes
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Partner Info */}
            {orderStatus === 'on-the-way' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Delivery Partner</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {deliveryPartner.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{deliveryPartner.name}</p>
                      <p className="text-sm text-gray-600">{deliveryPartner.vehicle}</p>
                    </div>
                  </div>
                  <a 
                    href={`tel:${deliveryPartner.phone}`}
                    className="bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600"
                  >
                    <Phone className="w-5 h-5" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Order Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Items */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Order Items</h3>
              <div className="space-y-3">
                {orderDetails.items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">₹{item.price}</p>
                  </div>
                ))}
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{orderDetails.total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Delivery Address</h3>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-orange-500 mt-1" />
                <div>
                  <p className="text-gray-700">{orderDetails.address}</p>
                  <p className="text-sm text-gray-600 mt-1">{orderDetails.phone}</p>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
              <div className="space-y-2">
                <Link 
                  to="/support"
                  className="block text-orange-500 hover:text-orange-600 text-sm"
                >
                  Report an issue with order
                </Link>
                <Link 
                  to="/support"
                  className="block text-orange-500 hover:text-orange-600 text-sm"
                >
                  Cancel order
                </Link>
                <Link 
                  to="/support"
                  className="block text-orange-500 hover:text-orange-600 text-sm"
                >
                  Contact support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;