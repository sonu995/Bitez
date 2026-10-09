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
            to="/menu" 
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:from-orange-600 hover:to-amber-600 transition-all inline-block"
          >
            Explore Instant Order Menu
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
                  <div key={item.id} className="flex items-center justify-between gap-2.5 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-xl">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <div className={`w-3.5 h-3.5 rounded-xs border shrink-0 flex items-center justify-center ${
                          item.isVeg ? 'border-emerald-600 bg-white' : 'border-rose-600 bg-white'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                        </div>
                        <h3 className="font-bold text-gray-900 text-xs sm:text-base truncate">{item.name}</h3>
                      </div>
                      <p className="text-[11px] sm:text-xs text-gray-500 truncate">{item.restaurant}</p>
                      <p className="text-sm sm:text-base font-black text-gray-900 mt-0.5">₹{item.price}</p>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      <div className="flex items-center bg-orange-50 border border-orange-200/80 rounded-xl p-0.5 sm:p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 sm:w-7 sm:h-7 bg-white text-orange-600 rounded-lg flex items-center justify-center hover:bg-orange-100 shadow-2xs cursor-pointer"
                        >
                          <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                        <span className="font-bold text-xs sm:text-sm px-2 text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 sm:w-7 sm:h-7 bg-orange-500 text-white rounded-lg flex items-center justify-center hover:bg-orange-600 shadow-2xs cursor-pointer"
                        >
                          <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
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