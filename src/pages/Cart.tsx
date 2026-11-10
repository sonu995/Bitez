import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Minus, Plus, Trash2, ShoppingCart, MapPin, Clock, 
  ArrowRight, ShieldCheck, Wallet, CreditCard, 
  Banknote, Sparkles, AlertCircle, CheckCircle2, Zap
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI, adminAPI, dishesAPI } from '../services/api';

const EXTRA_KEYWORDS = ['extra', 'add-on', 'addon', 'roti', 'gulab jamun', 'curd', 'raita', 'papad'];

export const isExtraItem = (item: any): boolean => {
  if (!item) return false;
  if (item.isExtra) return true;
  if (item.category === 'extras') return true;
  const n = (item.name || '').toLowerCase();
  return EXTRA_KEYWORDS.some(kw => n.includes(kw));
};

const PRESET_ADDRESSES = [
  'Tagore Hostel, Room 204 (North Campus, NC-01)',
  'Kasturba Girls Hostel, Room 112 (South Campus, SC-02)',
  'Aryabhatta Hostel, Room 108 (North Campus, NC-01)',
  'Mukherjee Nagar PG Block B, Room 302 (MN-03)'
];

const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, clearCart, totalAmount, addToCart } = useCart();
  const { user, updateWallet, hasActiveSub } = useAuth();
  const navigate = useNavigate();

  const [mealSlot, setMealSlot] = useState<'Direct' | 'Breakfast' | 'Lunch' | 'Dinner'>('Direct');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'upi' | 'cod'>('wallet');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [backendCoupons, setBackendCoupons] = useState<any[]>([]);
  const [mealDeliveryStatus, setMealDeliveryStatus] = useState<any>(null);

  useEffect(() => {
    ordersAPI.getMealDeliveryStatus?.().then((res: any) => {
      if (res?.success && res.meals) {
        setMealDeliveryStatus(res.meals);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    dishesAPI.getAll().then(res => {
      if (res?.dishes && res.dishes.length > 0) {
        setRecommendations(res.dishes.slice(0, 4));
      }
    }).catch(() => {});

    adminAPI.getCoupons().then(res => {
      if (res?.coupons) {
        setBackendCoupons(res.coupons);
      }
    }).catch(() => {});
  }, []);

  // Address editing
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    user?.deliveryAddress || 'Tagore Hostel, Room 204 (North Campus, NC-01)'
  );
  const [tempAddress, setTempAddress] = useState(deliveryAddress);

  const safeItems = Array.isArray(items) ? items : [];
  const safeTotal = Number(totalAmount) || 0;
  const [deliverWithTiffin, setDeliverWithTiffin] = useState(false);

  // Check if subscriber
  const isSubscriber = Boolean(
    hasActiveSub ||
    (user as any)?.subscriptionStatus === 'active' ||
    user?.subscription?.status === 'active' ||
    (user as any)?.hasSubscription === true
  );

  const hasExtra = safeItems.some(it => isExtraItem(it));
  const isPackedWithMeal = Boolean((deliverWithTiffin || hasExtra) && mealSlot !== 'Direct');

  // Live eligibility for Extra Food With Meal Only Policy
  const canPackBreakfast = Boolean(mealDeliveryStatus?.breakfast?.canAddExtra);
  const canPackLunch = Boolean(mealDeliveryStatus?.lunch?.canAddExtra);
  const canPackDinner = Boolean(mealDeliveryStatus?.dinner?.canAddExtra);
  const canPackAnyMeal = Boolean(canPackBreakfast || canPackLunch || canPackDinner);
  const isMealDelivered = Boolean(
    (mealDeliveryStatus?.breakfast?.isDelivered || !mealDeliveryStatus?.breakfast?.hasValidMeal) &&
    (mealDeliveryStatus?.lunch?.isDelivered || !mealDeliveryStatus?.lunch?.hasValidMeal) && 
    (mealDeliveryStatus?.dinner?.isDelivered || !mealDeliveryStatus?.dinner?.hasValidMeal)
  );
  const isMealOutForDelivery = Boolean(
    (mealDeliveryStatus?.breakfast?.isOutForDelivery || mealDeliveryStatus?.breakfast?.isDelivered) &&
    (mealDeliveryStatus?.lunch?.isOutForDelivery || mealDeliveryStatus?.lunch?.isDelivered) &&
    (mealDeliveryStatus?.dinner?.isOutForDelivery || mealDeliveryStatus?.dinner?.isDelivered)
  );
  const targetMealInfo = mealSlot !== 'Direct' ? mealDeliveryStatus?.[mealSlot.toLowerCase()] : null;

  // Auto-enforce Extra Food With Meal Only Policy if cart contains Extra items
  useEffect(() => {
    if (hasExtra) {
      setDeliverWithTiffin(true);
      if (canPackBreakfast) {
        setMealSlot('Breakfast');
      } else if (canPackLunch) {
        setMealSlot('Lunch');
      } else if (canPackDinner) {
        setMealSlot('Dinner');
      } else {
        setMealSlot('Lunch');
      }
    }
  }, [hasExtra, canPackBreakfast, canPackLunch, canPackDinner]);

  const deliveryFee = (isPackedWithMeal && user) ? 0 : (safeTotal > 199 || safeTotal === 0 ? 0 : 30);
  const taxes = Math.round(safeTotal * 0.05); // 5% GST
  const finalAmount = Math.max(0, safeTotal + deliveryFee + taxes - discount);
  const walletBalance = Number(user?.walletBalance ?? 0);

  const handleApplyPromo = (codeToApply?: string) => {
    const code = (codeToApply || promoCode).trim().toUpperCase();
    if (!code) {
      setPromoMessage('Please enter a coupon code.');
      return;
    }

    if (code === 'MESS20' || code === 'SAVE20') {
      const disc = Math.round(safeTotal * 0.2);
      setDiscount(disc);
      setAppliedPromo(code);
      setPromoCode(code);
      setPromoMessage(`🎉 ${code} applied! 20% discount of ₹${disc} deducted.`);
    } else if (code === 'SAVE50') {
      if (safeTotal < 199) {
        setPromoMessage('⚠️ SAVE50 requires minimum order value of ₹199.');
        return;
      }
      setDiscount(50);
      setAppliedPromo('SAVE50');
      setPromoCode('SAVE50');
      setPromoMessage('🎉 SAVE50 applied! Flat ₹50 discount deducted.');
    } else if (code === 'FIRSTORDER' || code === 'FIRST50') {
      const disc = Math.round(safeTotal * 0.25);
      setDiscount(disc);
      setAppliedPromo(code);
      setPromoCode(code);
      setPromoMessage(`🎉 ${code} applied! 25% welcome discount of ₹${disc} deducted.`);
    } else {
      setPromoMessage('❌ Invalid coupon code. Try MESS20 or SAVE50.');
      setDiscount(0);
      setAppliedPromo('');
    }
  };

  const handleSaveAddress = () => {
    if (tempAddress.trim()) {
      setDeliveryAddress(tempAddress.trim());
    }
    setIsEditingAddress(false);
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (isPackedWithMeal && !isSubscriber) {
      alert('Tiffin box packing is exclusively available to active meal plan subscribers. Please subscribe to a meal plan or choose another delivery option.');
      return;
    }

    const targetMealInfo = mealSlot !== 'Direct' ? mealDeliveryStatus?.[mealSlot.toLowerCase()] : null;

    if (hasExtra) {
      if (mealSlot === 'Direct' || !targetMealInfo?.hasValidMeal) {
        alert('Extra Food Policy: Extra food can only be purchased together with an active mess meal. Please select an eligible meal slot.');
        return;
      }
      if (targetMealInfo.isDelivered) {
        alert('Meal Delivered: This meal has already been delivered. Extra food cannot be added. Please wait for your next eligible meal.');
        return;
      }
      if (targetMealInfo.isOutForDelivery) {
        alert('Meal Out for Delivery: Extra food cannot be added once dispatched.');
        return;
      }
      if (targetMealInfo.isLocked) {
        alert(targetMealInfo.message || 'Order Locked: Extra food cannot be added after kitchen cutoff.');
        return;
      }
      if (!targetMealInfo.canAddExtra) {
        alert(targetMealInfo.message || 'Extra food cannot be added to this meal.');
        return;
      }
    }

    if (paymentMethod === 'wallet' && walletBalance < finalAmount) {
      alert(`Insufficient wallet balance (₹${walletBalance.toFixed(2)}). Please top-up or choose UPI / Cash on Delivery.`);
      return;
    }

    setIsSubmitting(true);
    try {
      if (!localStorage.getItem('token')) {
        try {
          const authRes = await adminAPI.quickLogin();
          if (authRes?.token) {
            localStorage.setItem('token', authRes.token);
          }
        } catch {}
      }

      const orderPayload = {
        items: safeItems.map(item => ({
          id: String(item.id),
          name: item.name,
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          isVeg: Boolean(item.isVeg),
          image: item.image || ''
        })),
        totalAmount: Math.round(finalAmount),
        deliveryAddress,
        customerName: user?.name,
        customerPhone: user?.phone,
        isExtraOrder: Boolean(hasExtra || isPackedWithMeal),
        orderType: (hasExtra || isPackedWithMeal) ? 'extra_addon' : 'instant',
        deliverWithMeal: Boolean((isPackedWithMeal || hasExtra) && user),
        mealId: targetMealInfo?.mealId || '',
        attachedMealSlot: isPackedWithMeal ? mealSlot : '',
        mealSlot: isPackedWithMeal ? mealSlot : 'Instant',
        deliveryMode: (isPackedWithMeal || hasExtra) ? 'with_tiffin' : 'direct_runner',
        notes: isPackedWithMeal
          ? `🍱 Deliver extra add-on packed inside ${mealSlot} Tiffin Box`
          : (hasExtra ? `🍱 Extra Food packed with ${mealSlot} Meal` : '⚡ Direct instant food delivery via Rider'),
        paymentMethod: paymentMethod === 'wallet' ? 'Bitez Campus Wallet' : paymentMethod === 'upi' ? 'Online UPI' : 'Cash on Delivery'
      };

      const res = await ordersAPI.create(orderPayload);

      // Wallet balance update if paid via wallet
      if (paymentMethod === 'wallet') {
        if (res?.walletBalance !== undefined) {
          updateWallet(res.walletBalance - walletBalance);
        } else {
          updateWallet(-Math.round(finalAmount));
        }
      }

      clearCart();
      const trackingId = res?.order?.orderId || res?.order?._id || ('ORD' + Date.now());
      navigate(`/track/${trackingId}`);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Something went wrong';
      if (err?.response?.status === 403 || err?.response?.data?.requiresSubscription) {
        alert(errorMsg);
        setIsSubmitting(false);
        return;
      }
      console.warn('Order API error, generating local fallback order:', err.message);
      // Fallback
      if (paymentMethod === 'wallet') {
        updateWallet(-Math.round(finalAmount));
      }
      clearCart();
      const orderId = 'ORD' + Date.now();
      navigate(`/track/${orderId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── EMPTY CART STATE ────────────────────────────────────────────────
  if (safeItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-6 sm:py-10 px-3 sm:px-6 pb-24 sm:pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Empty Hero Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center border border-slate-200 shadow-sm mb-6 sm:mb-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-100 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-5 text-orange-600 shadow-inner">
              <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              Your Food Cart is Empty
            </h1>
            <p className="text-slate-600 text-xs sm:text-base max-w-md mx-auto mb-5 sm:mb-6">
              Looks like you haven't added any campus meals or snacks yet. Explore our student menu or quickly add popular dishes below!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
              <Link 
                to="/menu" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-lg shadow-orange-500/25 transition-all text-xs sm:text-sm"
              >
                Explore Full Menu
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                to="/dashboard" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl transition-all text-xs sm:text-sm"
              >
                Go to User Dashboard
              </Link>
            </div>
          </div>

          {/* Quick Recommendations Section */}
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h2 className="text-base sm:text-xl font-bold text-slate-900 flex items-center gap-1.5 sm:gap-2">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                  Popular Student Favorites
                </h2>
                <p className="text-[11px] sm:text-sm text-slate-500">Quick 1-click add to test your cart and checkout</p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {recommendations.map((dish) => (
                <div 
                  key={dish.id || dish._id} 
                  className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative mb-2 sm:mb-3 overflow-hidden rounded-lg sm:rounded-xl h-24 sm:h-36 bg-slate-100">
                      <img 
                        src={dish.image} 
                        alt={dish.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                      <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-white/95 backdrop-blur-xs text-[9px] sm:text-[11px] font-bold text-slate-800 px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs">
                        {dish.tag || 'Special 🍛'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-xs border border-emerald-600 bg-white flex items-center justify-center shrink-0">
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-600" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">{dish.name}</h3>
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-500 mb-1.5 sm:mb-2 truncate">{dish.restaurant}</p>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-slate-100">
                    <span className="text-sm sm:text-base font-extrabold text-slate-900">₹{dish.price}</span>
                    <button
                      onClick={() => addToCart({
                        id: dish.id,
                        name: dish.name,
                        price: dish.price,
                        image: dish.image,
                        restaurant: dish.restaurant,
                        isVeg: dish.isVeg
                      })}
                      className="bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs transition-colors cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ACTIVE CART STATE ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-8 px-3 sm:px-6 lg:px-8 pb-24 sm:pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">Your Food Cart</h1>
            <p className="text-[11px] sm:text-sm text-slate-500">
              {safeItems.length} item{safeItems.length > 1 ? 's' : ''} ready for hot &amp; fresh hostel delivery
            </p>
          </div>
          <button 
            onClick={clearCart}
            className="text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
          {/* Left Column: Cart Items & Delivery Info */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Cart Items List */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-slate-200 p-3.5 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {safeItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between gap-2.5 sm:gap-4 p-2.5 sm:p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl sm:rounded-2xl transition-all"
                  >
                    <img
                      src={item.image || 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=150'}
                      alt={item.name}
                      className="w-14 h-14 sm:w-20 sm:h-20 object-cover rounded-lg sm:rounded-xl shrink-0 bg-slate-200"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <div className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-xs border shrink-0 flex items-center justify-center ${
                          item.isVeg ? 'border-emerald-600 bg-white' : 'border-rose-600 bg-white'
                        }`}>
                          <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                        </div>
                        <h3 className="font-bold text-slate-900 text-xs sm:text-base truncate">{item.name}</h3>
                        {isExtraItem(item) && (
                          <span className="text-[9px] sm:text-[10px] bg-amber-100 text-amber-900 font-black px-1.5 sm:px-2 py-0.5 rounded-full border border-amber-300 shrink-0">
                            🍱 Meal Add-on
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-500 truncate">{item.restaurant || 'Bitez Mess Kitchen'}</p>
                      <p className="text-xs sm:text-base font-black text-slate-900 mt-0.5 sm:mt-1">
                        ₹{(Number(item.price) || 0) * (Number(item.quantity) || 1)}
                        <span className="text-[10px] sm:text-xs text-slate-400 font-normal ml-1">
                          (₹{Number(item.price) || 0} each)
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                      <div className="flex items-center bg-white border border-slate-200 rounded-lg sm:rounded-xl p-0.5 sm:p-1 shadow-2xs">
                        <button
                          onClick={() => updateQuantity(item.id, (Number(item.quantity) || 1) - 1)}
                          className="w-6 h-6 sm:w-7 sm:h-7 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-md sm:rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                        <span className="font-bold text-xs sm:text-sm px-1.5 sm:px-2.5 text-slate-800">
                          {Number(item.quantity) || 1}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, (Number(item.quantity) || 1) + 1)}
                          className="w-6 h-6 sm:w-7 sm:h-7 bg-orange-500 hover:bg-orange-600 text-white rounded-md sm:rounded-lg flex items-center justify-center cursor-pointer shadow-2xs transition-colors"
                          title="Increase quantity"
                        >
                          <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 sm:p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add more items link */}
              <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <Link 
                  to="/menu" 
                  className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                >
                  + Add more dishes from menu
                </Link>
                <span className="text-[11px] sm:text-xs text-slate-500">
                  {safeTotal > 199 ? '🎉 Free Delivery Active' : `Add ₹${(200 - safeTotal)} more for Free Delivery`}
                </span>
              </div>
            </div>

            {/* Delivery Address Box */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-slate-200 p-3.5 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-base">Hostel Delivery Location</h3>
                    <p className="text-[10px] sm:text-xs text-slate-500">Delivered directly to room door or hostel reception</p>
                  </div>
                </div>
                {!isEditingAddress ? (
                  <button 
                    onClick={() => { setIsEditingAddress(true); setTempAddress(deliveryAddress); }}
                    className="text-xs sm:text-sm text-orange-600 font-bold hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                ) : (
                  <button 
                    onClick={handleSaveAddress}
                    className="text-xs sm:text-sm bg-orange-500 text-white font-bold px-3 py-1 rounded-lg hover:bg-orange-600 cursor-pointer"
                  >
                    Save
                  </button>
                )}
              </div>

              {!isEditingAddress ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 flex items-center justify-between gap-2">
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">{deliveryAddress}</p>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0">
                    Verified Zone
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={tempAddress}
                    onChange={(e) => setTempAddress(e.target.value)}
                    placeholder="Enter hostel, room number and zone..."
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <span className="text-[11px] sm:text-xs text-slate-500 font-medium py-1">Quick Select:</span>
                    {PRESET_ADDRESSES.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setTempAddress(preset)}
                        className="text-[11px] sm:text-xs bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-700 px-2 sm:px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        {preset.split('(')[0].trim()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Mode Card: Direct Order vs Pack with Meal */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-slate-200 p-3.5 sm:p-6 space-y-3.5 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-xs sm:text-base flex items-center gap-2">
                    <span>Delivery Preference</span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500">
                    Choose between fast direct runner delivery or bundling with your daily meal tiffin
                  </p>
                </div>
                <span className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-black border ${
                  deliveryFee === 0 
                    ? 'text-emerald-800 bg-emerald-100 border-emerald-200' 
                    : 'text-amber-800 bg-amber-100 border-amber-200'
                }`}>
                  {deliveryFee === 0 ? 'FREE DELIVERY ₹0' : 'STANDARD ₹30'}
                </span>
              </div>

              {/* 2 Main Selection Options: Direct Order vs Pack with Meal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {/* Option 1: Direct Order */}
                <button
                  type="button"
                  disabled={hasExtra}
                  onClick={() => {
                    if (hasExtra) return;
                    setDeliverWithTiffin(false);
                    setMealSlot('Direct');
                  }}
                  className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border-2 text-left transition flex items-start gap-3 ${
                    hasExtra
                      ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                      : !isPackedWithMeal
                      ? 'border-orange-500 bg-orange-50/70 shadow-xs ring-2 ring-orange-500/20 cursor-pointer'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white cursor-pointer'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-base shrink-0 shadow-2xs ${
                    hasExtra
                      ? 'bg-slate-200 text-slate-400'
                      : !isPackedWithMeal
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    🚀
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-extrabold text-slate-900 text-xs sm:text-sm">Direct Order</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        hasExtra ? 'text-amber-800 bg-amber-100 font-black' : 'text-orange-600 bg-orange-100'
                      }`}>
                        {hasExtra ? 'Policy Locked' : '25-35 mins'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {hasExtra
                        ? 'Policy: Extra food can only be purchased together with an active mess meal. Standalone delivery is unavailable.'
                        : 'Hot doorstep delivery in 25-35 mins directly to your room door via Campus Rider.'}
                    </p>
                  </div>
                </button>

                {/* Option 2: Pack with Meal (Tiffin Box) */}
                <button
                  type="button"
                  disabled={!canPackAnyMeal}
                  onClick={() => {
                    if (!canPackAnyMeal) return;
                    setDeliverWithTiffin(true);
                    if (mealSlot === 'Direct') {
                      if (canPackBreakfast) setMealSlot('Breakfast');
                      else if (canPackLunch) setMealSlot('Lunch');
                      else if (canPackDinner) setMealSlot('Dinner');
                      else setMealSlot('Breakfast');
                    }
                  }}
                  className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border-2 text-left transition flex items-start gap-3 ${
                    !canPackAnyMeal
                      ? 'opacity-60 cursor-not-allowed bg-slate-100 border-slate-200'
                      : isPackedWithMeal
                      ? 'border-orange-500 bg-orange-50/70 shadow-xs ring-2 ring-orange-500/20 cursor-pointer'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white cursor-pointer'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-base shrink-0 shadow-2xs ${
                    !canPackAnyMeal
                      ? 'bg-slate-300 text-slate-500'
                      : isPackedWithMeal
                      ? 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {!canPackAnyMeal ? (isMealDelivered ? '🔒' : isMealOutForDelivery ? '🚫' : '🔒') : '🍱'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-extrabold text-slate-900 text-xs sm:text-sm">Pack with Meal</span>
                      {!canPackAnyMeal ? (
                        <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                          {isMealDelivered ? '🔒 Meal Delivered' : isMealOutForDelivery ? '🚫 Out for Delivery' : '🔒 Unavailable'}
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          ₹0 Free Delivery
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {!canPackAnyMeal
                        ? 'Today\'s meals have already been delivered or dispatched. Extra items cannot be added right now.'
                        : 'Deliver packed inside your daily mess Breakfast, Lunch or Dinner tiffin box.'}
                    </p>
                  </div>
                </button>
              </div>

              {/* Ineligible meal warning banner for Cart */}
              {hasExtra && !canPackAnyMeal && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-start gap-2">
                  <span className="shrink-0 text-base">🚫</span>
                  <div>
                    <p className="font-black">
                      {isMealDelivered
                        ? 'Meal Delivered: Extra Items Unavailable'
                        : isMealOutForDelivery
                        ? 'Meal Out for Delivery: Extra Items Unavailable'
                        : 'Extra Food Policy: No Active Mess Meal Today'}
                    </p>
                    <p className="text-[11px] font-medium text-amber-800 mt-0.5">
                      Extra food can only be delivered packed together with an active mess meal. Once a meal is delivered or dispatched, no extra items can be added.
                    </p>
                  </div>
                </div>
              )}

              {/* Meal Slot Selector: Visible when "Pack with Meal" is selected */}
              {isPackedWithMeal && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] sm:text-xs font-black text-slate-700 uppercase tracking-wider block">
                      Choose Meal Slot to Pack With:
                    </label>
                    <span className="text-[10px] sm:text-xs text-orange-600 font-bold">Bundled with Daily Tiffin</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
                    {/* Breakfast Option */}
                    <button
                      type="button"
                      disabled={!canPackBreakfast}
                      onClick={() => {
                        if (canPackBreakfast) setMealSlot('Breakfast');
                      }}
                      className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border-2 text-left transition flex flex-col justify-between ${
                        !canPackBreakfast
                          ? 'opacity-60 cursor-not-allowed bg-slate-100 border-slate-200'
                          : mealSlot === 'Breakfast'
                          ? 'border-orange-500 bg-orange-50/80 shadow-xs ring-1 ring-orange-500/20 cursor-pointer'
                          : 'border-slate-200 bg-white hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                          <span>🌅 Breakfast</span>
                        </span>
                        {!canPackBreakfast ? (
                          <span className="text-[8px] sm:text-[9px] font-black uppercase text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                            {mealDeliveryStatus?.breakfast?.isDelivered ? 'Delivered' : mealDeliveryStatus?.breakfast?.isOutForDelivery ? 'Out' : mealDeliveryStatus?.breakfast?.isLocked ? 'Locked' : 'Closed'}
                          </span>
                        ) : (
                          <span className="text-[8px] sm:text-[9px] font-black uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            ₹0 Free
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-slate-500 mt-1">08:00 AM - 09:30 AM</span>
                      <span className={`text-[9px] font-bold mt-0.5 ${!canPackBreakfast ? 'text-amber-700' : 'text-orange-600'}`}>
                        {!canPackBreakfast ? (mealDeliveryStatus?.breakfast?.message || 'Breakfast slot closed') : 'Packed in breakfast box'}
                      </span>
                    </button>

                    {/* Lunch Option */}
                    <button
                      type="button"
                      disabled={!canPackLunch}
                      onClick={() => {
                        if (canPackLunch) setMealSlot('Lunch');
                      }}
                      className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border-2 text-left transition flex flex-col justify-between ${
                        !canPackLunch
                          ? 'opacity-60 cursor-not-allowed bg-slate-100 border-slate-200'
                          : mealSlot === 'Lunch'
                          ? 'border-orange-500 bg-orange-50/80 shadow-xs ring-1 ring-orange-500/20 cursor-pointer'
                          : 'border-slate-200 bg-white hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                          <span>🍱 Lunch</span>
                        </span>
                        {!canPackLunch ? (
                          <span className="text-[8px] sm:text-[9px] font-black uppercase text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                            {mealDeliveryStatus?.lunch?.isDelivered ? 'Delivered' : mealDeliveryStatus?.lunch?.isOutForDelivery ? 'Out' : mealDeliveryStatus?.lunch?.isLocked ? 'Locked' : 'Closed'}
                          </span>
                        ) : (
                          <span className="text-[8px] sm:text-[9px] font-black uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            ₹0 Free
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-slate-500 mt-1">12:30 PM - 02:00 PM</span>
                      <span className={`text-[9px] font-bold mt-0.5 ${!canPackLunch ? 'text-amber-700' : 'text-orange-600'}`}>
                        {!canPackLunch ? (mealDeliveryStatus?.lunch?.message || 'Lunch slot closed') : 'Packed in lunch box'}
                      </span>
                    </button>

                    {/* Dinner Option */}
                    <button
                      type="button"
                      disabled={!canPackDinner}
                      onClick={() => {
                        if (canPackDinner) setMealSlot('Dinner');
                      }}
                      className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border-2 text-left transition flex flex-col justify-between ${
                        !canPackDinner
                          ? 'opacity-60 cursor-not-allowed bg-slate-100 border-slate-200'
                          : mealSlot === 'Dinner'
                          ? 'border-orange-500 bg-orange-50/80 shadow-xs ring-1 ring-orange-500/20 cursor-pointer'
                          : 'border-slate-200 bg-white hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                          <span>🌙 Dinner</span>
                        </span>
                        {!canPackDinner ? (
                          <span className="text-[8px] sm:text-[9px] font-black uppercase text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                            {mealDeliveryStatus?.dinner?.isDelivered ? 'Delivered' : mealDeliveryStatus?.dinner?.isOutForDelivery ? 'Out' : mealDeliveryStatus?.dinner?.isLocked ? 'Locked' : 'Closed'}
                          </span>
                        ) : (
                          <span className="text-[8px] sm:text-[9px] font-black uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            ₹0 Free
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-slate-500 mt-1">07:30 PM - 09:00 PM</span>
                      <span className={`text-[9px] font-bold mt-0.5 ${!canPackDinner ? 'text-amber-700' : 'text-orange-600'}`}>
                        {!canPackDinner ? (mealDeliveryStatus?.dinner?.message || 'Dinner slot closed') : 'Packed in dinner box'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-slate-200 p-3.5 sm:p-6">
              <h3 className="font-bold text-slate-900 text-xs sm:text-base mb-2.5 sm:mb-3">Choose Payment Method</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                {/* Wallet Option */}
                <label 
                  className={`border rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 cursor-pointer flex flex-col justify-between transition-all ${
                    paymentMethod === 'wallet' 
                      ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-500/20' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-orange-600" />
                      <span className="text-xs font-bold text-slate-900">Campus Wallet</span>
                    </div>
                    <input 
                      type="radio" 
                      name="payment" 
                      checked={paymentMethod === 'wallet'} 
                      onChange={() => setPaymentMethod('wallet')}
                      className="accent-orange-600"
                    />
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500">
                    Balance: <span className="font-bold text-slate-800">₹{walletBalance.toFixed(2)}</span>
                  </p>
                </label>

                {/* UPI Option */}
                <label 
                  className={`border rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 cursor-pointer flex flex-col justify-between transition-all ${
                    paymentMethod === 'upi' 
                      ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-500/20' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-900">UPI / QR Code</span>
                    </div>
                    <input 
                      type="radio" 
                      name="payment" 
                      checked={paymentMethod === 'upi'} 
                      onChange={() => setPaymentMethod('upi')}
                      className="accent-orange-600"
                    />
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500">GPay, PhonePe, Paytm</p>
                </label>

                {/* COD Option */}
                <label 
                  className={`border rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 cursor-pointer flex flex-col justify-between transition-all ${
                    paymentMethod === 'cod' 
                      ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-500/20' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-bold text-slate-900">Cash on Delivery</span>
                    </div>
                    <input 
                      type="radio" 
                      name="payment" 
                      checked={paymentMethod === 'cod'} 
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-orange-600"
                    />
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500">Pay at delivery</p>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary, Coupons & Checkout */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-slate-200 p-4 sm:p-6 sticky top-20 sm:top-24">
              <h2 className="text-base sm:text-lg font-black text-slate-900 mb-3 sm:mb-4">Order Summary</h2>

              {/* Promo Code Box */}
              <div className="mb-4 sm:mb-5 pb-4 sm:pb-5 border-b border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 sm:mb-2">Have a Coupon Code?</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. MESS20"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-3 py-2 uppercase border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs font-bold tracking-wider"
                  />
                  <button 
                    onClick={() => handleApplyPromo()}
                    className="bg-slate-900 hover:bg-black text-white px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs cursor-pointer transition-colors"
                  >
                    Apply
                  </button>
                </div>

                {/* Available Quick Coupons */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {backendCoupons && backendCoupons.length > 0 ? (
                    backendCoupons.map((c: any) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => handleApplyPromo(c.code)}
                        className="text-[9px] sm:text-[10px] bg-orange-50 hover:bg-orange-100 text-orange-700 font-extrabold px-2 py-0.5 rounded-md border border-orange-200 cursor-pointer"
                      >
                        {c.code} ({c.discountPercent ? `${c.discountPercent}% OFF` : `₹${c.flatDiscount || 50} OFF`})
                      </button>
                    ))
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleApplyPromo('MESS20')}
                        className="text-[9px] sm:text-[10px] bg-orange-50 hover:bg-orange-100 text-orange-700 font-extrabold px-2 py-0.5 rounded-md border border-orange-200 cursor-pointer"
                      >
                        MESS20 (20% OFF)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPromo('SAVE50')}
                        className="text-[9px] sm:text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold px-2 py-0.5 rounded-md border border-emerald-200 cursor-pointer"
                      >
                        SAVE50 (₹50 OFF)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPromo('FIRSTORDER')}
                        className="text-[9px] sm:text-[10px] bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold px-2 py-0.5 rounded-md border border-purple-200 cursor-pointer"
                      >
                        FIRSTORDER (25% OFF)
                      </button>
                    </>
                  )}
                </div>

                {promoMessage && (
                  <p className={`text-xs mt-2 font-semibold ${
                    promoMessage.startsWith('🎉') ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {promoMessage}
                  </p>
                )}
              </div>

              {/* Bill Details */}
              <div className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6 text-xs sm:text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-slate-900">₹{safeTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Hostel Delivery</span>
                  <span className="font-bold text-slate-900">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-bold">
                        {isPackedWithMeal ? 'FREE (With Meal)' : 'FREE'}
                      </span>
                    ) : (
                      `₹${deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Taxes &amp; Packaging (5%)</span>
                  <span className="font-bold text-slate-900">₹{taxes.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50 p-2 rounded-xl text-xs sm:text-sm">
                    <span>Coupon Discount ({appliedPromo})</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-2.5 sm:pt-3">
                  <div className="flex justify-between text-base sm:text-lg font-black text-slate-900">
                    <span>To Pay</span>
                    <span className="text-orange-600">₹{finalAmount.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Inclusive of all campus taxes &amp; charges</p>
                </div>
              </div>

              {/* Delivery ETA info */}
              <div className="flex items-center gap-2 mb-4 sm:mb-6 text-slate-600 text-[11px] sm:text-xs bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-100">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600 shrink-0" />
                <span>
                  {isPackedWithMeal ? (
                    <>Delivered inside <strong className="text-slate-900">{mealSlot} Tiffin Box</strong> ({mealSlot === 'Breakfast' ? '08:00 AM - 09:30 AM' : mealSlot === 'Lunch' ? '12:30 PM - 02:00 PM' : '07:30 PM - 09:00 PM'})</>
                  ) : (
                    <>Direct Hot Delivery in <strong className="text-slate-900">25-35 mins</strong> via Campus Runner</>
                  )}
                </span>
              </div>

              {/* Wallet warning if wallet selected and insufficient */}
              {user && paymentMethod === 'wallet' && walletBalance < finalAmount && (
                <div className="bg-amber-50 border border-amber-200 p-2.5 sm:p-3 rounded-xl mb-4 text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Insufficient Campus Wallet Balance</p>
                    <p>You need ₹{(finalAmount - walletBalance).toFixed(2)} more. Please switch to UPI or Cash on Delivery.</p>
                  </div>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={Boolean(
                  isSubmitting ||
                  (user && paymentMethod === 'wallet' && walletBalance < finalAmount) ||
                  (hasExtra && !canPackAnyMeal) ||
                  (hasExtra && mealSlot !== 'Direct' && !targetMealInfo?.canAddExtra)
                )}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-base shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Processing Order...</span>
                ) : !user ? (
                  <span>Login to Complete Order</span>
                ) : hasExtra && !canPackAnyMeal ? (
                  <span>{isMealDelivered ? '🔒 Meals Delivered (Extra Items Unavailable)' : '🚫 Out for Delivery (Extra Items Unavailable)'}</span>
                ) : hasExtra && mealSlot !== 'Direct' && !targetMealInfo?.canAddExtra ? (
                  <span>🔒 {mealSlot} Meal Unavailable for Extras</span>
                ) : isPackedWithMeal && !isSubscriber ? (
                  <span>👑 Subscription Required for Tiffin Pack</span>
                ) : isPackedWithMeal ? (
                  <span className="truncate">Order with {mealSlot} Meal • ₹{finalAmount.toFixed(2)}</span>
                ) : paymentMethod === 'cod' ? (
                  <span className="truncate">Confirm Cash on Delivery • ₹{finalAmount.toFixed(2)}</span>
                ) : paymentMethod === 'wallet' ? (
                  <span className="truncate">Pay from Campus Wallet • ₹{finalAmount.toFixed(2)}</span>
                ) : (
                  <span className="truncate">Pay via Online UPI • ₹{finalAmount.toFixed(2)}</span>
                )}
              </button>

              {!user && (
                <p className="text-xs text-slate-500 text-center mt-3">
                  <Link to="/login" className="text-orange-600 font-bold hover:underline">
                    Login
                  </Link>{' '}
                  or{' '}
                  <Link to="/register" className="text-orange-600 font-bold hover:underline">
                    Create Student Account
                  </Link>
                </p>
              )}

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Secure Campus Order Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;