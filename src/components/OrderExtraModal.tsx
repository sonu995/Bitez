import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  Truck,
  Sparkles,
  Wallet,
  CreditCard,
  Banknote,
  Clock,
  ShieldCheck,
  Utensils,
  MapPin,
  Lock,
  ArrowRight,
  ShoppingCart
} from 'lucide-react';
import { ordersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

interface OrderExtraModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  subscription: any;
  user: any;
  onSuccess: (order: any) => void;
}

export default function OrderExtraModal({
  isOpen,
  onClose,
  item,
  subscription,
  user,
  onSuccess
}: OrderExtraModalProps) {
  const { hasActiveSub, user: authUser } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const effectiveUser = user || authUser;

  // Determine smart default slot based on local time and live eligibility
  const getSmartDefaultSlot = (meals?: any): 'Lunch' | 'Dinner' => {
    if (meals) {
      if (meals.breakfast?.canAddExtra) return 'Breakfast';
      if (meals.lunch?.canAddExtra) return 'Lunch';
      if (meals.dinner?.canAddExtra) return 'Dinner';
    }
    const hours = new Date().getHours();
    if (hours < 10) return 'Breakfast';
    if (hours < 15) return 'Lunch';
    return 'Dinner';
  };

  const getInitialSlot = (): 'Breakfast' | 'Lunch' | 'Dinner' => {
    const now = new Date();
    const utcMins = now.getUTCHours() * 60 + now.getUTCMinutes();
    const istMins = (utcMins + 330) % 1440;
    if (istMins < 570) return 'Breakfast'; // before 09:30 AM
    if (istMins < 840) return 'Lunch';     // before 02:00 PM
    return 'Dinner';
  };

  const [quantity, setQuantity] = useState(1);
  const [deliverySlot, setDeliverySlot] = useState<'Breakfast' | 'Lunch' | 'Dinner'>(getInitialSlot());
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'cod' | 'upi'>('wallet');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderConfirmed, setOrderConfirmed] = useState<any | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [mealDeliveryStatus, setMealDeliveryStatus] = useState<any>(null);
  const [mealTimings, setMealTimings] = useState<any>(null);

  // Check if current user is an active subscriber
  const isSubscriber = Boolean(
    hasActiveSub ||
    (subscription && (subscription.status === 'active' || subscription.status === 'trial'))
  );

  const walletBalance = Number(effectiveUser?.walletBalance ?? 0);
  const unitPrice = Number(item?.price) || 20;
  // Extra Food with meal always has ₹0 delivery fee
  const deliveryFee = 0;
  const totalPrice = unitPrice * quantity;
  const canUseWallet = walletBalance >= totalPrice;

  // Fetch live meal status to enforce Extra Food With Meal Only Policy
  useEffect(() => {
    if (isOpen) {
      ordersAPI.getMealDeliveryStatus?.().then((res: any) => {
        if (res?.success) {
          if (res.meals) setMealDeliveryStatus(res.meals);
          if (res.timings) setMealTimings(res.timings);
          if (res.meals?.breakfast?.canAddExtra) {
            setDeliverySlot('Breakfast');
          } else if (res.meals?.lunch?.canAddExtra) {
            setDeliverySlot('Lunch');
          } else if (res.meals?.dinner?.canAddExtra) {
            setDeliverySlot('Dinner');
          }
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  // Reset modal state on open or item change
  useEffect(() => {
    if (isOpen && item) {
      if (!orderConfirmed && !addedToCart) {
        setQuantity(1);
        setError(null);
        setLoading(false);
        setAddedToCart(false);
        const initialPrice = Number(item.price) || 20;
        setPaymentMethod(walletBalance >= initialPrice ? 'wallet' : 'cod');
      }
    } else if (!isOpen) {
      setOrderConfirmed(null);
      setAddedToCart(false);
      setError(null);
      setLoading(false);
    }
  }, [isOpen, item?._id || item?.id || item?.name]);

  // Adjust payment if user selected wallet but balance became insufficient
  useEffect(() => {
    if (paymentMethod === 'wallet' && !canUseWallet) {
      setPaymentMethod('cod');
    }
  }, [canUseWallet, paymentMethod]);

  const currentSlotMeal = mealDeliveryStatus ? mealDeliveryStatus[deliverySlot.toLowerCase()] : null;
  const isSlotEligible = Boolean(currentSlotMeal?.canAddExtra);

  const handleAddToCart = () => {
    setError(null);
    if (!isSubscriber) {
      setError('Non-subscribers extra order nahi kar sakte. Yeh feature active subscribers ke liye hai.');
      return;
    }

    if (!currentSlotMeal?.hasValidMeal) {
      setError(`Aapke paas ${deliverySlot} ke liye aaj ka valid Mess Meal nahi hai.`);
      return;
    }

    if (!isSlotEligible) {
      setError(currentSlotMeal?.message || `${deliverySlot} meal ke sath extra food add nahi kiya ja sakta.`);
      return;
    }

    addToCart({
      id: 'extra-' + String(item._id || item.id || item.name).toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: `${item.name} (Extra Side)`,
      price: unitPrice,
      quantity,
      image: item.image || item.imageUrl || '',
      restaurant: `Bitez Mess (${deliverySlot} Tiffin)`,
      isVeg: true,
      isExtra: true,
      mealSlot: deliverySlot,
      mealId: currentSlotMeal.mealId,
      deliverWithMeal: true
    });

    setAddedToCart(true);
  };

  if (!isOpen || !item) return null;

  const handlePlaceOrder = async () => {
    setError(null);

    if (!isSubscriber) {
      setError('Non-subscribers extra order nahi kar sakte. Yeh feature active subscribers ke liye hai.');
      return;
    }

    const slotKey = deliverySlot.toLowerCase();
    const targetMealInfo = mealDeliveryStatus?.[slotKey];

    // Policy Validation 1 & 2: Active Mess Meal & mealId
    if (!targetMealInfo?.hasValidMeal || !targetMealInfo?.mealId) {
      setError(`No active mess meal found for ${deliverySlot} today. Extra food can only be ordered with an active mess meal.`);
      return;
    }

    // Policy Validation 4 & 7: Delivered
    if (targetMealInfo.isDelivered) {
      setError(`This meal has already been delivered. Extra food cannot be added after delivery. Please choose your next eligible meal.`);
      return;
    }

    // Policy Validation 4: Out for delivery
    if (targetMealInfo.isOutForDelivery) {
      setError(`This meal is out for delivery. Extra food cannot be added once dispatched.`);
      return;
    }

    // Policy Validation 5: Order locked
    if (targetMealInfo.isLocked) {
      setError(targetMealInfo.message || `This meal is locked and cannot accept additional items.`);
      return;
    }

    if (!targetMealInfo.canAddExtra) {
      setError(targetMealInfo.message || 'Is meal ke sath extra food add nahi kiya ja sakta.');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        items: [
          {
            id: String(item._id || item.id || Date.now()),
            name: item.name,
            price: unitPrice,
            quantity,
            image: item.image || item.imageUrl || '',
            isVeg: true
          }
        ],
        totalAmount: totalPrice,
        deliveryAddress: subscription?.hostelAddress || user?.deliveryAddress || 'Tagore Hostel, Room 204 (NC-01)',
        paymentMethod:
          paymentMethod === 'wallet'
            ? 'Bitez Campus Wallet'
            : paymentMethod === 'upi'
            ? 'Online UPI'
            : 'Cash on Delivery',
        isExtraOrder: true,
        orderType: 'extra_addon',
        deliverWithMeal: true,
        mealId: targetMealInfo.mealId,
        attachedMealSlot: deliverySlot,
        mealSlot: deliverySlot,
        notes: `🍱 Extra Food packed with ${deliverySlot} Meal (Meal #${targetMealInfo.mealId})`,
        customerName: user?.name || 'Customer',
        customerPhone: user?.phone || ''
      };

      const res = await ordersAPI.create(orderPayload);
      if (res?.success) {
        setOrderConfirmed(res.order || orderPayload);
        if (typeof onSuccess === 'function') {
          onSuccess(res.order || orderPayload);
        }
      } else {
        throw new Error(res?.message || 'Failed to place order');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong while placing order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-amber-200/80 overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[92vh] animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-lg shrink-0">
              🍱
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black tracking-tight leading-tight">Order Extra Add-on</h3>
              <p className="text-[10px] sm:text-[11px] text-amber-100 font-medium">Delivered together with your student meal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5">
          {!isSubscriber ? (
            /* NON-SUBSCRIBER LOCK VIEW */
            <div className="text-center py-4 space-y-4">
              <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/25 mx-auto">
                  <Lock size={32} />
                </div>
                <span className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-md text-amber-600">
                  <Sparkles size={14} />
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  👑 Active Subscribers Only
                </span>
                <h4 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Subscription Required for Extra Items
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Extra add-on items (<strong>{item?.name}</strong>, extra rotis, desserts, sides) are packed and delivered directly inside your daily mess tiffin box. This service is exclusively available to active mess subscribers.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 text-left text-xs space-y-2">
                <p className="font-extrabold text-amber-950 flex items-center gap-1.5 text-[11px]">
                  <Utensils size={13} className="text-orange-600" />
                  Benefits of subscribing to a meal plan:
                </p>
                <ul className="space-y-1.5 text-slate-700 font-medium text-[11px]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    <span>Daily doorstep delivery to your hostel room</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    <span>Add extra rotis, sweets &amp; sides packed inside your tiffin</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    <span>₹0 Delivery Fee on all extra add-on items</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <Link
                  to="/subscriptions"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs rounded-xl shadow-lg shadow-orange-500/25 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>🍱 View Meal Plans &amp; Subscribe</span>
                  <ArrowRight size={14} />
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : addedToCart ? (
            /* Added to cart confirmation card */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} className="animate-bounce-gentle" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  🛒 Added to Food Cart
                </span>
                <h4 className="text-xl font-black text-slate-900 mt-2">Added to Cart!</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1 leading-relaxed">
                  Your <strong>{quantity}x {item.name}</strong> has been added to your cart. Isse meal ke sath pack karke deliver kiya jayega!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-left text-xs space-y-1.5">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Item:</span>
                  <span className="text-slate-900 font-black">{quantity}x {item.name}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Delivery Schedule:</span>
                  <span className="text-orange-700 font-extrabold flex items-center gap-1">
                    <Truck size={12} /> {deliverySlot === 'Instant' ? 'Instant Runner' : `Bundled with ${deliverySlot} Meal`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Delivery Fee:</span>
                  <span className="text-emerald-700 font-extrabold">{deliverySlot === 'Instant' ? '₹30' : '₹0 (Free with Meal)'}</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 pt-2 border-t border-amber-200/60">
                  <span>Cart Subtotal:</span>
                  <span className="text-orange-600 text-sm">₹{unitPrice * quantity}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <button
                  onClick={() => {
                    onClose();
                    navigate('/cart');
                  }}
                  className="flex-1 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs rounded-2xl shadow-lg shadow-orange-500/25 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={15} />
                  <span>Go to Cart &amp; Order with Meal (₹{unitPrice * quantity})</span>
                </button>
                <button
                  onClick={() => setAddedToCart(false)}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition cursor-pointer"
                >
                  + Add More
                </button>
              </div>
            </div>
          ) : orderConfirmed ? (
            /* Success confirmation card */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} className="animate-bounce-gentle" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Confirmed #{String(orderConfirmed.orderId || 'PLACED').slice(-6).toUpperCase()}
                </span>
                <h4 className="text-xl font-black text-slate-900 mt-2">Added to Your Tiffin!</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1 leading-relaxed">
                  Your <strong>{quantity}x {item.name}</strong> will be prepared fresh and packed inside your{' '}
                  <strong className="text-orange-600">{deliverySlot} Tiffin box</strong> for delivery to{' '}
                  <span className="text-slate-800 font-bold">{subscription?.room ? `Room ${subscription.room}` : 'your hostel room'}</span>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200/80 text-left text-xs space-y-1.5">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Item Ordered:</span>
                  <span className="text-slate-900 font-black">{quantity}x {item.name}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Delivery Schedule:</span>
                  <span className="text-orange-700 font-extrabold flex items-center gap-1">
                    <Truck size={12} /> {deliverySlot === 'Instant' ? 'Instant Delivery' : `With ${deliverySlot} Tiffin`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Delivery Fee:</span>
                  <span className="text-emerald-700 font-extrabold">₹0 (Free with Meal)</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 pt-2 border-t border-orange-200/60">
                  <span>Total Paid:</span>
                  <span className="text-orange-600 text-sm">₹{totalPrice}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm rounded-2xl shadow-md shadow-orange-500/20 transition cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Item Card with Quantity Stepper */}
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2.5 sm:gap-4">
                <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-white shadow-2xs border border-slate-200 shrink-0">
                    <img
                      src={item.image || item.imageUrl || 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=200'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={e => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200';
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">{item.name}</h4>
                    </div>
                    <p className="text-xs font-black text-orange-600 mt-0.5">₹{unitPrice} per portion</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">Freshly prepared with your tiffin</p>
                  </div>
                </div>

                {/* Stepper */}
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-1.5 sm:px-2 py-1 rounded-xl border border-slate-200 shadow-2xs shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center font-black text-slate-700 transition cursor-pointer"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-4 sm:w-5 text-center font-black text-xs text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center font-black transition cursor-pointer"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {/* Extra Food With Meal Only Policy Banner */}
              <div className="p-2.5 sm:p-3 rounded-xl bg-amber-500/10 border border-amber-300/80 text-xs text-amber-950 flex items-start gap-2">
                <span className="text-base leading-none">🍱</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-white shadow-2xs">
                      Policy
                    </span>
                    <span className="font-extrabold text-[11px] text-amber-900">
                      Extra Food With Meal Only Policy
                    </span>
                  </div>
                  <p className="text-[10px] text-amber-800 font-medium mt-1 leading-snug">
                    Extra food items are delivered exclusively with your active mess meal. Once a meal is Out for Delivery or Delivered, extra items can no longer be added.
                  </p>
                </div>
              </div>

              {/* Delivery Timing / Bundling Selector */}
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2 flex items-center justify-between">
                  <span>Pack with Eligible Mess Meal:</span>
                  <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    FREE Delivery (₹0)
                  </span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
                  {/* Option 1: Breakfast Tiffin */}
                  {(() => {
                    const bInfo = mealDeliveryStatus?.breakfast;
                    const isEligible = Boolean(bInfo?.canAddExtra);
                    const isSelected = deliverySlot === 'Breakfast';
                    return (
                      <div
                        onClick={() => {
                          if (isEligible) setDeliverySlot('Breakfast');
                        }}
                        className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border-2 transition-all relative ${
                          !isEligible
                            ? 'opacity-60 cursor-not-allowed bg-slate-100 border-slate-200'
                            : isSelected
                            ? 'border-orange-500 bg-orange-50/70 shadow-xs ring-2 ring-orange-500/20 cursor-pointer'
                            : 'border-slate-200 bg-white hover:border-slate-300 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                            <span>🌅 Breakfast</span>
                          </span>
                          {isEligible ? (
                            <span className="text-[8px] font-black uppercase text-emerald-700 bg-emerald-100 px-1 py-0.5 rounded">
                              FREE
                            </span>
                          ) : bInfo?.isDelivered ? (
                            <span className="text-[8px] font-black uppercase text-amber-800 bg-amber-100 px-1 py-0.5 rounded">
                              Delivered
                            </span>
                          ) : bInfo?.isOutForDelivery ? (
                            <span className="text-[8px] font-black uppercase text-blue-700 bg-blue-100 px-1 py-0.5 rounded">
                              Out
                            </span>
                          ) : bInfo?.isLocked ? (
                            <span className="text-[8px] font-black uppercase text-rose-700 bg-rose-100 px-1 py-0.5 rounded">
                              Locked
                            </span>
                          ) : (
                            <span className="text-[8px] font-black uppercase text-slate-500 bg-slate-100 px-1 py-0.5 rounded">
                              No Meal
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">{mealTimings?.breakfast?.deliveryTimeStr || '08:00 AM - 09:30 AM'}</p>
                        <p className={`text-[9px] font-bold mt-0.5 truncate ${!isEligible ? 'text-amber-800' : 'text-orange-700'}`}>
                          {isEligible ? 'Packed in Breakfast' : bInfo?.message || 'Not available'}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Option 2: Lunch Tiffin */}
                  {(() => {
                    const lInfo = mealDeliveryStatus?.lunch;
                    const isEligible = Boolean(lInfo?.canAddExtra);
                    const isSelected = deliverySlot === 'Lunch';
                    return (
                      <div
                        onClick={() => {
                          if (isEligible) setDeliverySlot('Lunch');
                        }}
                        className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border-2 transition-all relative ${
                          !isEligible
                            ? 'opacity-60 cursor-not-allowed bg-slate-100 border-slate-200'
                            : isSelected
                            ? 'border-orange-500 bg-orange-50/70 shadow-xs ring-2 ring-orange-500/20 cursor-pointer'
                            : 'border-slate-200 bg-white hover:border-slate-300 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                            <span>🍱 Lunch</span>
                          </span>
                          {isEligible ? (
                            <span className="text-[8px] font-black uppercase text-emerald-700 bg-emerald-100 px-1 py-0.5 rounded">
                              FREE
                            </span>
                          ) : lInfo?.isDelivered ? (
                            <span className="text-[8px] font-black uppercase text-amber-800 bg-amber-100 px-1 py-0.5 rounded">
                              Delivered
                            </span>
                          ) : lInfo?.isOutForDelivery ? (
                            <span className="text-[8px] font-black uppercase text-blue-700 bg-blue-100 px-1 py-0.5 rounded">
                              Out
                            </span>
                          ) : lInfo?.isLocked ? (
                            <span className="text-[8px] font-black uppercase text-rose-700 bg-rose-100 px-1 py-0.5 rounded">
                              Locked
                            </span>
                          ) : (
                            <span className="text-[8px] font-black uppercase text-slate-500 bg-slate-100 px-1 py-0.5 rounded">
                              No Meal
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">{mealTimings?.lunch?.deliveryTimeStr || '12:30 PM - 02:00 PM'}</p>
                        <p className={`text-[9px] font-bold mt-0.5 truncate ${!isEligible ? 'text-amber-800' : 'text-orange-700'}`}>
                          {isEligible ? 'Packed in Lunch' : lInfo?.message || 'Not available'}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Option 3: Dinner Tiffin */}
                  {(() => {
                    const dInfo = mealDeliveryStatus?.dinner;
                    const isEligible = Boolean(dInfo?.canAddExtra);
                    const isSelected = deliverySlot === 'Dinner';
                    return (
                      <div
                        onClick={() => {
                          if (isEligible) setDeliverySlot('Dinner');
                        }}
                        className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border-2 transition-all relative ${
                          !isEligible
                            ? 'opacity-60 cursor-not-allowed bg-slate-100 border-slate-200'
                            : isSelected
                            ? 'border-orange-500 bg-orange-50/70 shadow-xs ring-2 ring-orange-500/20 cursor-pointer'
                            : 'border-slate-200 bg-white hover:border-slate-300 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                            <span>🌙 Dinner</span>
                          </span>
                          {isEligible ? (
                            <span className="text-[8px] font-black uppercase text-emerald-700 bg-emerald-100 px-1 py-0.5 rounded">
                              FREE
                            </span>
                          ) : dInfo?.isDelivered ? (
                            <span className="text-[8px] font-black uppercase text-amber-800 bg-amber-100 px-1 py-0.5 rounded">
                              Delivered
                            </span>
                          ) : dInfo?.isOutForDelivery ? (
                            <span className="text-[8px] font-black uppercase text-blue-700 bg-blue-100 px-1 py-0.5 rounded">
                              Out
                            </span>
                          ) : dInfo?.isLocked ? (
                            <span className="text-[8px] font-black uppercase text-rose-700 bg-rose-100 px-1 py-0.5 rounded">
                              Locked
                            </span>
                          ) : (
                            <span className="text-[8px] font-black uppercase text-slate-500 bg-slate-100 px-1 py-0.5 rounded">
                              No Meal
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">{mealTimings?.dinner?.deliveryTimeStr || '07:30 PM - 09:00 PM'}</p>
                        <p className={`text-[9px] font-bold mt-0.5 truncate ${!isEligible ? 'text-amber-800' : 'text-orange-700'}`}>
                          {isEligible ? 'Packed in Dinner' : dInfo?.message || 'Not available'}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Delivery Address Reminder */}
              <div className="p-2.5 sm:p-3 bg-amber-50/60 rounded-xl border border-amber-200/70 text-xs flex items-center gap-2 text-slate-700">
                <MapPin size={15} className="text-orange-600 shrink-0" />
                <div className="min-w-0">
                  <span className="font-bold text-slate-900">Destination: </span>
                  <span className="truncate">
                    {subscription?.hostelAddress || user?.deliveryAddress || 'Tagore Hostel, Room 204 (NC-01)'}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {/* Campus Wallet */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wallet')}
                    className={`p-2 sm:p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      paymentMethod === 'wallet'
                        ? 'border-orange-500 bg-orange-50 text-orange-900 font-black shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Wallet size={14} className="text-orange-500" />
                      <span className="text-[8px] sm:text-[9px] uppercase px-1 rounded bg-orange-200/60 font-black">1-Tap</span>
                    </div>
                    <span className="text-[11px] sm:text-xs mt-1 sm:mt-1.5 leading-tight font-bold">Campus Wallet</span>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-normal truncate mt-0.5">₹{walletBalance.toFixed(0)} bal</span>
                  </button>

                  {/* Cash on Delivery */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-2 sm:p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      paymentMethod === 'cod'
                        ? 'border-orange-500 bg-orange-50 text-orange-900 font-black shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold'
                    }`}
                  >
                    <Banknote size={14} className="text-emerald-600" />
                    <span className="text-[11px] sm:text-xs mt-1 sm:mt-1.5 leading-tight font-bold">Cash on Delivery</span>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-normal truncate mt-0.5">Pay with Tiffin</span>
                  </button>

                  {/* UPI */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-2 sm:p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      paymentMethod === 'upi'
                        ? 'border-orange-500 bg-orange-50 text-orange-900 font-black shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold'
                    }`}
                  >
                    <CreditCard size={14} className="text-blue-500" />
                    <span className="text-[11px] sm:text-xs mt-1 sm:mt-1.5 leading-tight font-bold">Online UPI</span>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-normal truncate mt-0.5">GPay / PhonePe</span>
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <span className="shrink-0 text-base">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Ineligible slot alert */}
              {!isSlotEligible && currentSlotMeal && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-start gap-2">
                  <span className="shrink-0 text-base">🚫</span>
                  <div>
                    <p className="font-black">
                      {currentSlotMeal.isTimeEnded
                        ? `${deliverySlot} Delivery Window Ended`
                        : currentSlotMeal.isDelivered
                        ? `${deliverySlot} Meal Delivered`
                        : currentSlotMeal.isOutForDelivery
                        ? `${deliverySlot} Meal Out for Delivery`
                        : currentSlotMeal.isLocked
                        ? `${deliverySlot} Meal Order Locked`
                        : `No Active ${deliverySlot} Meal Today`}
                    </p>
                    <p className="text-[11px] font-medium text-amber-800 mt-0.5">
                      {currentSlotMeal.isTimeEnded
                        ? `Today's ${deliverySlot} delivery time has ended. Please choose Lunch or Dinner to pack extras.`
                        : currentSlotMeal.isDelivered
                        ? 'This meal has already been delivered. Please wait for your next eligible meal to order extras.'
                        : currentSlotMeal.isOutForDelivery
                        ? 'This meal is out for delivery. Extras can no longer be added.'
                        : (currentSlotMeal.message || 'Please wait for your next eligible meal to order extras.')}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!isSlotEligible || loading}
                  className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-lg shadow-orange-500/25 transition transform active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={16} />
                  <span className="truncate">
                    {isSlotEligible
                      ? `Add to Cart (Deliver with ${deliverySlot} Meal • ₹${unitPrice * quantity})`
                      : `Cannot Order (${deliverySlot} Ineligible)`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={!isSlotEligible || loading}
                  className="w-full py-2.5 sm:py-3 bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-700 font-bold text-xs rounded-xl border border-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span>Processing order...</span>
                  ) : (
                    <>
                      <Sparkles size={14} className="text-orange-500" />
                      <span>
                        {isSlotEligible
                          ? `1-Tap Order with ${deliverySlot} Meal (₹${totalPrice})`
                          : (currentSlotMeal?.isTimeEnded ? 'Time Ended' : currentSlotMeal?.isDelivered ? 'Meal Delivered' : currentSlotMeal?.isOutForDelivery ? 'Meal Out for Delivery' : 'Unavailable')}
                      </span>
                    </>
                  )}
                </button>

                <p className="text-center text-[10px] text-slate-400">
                  {isSlotEligible
                    ? `Extra food will be packed inside your ${deliverySlot} tiffin box with ₹0 delivery fee.`
                    : 'Please wait for your next scheduled meal to add extra food items.'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
