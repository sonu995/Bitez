import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart, MapPin, Clock, Percent } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, clearCart, totalAmount } = useCart();
  const { user, updateWallet } = useAuth();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [deliveryAddress, setDeliveryAddress] = useState('123 Main Street, Delhi - 110001');

  const deliveryFee = totalAmount > 200 ? 0 : 30;
  const taxes = totalAmount * 0.05; // 5% GST
  const finalAmount = totalAmount + deliveryFee + taxes - discount;

  const handleApplyPromo = () => {
    if (promoCode === 'SAVE20') {
      setDiscount(totalAmount * 0.2);
    } else if (promoCode === 'FIRST50') {
      setDiscount(50);
    } else {
      alert('Invalid promo code');
    }
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.walletBalance < finalAmount) {
      alert('Insufficient wallet balance. Please add money to your wallet.');
      return;
    }

    // Simulate order placement
    updateWallet(-finalAmount);
    clearCart();
    
    // Generate order ID and redirect to tracking
    const orderId = 'ORD' + Date.now();
    navigate(`/track/${orderId}`);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some delicious items to get started</p>
          <Link 
            to="/" 
            className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
          >
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
                <button 
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-700 font-medium"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.restaurant}</p>
                      <p className="text-lg font-bold text-gray-900">₹{item.price}</p>
                    </div>

                    <div className={`w-6 h-6 rounded border-2 ${
                      item.isVeg 
                        ? 'border-green-500 bg-white' 
                        : 'border-red-500 bg-white'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${
                        item.isVeg ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center hover:bg-orange-200"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-semibold px-3">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center hover:bg-orange-200"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-4">
                <MapPin className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold">Delivery Address</h3>
              </div>
              <p className="text-gray-700 mb-3">{deliveryAddress}</p>
              <button className="text-orange-500 font-medium hover:text-orange-600">
                Change Address
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              {/* Promo Code */}
              <div className="mb-6">
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <button 
                    onClick={handleApplyPromo}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                  >
                    Apply
                  </button>
                </div>
                {discount > 0 && (
                  <p className="text-green-600 text-sm font-medium">
                    <Percent className="w-4 h-4 inline mr-1" />
                    Discount applied: -₹{discount.toFixed(2)}
                  </p>
                )}
              </div>

              {/* Bill Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Taxes & Fees</span>
                  <span>₹{taxes.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>₹{finalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Time */}
              <div className="flex items-center space-x-2 mb-6 text-gray-600">
                <Clock className="w-5 h-5" />
                <span>Estimated delivery: 35-45 mins</span>
              </div>

              {/* Wallet Balance */}
              {user && (
                <div className="bg-green-50 p-3 rounded-lg mb-6">
                  <p className="text-sm text-green-700">
                    Wallet Balance: ₹{user.walletBalance.toFixed(2)}
                  </p>
                  {user.walletBalance < finalAmount && (
                    <p className="text-red-600 text-sm mt-1">
                      Insufficient balance. Add ₹{(finalAmount - user.walletBalance).toFixed(2)} more.
                    </p>
                  )}
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={user && user.walletBalance < finalAmount}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!user ? 'Login to Place Order' : 'Place Order'}
              </button>

              {!user && (
                <p className="text-sm text-gray-600 text-center mt-3">
                  <Link to="/login" className="text-orange-500 hover:text-orange-600">
                    Login
                  </Link>{' '}
                  or{' '}
                  <Link to="/register" className="text-orange-500 hover:text-orange-600">
                    Sign up
                  </Link>{' '}
                  to place order
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;