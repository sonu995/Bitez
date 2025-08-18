import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Phone, CheckCircle, Package, Truck, Home } from 'lucide-react';

const OrderTracking: React.FC = () => {
  const { orderId } = useParams();
  const [orderStatus, setOrderStatus] = useState('confirmed');
  const [estimatedTime, setEstimatedTime] = useState(35);

  // Simulate order status progression
  useEffect(() => {
    const statusProgression = ['confirmed', 'preparing', 'on-the-way', 'delivered'];
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < statusProgression.length - 1) {
        currentIndex++;
        setOrderStatus(statusProgression[currentIndex]);
        setEstimatedTime(prev => Math.max(0, prev - 10));
      } else {
        clearInterval(interval);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const orderDetails = {
    id: orderId || 'ORD123456',
    restaurant: 'Healthy Mess Co.',
    items: [
      { name: 'Dal Rice Combo', quantity: 2, price: 240 },
      { name: 'Paneer Curry', quantity: 1, price: 150 }
    ],
    total: 420,
    address: '123 Main Street, Delhi - 110001',
    phone: '+91 98765 43210',
    paymentMethod: 'Wallet',
    orderTime: '12:30 PM'
  };

  const deliveryPartner = {
    name: 'Rahul Kumar',
    phone: '+91 87654 32109',
    vehicle: 'Motorcycle - DL 12 AB 3456'
  };

  const statusSteps = [
    { 
      key: 'confirmed', 
      title: 'Order Confirmed', 
      icon: CheckCircle, 
      time: '12:30 PM',
      description: 'Your order has been confirmed'
    },
    { 
      key: 'preparing', 
      title: 'Food Being Prepared', 
      icon: Package, 
      time: '12:45 PM',
      description: 'Restaurant is preparing your food'
    },
    { 
      key: 'on-the-way', 
      title: 'Out for Delivery', 
      icon: Truck, 
      time: estimatedTime > 0 ? `${Math.ceil(estimatedTime)} mins` : '1:15 PM',
      description: 'Your order is on the way'
    },
    { 
      key: 'delivered', 
      title: 'Delivered', 
      icon: Home, 
      time: orderStatus === 'delivered' ? '1:25 PM' : null,
      description: 'Order has been delivered'
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
              <p className="text-2xl font-bold text-orange-500">₹{orderDetails.total}</p>
              <p className="text-sm text-gray-600">{orderDetails.paymentMethod}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Progress */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
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