import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import {
  Wallet,
  Utensils,
  Package,
  TrendingUp,
  Crown,
  Plus,
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  CreditCard,
  User,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  MapPin,
  Edit3,
  Printer,
  QrCode,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  X,
  Check,
  Flame,
  HelpCircle,
  Phone,
  LayoutDashboard,
  CalendarDays,
  PauseCircle,
  PlayCircle,
  RotateCcw,
  Star,
  FileText,
  Copy,
  Award,
  Lock,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ordersAPI, subscriptionsAPI, menuAPI, extrasAPI } from '../services/api';
import SkipMealModal from '../components/SkipMealModal';
import OrderExtraModal from '../components/OrderExtraModal';
import MealLoadingScreen from '../components/MealLoadingScreen';

const DEFAULT_DASHBOARD_EXTRAS = [
  { _id: 'extra-1', id: 'extra-1', name: 'Extra Butter Roti (2 pcs)', price: 15, category: 'Roti', image: 'https://images.pexels.com/photos/10860591/pexels-photo-10860591.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { _id: 'extra-2', id: 'extra-2', name: 'Fresh Paneer Bhurji', price: 45, category: 'Side', image: 'https://images.pexels.com/photos/9738981/pexels-photo-9738981.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { _id: 'extra-3', id: 'extra-3', name: 'Hot Gulab Jamun (2 pcs)', price: 30, category: 'Sweet', image: 'https://images.pexels.com/photos/13435133/pexels-photo-13435133.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { _id: 'extra-4', id: 'extra-4', name: 'Fresh Curd / Boondi Raita', price: 20, category: 'Side', image: 'https://images.pexels.com/photos/4113888/pexels-photo-4113888.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { _id: 'extra-5', id: 'extra-5', name: 'Chilled Sweet Lassi', price: 35, category: 'Beverage', image: 'https://images.pexels.com/photos/10153303/pexels-photo-10153303.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { _id: 'extra-6', id: 'extra-6', name: 'Boiled Eggs (2 pcs)', price: 25, category: 'Side', image: 'https://images.pexels.com/photos/824635/pexels-photo-824635.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { _id: 'extra-7', id: 'extra-7', name: 'Mango / Banana Shake', price: 50, category: 'Beverage', image: 'https://images.pexels.com/photos/3625372/pexels-photo-3625372.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { _id: 'extra-8', id: 'extra-8', name: 'Steamed Jeera Rice Bowl', price: 40, category: 'Side', image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=200' }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, topupWallet, refreshUser, hasActiveSub, isLoading: authLoading, updateProfile } = useAuth();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<'overview' | 'subscription' | 'orders' | 'wallet' | 'profile'>('overview');
  const [orders, setOrders] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [todayMenu, setTodayMenu] = useState<any>(null);
  const [extraItems, setExtraItems] = useState<any[]>(DEFAULT_DASHBOARD_EXTRAS);
  const [loading, setLoading] = useState(true);

  // All Extras "See More" View / Modal state
  const [allExtrasModalOpen, setAllExtrasModalOpen] = useState(false);
  const [extrasCategoryFilter, setExtrasCategoryFilter] = useState<'All' | 'Roti' | 'Side' | 'Sweet' | 'Beverage'>('All');
  const [extrasSearchQuery, setExtrasSearchQuery] = useState('');

  // Helper to categorize extra items
  const getCategoryForExtra = (item: any): string => {
    if (item.category) return item.category;
    const n = (item.name || '').toLowerCase();
    if (n.includes('roti') || n.includes('paratha') || n.includes('naan')) return 'Roti';
    if (n.includes('jamun') || n.includes('rasmalai') || n.includes('sweet') || n.includes('halwa')) return 'Sweet';
    if (n.includes('lassi') || n.includes('shake') || n.includes('chaas') || n.includes('milk')) return 'Beverage';
    return 'Side';
  };

  const filteredAllExtras = extraItems.filter(item => {
    const matchesSearch = !extrasSearchQuery || item.name.toLowerCase().includes(extrasSearchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (extrasCategoryFilter === 'All') return true;
    const cat = getCategoryForExtra(item).toLowerCase();
    if (extrasCategoryFilter === 'Roti') return cat.includes('roti');
    if (extrasCategoryFilter === 'Side') return cat.includes('side') || cat.includes('sabji') || cat.includes('curd');
    if (extrasCategoryFilter === 'Sweet') return cat.includes('sweet') || cat.includes('dessert');
    if (extrasCategoryFilter === 'Beverage') return cat.includes('beverage') || cat.includes('drink');
    return true;
  });

  // Extra add-on meal bundling modal state
  const [selectedExtraItem, setSelectedExtraItem] = useState<any | null>(null);
  const [extraModalOpen, setExtraModalOpen] = useState(false);
  const [attachedMealExtras, setAttachedMealExtras] = useState<any[]>([]);
  const [mealDeliveryStatus, setMealDeliveryStatus] = useState<any>(null);
  const [mealTimings, setMealTimings] = useState<any>(null);

  // Top-up form state
  const [topupAmount, setTopupAmount] = useState<number>(500);
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupSuccess, setTopupSuccess] = useState('');

  // Preference edit modal state
  const [prefModalOpen, setPrefModalOpen] = useState(false);
  const [editHostel, setEditHostel] = useState('');
  const [editRoom, setEditRoom] = useState('');
  const [editDiet, setEditDiet] = useState('Homestyle North Indian Veg');
  const [editNotes, setEditNotes] = useState('Ring bell or leave outside door');
  const [prefSaving, setPrefSaving] = useState(false);

  // Digital Pass Print / View Modal
  const [passModalOpen, setPassModalOpen] = useState(false);

  // Official Fee Invoice Modal
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  // Meal Rating & Feedback
  const [mealRating, setMealRating] = useState<number>(5);
  const [ratingTags, setRatingTags] = useState<string[]>(['Hot & Fresh', 'Soft Rotis']);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Referral code copy state
  const [referralCopied, setReferralCopied] = useState(false);

  // Feedback toast message
  const [subMsg, setSubMsg] = useState('');
  const [isSkipModalOpen, setIsSkipModalOpen] = useState(false);
  const [instantExtraLoading, setInstantExtraLoading] = useState<string | null>(null);

  // Clean fallback images for extras to guarantee 0 broken images
  const fallbackImages: Record<string, string> = {
    'gulab jamun': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=compress&cs=tinysrgb&w=200',
    'rasmalai': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=compress&cs=tinysrgb&w=200',
    'extra roti': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=compress&cs=tinysrgb&w=300',
    'roti': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=compress&cs=tinysrgb&w=300',
    'paneer': 'https://images.pexels.com/photos/9738981/pexels-photo-9738981.jpeg?auto=compress&cs=tinysrgb&w=200',
    'curd': 'https://images.pexels.com/photos/4113888/pexels-photo-4113888.jpeg?auto=compress&cs=tinysrgb&w=200',
    'lassi': 'https://images.pexels.com/photos/10153303/pexels-photo-10153303.jpeg?auto=compress&cs=tinysrgb&w=200',
    'egg': 'https://images.pexels.com/photos/824635/pexels-photo-824635.jpeg?auto=compress&cs=tinysrgb&w=200',
    'rice': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=200',
    'papad': 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=200',
  };

  const getExtraImage = (item: any) => {
    const rawUrl = (item.imageUrl || item.image || '').trim();
    if (rawUrl && !rawUrl.includes('10860591')) return rawUrl;
    const lower = (item.name || '').toLowerCase();
    for (const key of Object.keys(fallbackImages)) {
      if (lower.includes(key)) return fallbackImages[key];
    }
    return 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=compress&cs=tinysrgb&w=200';
  };

  const fetchDashboardData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [ordersRes, subRes, menuRes, extrasRes, attachedRes, mealStatusRes] = await Promise.allSettled([
        ordersAPI.getMyOrders(),
        subscriptionsAPI.getMine(),
        menuAPI.getToday(),
        extrasAPI.getAll(),
        ordersAPI.getAttachedMealExtras(),
        ordersAPI.getMealDeliveryStatus()
      ]);

      if (mealStatusRes.status === 'fulfilled') {
        if (mealStatusRes.value?.meals) {
          setMealDeliveryStatus(mealStatusRes.value.meals);
        }
        if (mealStatusRes.value?.timings) {
          setMealTimings(mealStatusRes.value.timings);
        }
      }

      if (ordersRes.status === 'fulfilled' && ordersRes.value?.orders) {
        setOrders(ordersRes.value.orders);
      }

      if (attachedRes.status === 'fulfilled' && attachedRes.value?.extras) {
        setAttachedMealExtras(attachedRes.value.extras);
      }

      if (subRes.status === 'fulfilled' && subRes.value?.subscription) {
        setSubscription(subRes.value.subscription);
        setEditHostel(subRes.value.subscription.hostelAddress?.split(',')[0] || user?.hostel || 'Tagore Hostel');
        setEditRoom(subRes.value.subscription.room || user?.room || '204');
        setEditDiet(subRes.value.subscription.dietPreference || user?.dietPreference || 'Homestyle North Indian Veg');
      } else {
        setSubscription(null);
        setEditHostel(user?.hostel || 'Tagore Hostel');
        setEditRoom(user?.room || '204');
        setEditDiet(user?.dietPreference || 'Homestyle North Indian Veg');
      }

      if (menuRes.status === 'fulfilled') {
        if (menuRes.value?.menu) setTodayMenu(menuRes.value.menu);
      }

      if (extrasRes.status === 'fulfilled' && extrasRes.value?.items && extrasRes.value.items.length > 0) {
        setExtraItems(extrasRes.value.items);
      } else {
        setExtraItems(prev => prev.length > 0 ? prev : DEFAULT_DASHBOARD_EXTRAS);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      fetchDashboardData(false);
    } else {
      fetchDashboardData(true);
    }
  }, [user?._id || user?.id]);

  // Current meal shift & countdown calculations in IST
  const getMealShiftInfo = () => {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const ist = new Date(utc + istOffset);
    const mins = ist.getHours() * 60 + ist.getMinutes();

    const bTiming = mealTimings?.breakfast;
    const lTiming = mealTimings?.lunch;
    const dTiming = mealTimings?.dinner;

    // Shifts: Breakfast (<10:00 AM), Lunch (10:00 - 15:30), Dinner (15:30+)
    if (mins < 600) {
      const diffMins = Math.max(0, 600 - mins);
      return {
        name: bTiming?.label || 'Breakfast',
        emoji: '☀️',
        dishes: todayMenu?.breakfast || 'Aloo Paratha + Fresh Curd + Masala Chai',
        deliveryTime: bTiming?.deliveryTimeStr || '08:00 AM - 09:30 AM',
        cutoffTime: bTiming?.cutoffTimeStr || '07:30 AM',
        status: mins > 450 ? 'Dispatched to Hostel' : 'Cooking in Kitchen',
        step: mins > 450 ? 4 : 2,
        countdown: `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`
      };
    } else if (mins < 930) {
      const diffMins = Math.max(0, 810 - mins); // delivery around 1:30 PM
      return {
        name: lTiming?.label || 'Lunch Thali',
        emoji: '🍱',
        dishes: todayMenu?.lunch || 'Paneer Butter Masala, Dal Tadka, 4 Butter Phulkas, Jeera Rice, Salad',
        deliveryTime: lTiming?.deliveryTimeStr || '12:30 PM - 02:00 PM',
        cutoffTime: lTiming?.cutoffTimeStr || '11:30 AM',
        status: mins > 750 ? 'Rider Out for Delivery (NC-01)' : mins > 660 ? 'Tiffins Packed in Insulated Boxes' : 'Fresh Cooking in Kitchen',
        step: mins > 750 ? 4 : mins > 660 ? 3 : 2,
        countdown: `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`
      };
    } else {
      const diffMins = Math.max(0, 1230 - mins); // delivery around 8:30 PM
      return {
        name: dTiming?.label || 'Dinner Feast',
        emoji: '🌙',
        dishes: todayMenu?.dinner || 'Seasonal Mix Veg, Dal Makhani, 4 Butter Rotis, Steamed Rice, Boondi Raita',
        deliveryTime: dTiming?.deliveryTimeStr || '07:30 PM - 09:00 PM',
        cutoffTime: dTiming?.cutoffTimeStr || '07:00 PM',
        status: mins > 1170 ? 'Rider Out for Delivery (NC-01)' : mins > 1080 ? 'Packed in Insulated Tiffins' : 'Evening Batch Cooking',
        step: mins > 1170 ? 4 : mins > 1080 ? 3 : 2,
        countdown: `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`
      };
    }
  };

  const currentShift = getMealShiftInfo();

  // Target meal slot based on current shift (Lunch / Dinner / Breakfast)
  const currentSlotTarget = currentShift.name.includes('Dinner')
    ? 'Dinner'
    : currentShift.name.includes('Breakfast')
    ? 'Breakfast'
    : 'Lunch';

  // Current meal extras: ONLY orders bundled with current/today's meal
  const currentMealExtras = useMemo(() => {
    if (!attachedMealExtras || attachedMealExtras.length === 0) return [];

    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const ist = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + istOffset);
    const todayStr = ist.toISOString().split('T')[0];

    // Filter to valid pack-with-meal orders only (ignore instant standalone orders)
    // ONLY show ACTIVE, IN-PROGRESS orders. Once delivered, cancelled, or refunded, remove immediately!
    const validOrders = attachedMealExtras.filter(o => 
      o.deliverWithMeal === true &&
      o.status !== 'delivered' &&
      o.deliveryStatus !== 'Delivered' &&
      o.statusStep !== 'delivered' &&
      o.status !== 'cancelled' &&
      o.status !== 'refunded'
    );

    if (validOrders.length === 0) return [];

    // 1. Strictly match today's date AND current meal slot (Lunch / Dinner)
    const todayCurrentSlotOrders = validOrders.filter(o => {
      const orderDate = o.attachedMealDate || (o.createdAt ? o.createdAt.split('T')[0] : '');
      const orderSlot = (o.attachedMealSlot || o.mealSlot || '').toLowerCase();
      const matchesSlot = orderSlot.includes(currentSlotTarget.toLowerCase());
      const isDateToday = !orderDate || orderDate === todayStr;
      return matchesSlot && isDateToday;
    });

    if (todayCurrentSlotOrders.length > 0) return todayCurrentSlotOrders;

    // 2. Active / pending orders placed today
    const todayActiveOrders = validOrders.filter(o => {
      const orderDate = o.attachedMealDate || (o.createdAt ? o.createdAt.split('T')[0] : '');
      const isDateToday = !orderDate || orderDate === todayStr;
      return isDateToday;
    });

    if (todayActiveOrders.length > 0) return todayActiveOrders;

    // 3. Most recent active / in-progress unfulfilled order for current/upcoming delivery
    const pendingOrders = validOrders.filter(o => 
      o.status === 'confirmed' || o.status === 'preparing' || o.status === 'packed' || o.status === 'on-the-way' || o.status === 'dispatched'
    );

    if (pendingOrders.length > 0) {
      const latestOrder = pendingOrders[0];
      const targetDate = latestOrder.attachedMealDate || (latestOrder.createdAt ? latestOrder.createdAt.split('T')[0] : '');
      const targetSlot = latestOrder.attachedMealSlot || latestOrder.mealSlot;

      // Do NOT show stale active orders from past dates
      if (targetDate && targetDate < todayStr) return [];

      return pendingOrders.filter(o => 
        (o.attachedMealDate || (o.createdAt ? o.createdAt.split('T')[0] : '')) === targetDate &&
        (o.attachedMealSlot || o.mealSlot) === targetSlot
      );
    }

    // Do NOT show past days or delivered orders!
    return [];
  }, [attachedMealExtras, currentSlotTarget]);

  // Topup Wallet
  const handleTopup = async (amount: number) => {
    setTopupLoading(true);
    setTopupSuccess('');
    try {
      await topupWallet(amount);
      await refreshUser();
      setTopupSuccess(`₹${amount} added successfully to your wallet!`);
      setTimeout(() => setTopupSuccess(''), 4000);
    } catch {
      alert('Wallet topup failed. Please try again.');
    } finally {
      setTopupLoading(false);
    }
  };

  // Check if current user is an active subscriber
  const isSubscriber = Boolean(hasActiveSub || (subscription && subscription.status === 'active'));

  // Live eligibility for Extra Food With Meal Only Policy
  const canPackBreakfast = Boolean(mealDeliveryStatus?.breakfast?.canAddExtra);
  const canPackLunch = Boolean(mealDeliveryStatus?.lunch?.canAddExtra);
  const canPackDinner = Boolean(mealDeliveryStatus?.dinner?.canAddExtra);
  const canPackAnyMeal = Boolean(canPackBreakfast || canPackLunch || canPackDinner);
  const activePackSlotName = canPackBreakfast ? 'Breakfast' : canPackLunch ? 'Lunch' : canPackDinner ? 'Dinner' : currentShift.name;

  const currentSlotKey = currentSlotTarget.toLowerCase();
  const currentSlotMeal = mealDeliveryStatus?.[currentSlotKey] || (
    mealDeliveryStatus?.breakfast?.canAddExtra ? mealDeliveryStatus?.breakfast :
    mealDeliveryStatus?.lunch?.canAddExtra ? mealDeliveryStatus?.lunch :
    mealDeliveryStatus?.dinner
  );
  const isMealDelivered = Boolean(currentSlotMeal?.isDelivered);
  const isMealOutForDelivery = Boolean(currentSlotMeal?.isOutForDelivery);

  // Add Extra to Cart
  const handleAddExtra = (item: any) => {
    if (!isSubscriber) {
      handleOpenExtraModal(item);
      return;
    }
    if (!canPackAnyMeal) {
      alert(isMealDelivered 
        ? 'This meal has already been delivered. Extra food cannot be added. Please wait for your next eligible meal.'
        : isMealOutForDelivery 
        ? 'This meal is out for delivery. Extra food cannot be added once dispatched.'
        : 'Extra food can only be ordered together with an active mess meal. No eligible meal is available right now.');
      return;
    }
    addToCart({
      id: item._id || item.id,
      name: item.name,
      price: item.price,
      image: getExtraImage(item),
      restaurant: 'Bitez Campus Kitchen',
      isVeg: true,
      isExtra: true
    });
    setSubMsg(`Added "${item.name}" to your cart!`);
    setTimeout(() => setSubMsg(''), 3000);
  };

  // Open Extra Add-on Modal with Meal Delivery selection
  const handleOpenExtraModal = (item: any) => {
    setSelectedExtraItem({
      ...item,
      image: getExtraImage(item)
    });
    setExtraModalOpen(true);
  };

  const handleCloseExtraModal = () => {
    setExtraModalOpen(false);
    setSelectedExtraItem(null);
  };

  const handleExtraOrderSuccess = async (newOrder: any) => {
    const itemName = newOrder?.items?.[0]?.name || selectedExtraItem?.name || 'Add-on';
    setSubMsg(`🎉 Extra item "${itemName}" confirmed! Scheduled to deliver with your tiffin.`);
    await refreshUser();
    await fetchDashboardData(true);
    setTimeout(() => setSubMsg(''), 6000);
  };

  // Skip Meal Handlers
  const handleOpenSkipModal = () => {
    if (!subscription) {
      alert('No active subscription found to skip meals.');
      return;
    }
    if ((subscription.remainingMeals || 0) <= 0) {
      alert('You have no remaining meals to skip in this subscription cycle.');
      return;
    }
    setIsSkipModalOpen(true);
  };

  const handleSkipSuccess = async (message: string, _credit: number) => {
    setSubMsg(message);
    await refreshUser();
    const updated = await subscriptionsAPI.getMine();
    setSubscription(updated?.subscription || null);
    setTimeout(() => setSubMsg(''), 6000);
  };

  // Pause / Resume Subscription
  const handlePauseSub = async () => {
    const subId = subscription?._id || subscription?.id;
    if (!subId) return;
    const isPaused = subscription.status === 'paused';
    const actionText = isPaused ? 'resume' : 'pause';
    if (!window.confirm(`Do you want to ${actionText} your daily mess deliveries?`)) return;
    try {
      await subscriptionsAPI.pause(subId);
      await refreshUser();
      const res = await subscriptionsAPI.getMine();
      setSubscription(res?.subscription || null);
      setSubMsg(
        isPaused
          ? '🎉 Subscription resumed! Your daily tiffin packing & dispatch is now ACTIVE.'
          : '⏸️ Subscription paused! Meal packing is held and your remaining meal quota is preserved.'
      );
      setTimeout(() => setSubMsg(''), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to toggle subscription pause state');
    }
  };

  // Cancel Subscription
  const handleCancelSub = async () => {
    const subId = subscription?._id || subscription?.id;
    if (!subId) return;
    if (!window.confirm('Are you sure you want to cancel your meal subscription? Unused meals will be converted to wallet credits.')) return;
    try {
      await subscriptionsAPI.cancel(subId);
      await refreshUser();
      const res = await subscriptionsAPI.getMine();
      setSubscription(res?.subscription || null);
      setSubMsg('Subscription cancelled. Refund credited to wallet.');
      setTimeout(() => setSubMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel subscription');
    }
  };

  // Save Preferences (Room, Hostel, Diet)
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrefSaving(true);
    try {
      const subId = subscription?._id || subscription?.id;
      const fullAddress = `${editHostel}, Room ${editRoom} (NC-01)`;

      if (subId) {
        await subscriptionsAPI.updatePreferences(subId, {
          room: editRoom,
          hostelAddress: fullAddress,
          dietPreference: editDiet
        });
      }

      await updateProfile({
        hostel: editHostel,
        room: editRoom,
        dietPreference: editDiet,
        deliveryAddress: fullAddress,
        deliveryNotes: editNotes
      });

      await refreshUser();
      const updated = await subscriptionsAPI.getMine();
      setSubscription(updated?.subscription || null);
      setPrefModalOpen(false);
      setSubMsg('🎉 Delivery room & diet preferences saved successfully!');
      setTimeout(() => setSubMsg(''), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to save preferences');
    } finally {
      setPrefSaving(false);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'preparing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'on-the-way':
        return 'bg-orange-500 text-white border-orange-500 animate-pulse';
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Loading state with lunch box & food delivery animation
  if (authLoading || loading) {
    return (
      <MealLoadingScreen
        message="Loading Student Mess Dashboard..."
        subMessage="Fetching live kitchen feed, meal quota, skips and live dispatch"
      />
    );
  }

  // Admin redirect
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  // If user does not have an active subscription, redirect to mess landing page
  if (!user || (!hasActiveSub && !subscription)) {
    return <Navigate to="/mess" replace />;
  }

  // Subscription calculation
  const remainingMeals = subscription?.remainingMeals ?? 30;
  const totalMeals = subscription?.totalMeals ?? 60;
  const progressPercent = Math.min(100, Math.max(0, Math.round((remainingMeals / totalMeals) * 100)));
  const daysLeft = subscription?.endDate
    ? Math.max(0, Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 25;

  const currentHostelDisplay = subscription?.hostelAddress || (user?.hostel ? `${user.hostel}, Room ${user.room || ''}` : 'Tagore Hostel, Room 204 (NC-01)');
  const currentDietDisplay = subscription?.dietPreference || user?.dietPreference || 'Homestyle North Indian Veg';

  // ══════════════════════════════════════════════════════════════
  // RENDER: OVERVIEW TAB
  // ══════════════════════════════════════════════════════════════
  const renderOverview = () => (
    <div className="space-y-6">

      {/* ── 1. UNIFIED STAT CARDS ROW (2x2 on Mobile, 4-col on Desktop) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        
        {/* Card 1: Active Meal Balance with Progress Bar */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-5 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-bl-full pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400">Meal Balance</span>
              <span className="text-[10px] sm:text-xs font-black text-orange-600 bg-orange-50 border border-orange-200/80 px-1.5 sm:px-2 py-0.5 rounded-full">
                {progressPercent}%
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{remainingMeals}</h3>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400">/ {totalMeals}</span>
            </div>
          </div>

          <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-100">
            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-100 h-1.5 sm:h-2 rounded-full overflow-hidden mb-1.5 sm:mb-2">
              <div
                className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold flex items-center justify-between">
              <span>{daysLeft}d left</span>
              <span className="text-emerald-600 font-bold hidden sm:inline">● Active</span>
            </p>
          </div>
        </div>

        {/* Card 2: Campus Wallet */}
        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 rounded-2xl p-3.5 sm:p-5 text-white shadow-md shadow-orange-500/20 relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-1 sm:mb-1.5">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-orange-100">Wallet</span>
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">₹{user?.walletBalance ?? 0}</h3>
            <p className="text-[10px] sm:text-[11px] text-orange-100 font-medium mt-0.5 truncate">1-Tap Balance</p>
          </div>

          <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-white/20 flex items-center justify-between">
            <button
              onClick={() => setActiveTab('wallet')}
              className="text-[11px] sm:text-xs font-black text-white bg-white/20 hover:bg-white hover:text-orange-600 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl transition-all cursor-pointer active:scale-95 flex items-center gap-1 shadow-2xs"
            >
              <Plus className="w-3 h-3" /> Top-Up
            </button>
            <span className="text-[9px] sm:text-[11px] text-amber-100 font-bold hidden sm:inline">Auto-refund ✓</span>
          </div>
        </div>

        {/* Card 3: Today's Shift & Live Countdown */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-5 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400">Next Shift</span>
              <span className="text-sm sm:text-base">{currentShift.emoji}</span>
            </div>
            <h3 className="text-base sm:text-xl font-black text-slate-900 tracking-tight truncate">{currentShift.name}</h3>
            <p className="text-[11px] sm:text-xs text-orange-600 font-bold mt-0.5 flex items-center gap-1 truncate">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="truncate">{currentShift.deliveryTime}</span>
            </p>
          </div>

          <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs">
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">Cutoff: {currentShift.cutoffTime}</span>
            <button
              onClick={handleOpenSkipModal}
              className="text-[10px] sm:text-[11px] font-black text-orange-600 hover:text-orange-700 hover:underline cursor-pointer shrink-0"
            >
              Skip ➔
            </button>
          </div>
        </div>

        {/* Card 4: Savings & Skips Summary */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-5 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400">Total Saved</span>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
              ₹{Math.round(Number(subscription?.amountPaid || 4299) * 0.15) + (orders.length * 25)}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5 truncate">Student privilege</p>
          </div>

          <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs">
            <span className="text-[10px] sm:text-[11px] text-slate-600 font-bold truncate">
              {subscription?.skippedMeals || 0} skips
            </span>
            <span className="text-[9px] sm:text-[11px] text-emerald-600 font-black bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-md">
              +₹{subscription?.walletCredits || (subscription?.skippedMeals || 0) * 72}
            </span>
          </div>
        </div>

      </div>

      {/* ── 2. MAIN 2-COLUMN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column (8 cols): Live Dispatch Stepper, Menu & Digital Pass */}
        <div className="lg:col-span-8 space-y-6">

          {/* 2A. LIVE KITCHEN & DISPATCH TRACKER */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full">
                    Live Campus Kitchen Feed
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500 font-semibold">📍 {currentHostelDisplay}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Today's {currentShift.name} Dispatch</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPrefModalOpen(true)}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-600 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Update Room Number or Diet Preference"
                >
                  <Edit3 className="w-3.5 h-3.5 text-orange-500" />
                  <span>Change Room / Diet</span>
                </button>
                <button
                  onClick={handleOpenSkipModal}
                  className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Skip Meal</span>
                </button>
              </div>
            </div>

            {/* Stepper Status Bar */}
            <div className="mb-6 px-1">
              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute top-4 left-6 right-6 h-1 bg-slate-100 -z-0" />
                <div
                  className="absolute top-4 left-6 h-1 bg-gradient-to-r from-orange-500 to-amber-500 -z-0 transition-all duration-500"
                  style={{ width: `${((currentShift.step - 1) / 3) * 85}%` }}
                />

                <div className="grid grid-cols-4 text-center relative z-10">
                  {[
                    { label: 'Scheduled', fullLabel: 'Scheduled', icon: '📋', step: 1 },
                    { label: 'Cooking', fullLabel: 'Kitchen Cooking', icon: '🍳', step: 2 },
                    { label: 'Packing', fullLabel: 'Insulated Packing', icon: '🍱', step: 3 },
                    { label: 'Out for Room', fullLabel: 'Out for Room', icon: '🛵', step: 4 }
                  ].map((s) => {
                    const isDone = currentShift.step >= s.step;
                    const isCurrent = currentShift.step === s.step;
                    return (
                      <div key={s.step} className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all shadow-xs ${
                            isCurrent
                              ? 'bg-orange-500 text-white ring-3 ring-orange-100 scale-105'
                              : isDone
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white border-2 border-slate-200 text-slate-400'
                          }`}
                        >
                          {isDone ? s.icon : s.step}
                        </div>
                        <span className={`text-[9px] sm:text-xs font-bold mt-1.5 leading-tight text-center ${isCurrent ? 'text-orange-600 font-black' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                          <span className="sm:hidden">{s.label}</span>
                          <span className="hidden sm:inline">{s.fullLabel}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Today's Dish Showcase Box */}
            <div className="bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-orange-50/70 rounded-2xl p-4 sm:p-5 border border-orange-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-xs border border-orange-200/80 flex items-center justify-center text-2xl shrink-0">
                  {currentShift.emoji}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-black uppercase text-orange-700 bg-white px-2 py-0.5 rounded-md border border-orange-200 shadow-2xs">
                      {currentDietDisplay}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700">✓ 100% Homestyle</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                    {currentShift.dishes}
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10px] sm:text-[11px] font-black">
                    <span className="bg-white px-2 py-0.5 rounded-md border border-orange-200 text-orange-700 shadow-2xs">
                      🔥 540 kcal
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded-md border border-orange-200 text-emerald-700 shadow-2xs">
                      💪 26g Protein
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded-md border border-orange-200 text-amber-700 shadow-2xs">
                      🌾 62g Carbs
                    </span>
                    <span className="text-slate-400 font-bold hidden sm:inline">•</span>
                    <span className="text-slate-500 font-semibold hidden sm:inline">Desi Ghee Phulkas</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Next shift scheduled: {currentShift.name === 'Breakfast' ? 'Lunch Thali (12:30 PM)' : currentShift.name === 'Lunch Thali' ? 'Dinner Feast (07:30 PM)' : 'Breakfast tomorrow (08:00 AM)'}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => navigate('/timetable')}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-white hover:bg-orange-50 text-orange-700 font-extrabold text-xs rounded-xl border border-orange-200 transition shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CalendarDays className="w-3.5 h-3.5 text-orange-600" />
                  <span>Weekly Mess Timetable</span>
                </button>
              </div>
            </div>

            {/* Attached Extra Add-ons to this Meal (CURRENT MEAL ONLY) */}
            {currentMealExtras && currentMealExtras.length > 0 ? (
              <div className="mt-3.5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-dashed border-amber-400 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-lg shadow-sm shrink-0">
                    🍱
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500 text-white shadow-2xs">
                        ✨ Extra Add-ons Packed with Meal
                      </span>
                      <span className="text-[11px] font-black text-amber-900 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-md">
                        {currentSlotTarget} Tiffin
                      </span>
                      {/* Live packing status badge */}
                      {(() => {
                        const allDelivered = currentMealExtras.every((o: any) => o.status === 'delivered');
                        const anyOnTheWay = currentMealExtras.some((o: any) => o.status === 'on-the-way' || o.status === 'dispatched');
                        const riderName = currentMealExtras.find((o: any) => o.deliveryPartner?.name || o.riderName)?.deliveryPartner?.name;

                        if (allDelivered) {
                          return (
                            <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <CheckCircle2 size={11} className="text-emerald-600" />
                              Delivered with Meal
                            </span>
                          );
                        }
                        if (anyOnTheWay) {
                          return (
                            <span className="text-[10px] font-black text-blue-800 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                              <Truck size={11} className="text-blue-600" />
                              On Route with Rider {riderName ? `(${riderName})` : ''}
                            </span>
                          );
                        }
                        return (
                          <span className="text-[10px] font-black text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Clock size={11} className="text-amber-600" />
                            Packing in Mess Kitchen
                          </span>
                        );
                      })()}
                    </div>
                    <p className="text-xs sm:text-sm font-black text-slate-900 mt-1.5 flex flex-wrap gap-1.5 items-center">
                      {currentMealExtras.flatMap((o: any) => o.items?.map((it: any, idx: number) => (
                        <span key={it.id || `${it.name}-${idx}`} className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-amber-300/90 text-slate-900 shadow-2xs font-extrabold">
                          <span className="text-orange-600 font-black">{it.quantity || 1}x</span>
                          <span>{it.name}</span>
                        </span>
                      )))}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-xl shadow-2xs">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    Zero Delivery Fee (₹0)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (extraItems && extraItems.length > 0) {
                        handleOpenExtraModal(extraItems[0]);
                      }
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 rounded-xl text-[10px] font-black transition cursor-pointer flex items-center gap-1 shadow-2xs"
                    title="Add more sides or sweets to this meal"
                  >
                    <Plus size={11} className="text-amber-700" />
                    <span>Add More</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3.5 p-3 sm:p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🥟</span>
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      Want extra Rotis, Gulab Jamun, or Sabji with today's {activePackSlotName}?
                    </span>
                    <p className="text-[10px] text-slate-500">
                      Pack with meal request delivers directly with your tiffin at ₹0 delivery fee!
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (extraItems && extraItems.length > 0) {
                      handleOpenExtraModal(extraItems[0]);
                    } else {
                      setAllExtrasModalOpen(true);
                    }
                  }}
                  className="px-3 py-1.5 font-black text-xs rounded-xl shadow-2xs transition flex items-center gap-1 shrink-0 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white cursor-pointer"
                  title="Pack Extra Add-ons with Scheduled Meal"
                >
                  <Sparkles size={12} />
                  <span>⚡ Pack Extra with Meal</span>
                </button>
              </div>
            )}

          </div>

          {/* 2B. DIGITAL STUDENT MESS PASS CARD (WARM SUNSET THEME) */}
          <div className="bg-gradient-to-br from-[#9A3412] via-[#C2410C] to-[#D97706] text-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-orange-950/15 relative overflow-hidden border border-amber-400/30">
            {/* Background luxury watermark */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 right-10 text-8xl font-black text-white/10 select-none pointer-events-none font-mono">
              BITEZ
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-5 border-b border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white text-orange-600 flex items-center justify-center shadow-md font-black text-lg">
                  {user?.name?.charAt(0) || 'S'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-200 bg-black/20 px-2 py-0.5 rounded-md border border-white/20 backdrop-blur-xs">
                      STUDENT SMART PASS
                    </span>
                    <span className="text-emerald-200 text-xs font-bold flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-md border border-white/20">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Verified
                    </span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-black tracking-tight text-white mt-0.5">{user?.name || 'Student'}</h4>
                  <p className="text-xs text-amber-100 font-mono">ID: #{String(subscription?._id || subscription?.id || 'PASS').slice(-6).toUpperCase()}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPassModalOpen(true)}
                  className="px-3.5 py-2 bg-white text-orange-700 hover:bg-orange-50 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-black/10"
                >
                  <QrCode className="w-3.5 h-3.5 text-orange-600" />
                  <span>Scan QR / Print</span>
                </button>
              </div>
            </div>

            {/* Pass Grid Details */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
              <div className="bg-white/15 backdrop-blur-sm p-3.5 rounded-2xl border border-white/20 shadow-2xs">
                <p className="text-[10px] uppercase font-bold text-amber-100">Plan Tier</p>
                <p className="font-black text-white text-sm">{subscription?.planId?.name || 'Standard'} Plan</p>
                <p className="text-[10px] text-amber-100">{subscription?.planId?.mealsPerDay || 2} Meals / Day</p>
              </div>

              <div className="bg-white/15 backdrop-blur-sm p-3.5 rounded-2xl border border-white/20 shadow-2xs">
                <p className="text-[10px] uppercase font-bold text-amber-100">Hostel &amp; Room</p>
                <p className="font-black text-white text-sm truncate">{subscription?.room ? `Room ${subscription.room}` : 'Room 204'}</p>
                <p className="text-[10px] text-amber-100 truncate">{subscription?.hostelAddress?.split(',')[0] || 'Tagore Hostel'}</p>
              </div>

              <div className="bg-white/15 backdrop-blur-sm p-3.5 rounded-2xl border border-white/20 shadow-2xs">
                <p className="text-[10px] uppercase font-bold text-amber-100">Diet Style</p>
                <p className="font-black text-white text-sm truncate">{currentDietDisplay}</p>
                <p className="text-[10px] text-amber-100">Pure Veg Certified</p>
              </div>

              <div className="bg-white/15 backdrop-blur-sm p-3.5 rounded-2xl border border-white/20 shadow-2xs">
                <p className="text-[10px] uppercase font-bold text-amber-100">Pass Validity</p>
                <p className="font-black text-emerald-200 text-sm">
                  {subscription?.endDate
                    ? new Date(subscription.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                    : '30 Days'}
                </p>
                <p className="text-[10px] text-amber-100">{daysLeft} days left</p>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between text-[11px] text-amber-100 pt-2 border-t border-white/20">
              <span className="flex items-center gap-1.5 text-white font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                Valid for Campus Mess &amp; Direct Hostel Doorstep Dispatch
              </span>
              <span className="font-mono text-amber-200 font-bold">Zone: NC-01</span>
            </div>
          </div>

          {/* 2C. ADD EXTRA SIDES & SWEETS CAROUSEL */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span>Add Extra Sides &amp; Sweets to Today's Tiffin</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isSubscriber
                    ? "Craving extra roti, sweet lassi or hot dessert? Add directly with 1-tap"
                    : "🔒 Active Subscribers Only — Non-subscribers extra order nahi kar sakte"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full hidden sm:inline-block border ${
                  isSubscriber ? 'text-orange-600 bg-orange-50 border-orange-200' : 'text-amber-800 bg-amber-50 border-amber-300'
                }`}>
                  {isSubscriber ? '⚡ Packed Together' : '👑 Subscribers Only'}
                </span>

                {/* SEE MORE BUTTON IN HEADER */}
                <button
                  type="button"
                  onClick={() => setAllExtrasModalOpen(true)}
                  className="text-xs font-black text-orange-600 hover:text-white bg-orange-50 hover:bg-orange-500 border border-orange-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs group"
                  title="See all extra sides, sweets & beverages"
                >
                  <span>See More</span>
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            <div className="flex space-x-3.5 overflow-x-auto scrollbar-hide pb-2 pt-1 snap-x snap-mandatory">
              {extraItems.map((item, idx) => (
                <div
                  key={item._id || item.id || idx}
                  className="min-w-[150px] max-w-[160px] snap-center bg-white border border-slate-200 rounded-2xl p-3 text-center shadow-2xs hover:shadow-md transition-all group flex-shrink-0 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-16 h-16 mx-auto rounded-2xl overflow-hidden mb-2 bg-slate-100 shadow-2xs group-hover:scale-105 transition-transform">
                      <img
                        src={getExtraImage(item)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=compress&cs=tinysrgb&w=200';
                        }}
                      />
                    </div>
                    <h5 className="text-xs font-black text-slate-900 truncate leading-snug">{item.name}</h5>
                    <p className="text-xs font-extrabold text-orange-600 mt-0.5">₹{item.price}</p>
                  </div>

                  <div className="flex gap-1.5 mt-3 pt-2 border-t border-slate-100">
                    <button
                      disabled={!canPackAnyMeal && isSubscriber}
                      onClick={() => handleAddExtra(item)}
                      className={`flex-1 text-[10px] font-black py-1.5 rounded-lg transition-colors ${
                        !canPackAnyMeal && isSubscriber
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                          : 'bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-600 cursor-pointer'
                      }`}
                      title={!canPackAnyMeal ? (isMealDelivered ? "Meal Delivered" : isMealOutForDelivery ? "Meal Out for Delivery" : "Unavailable") : isSubscriber ? "Add to cart" : "Subscribers only"}
                    >
                      {!canPackAnyMeal && isSubscriber ? (isMealDelivered ? '🔒 Delivered' : '🚫 Out') : isSubscriber ? '+ Cart' : '🔒 Locked'}
                    </button>
                    <button
                      onClick={() => handleOpenExtraModal(item)}
                      className="flex-1 text-[10px] font-black py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-95"
                      title="Order to deliver inside your scheduled meal"
                    >
                      <span>⚡ Pack with Meal</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* SEE MORE CARD AT END OF CAROUSEL */}
              <div
                onClick={() => setAllExtrasModalOpen(true)}
                className="min-w-[140px] max-w-[150px] snap-center bg-gradient-to-br from-orange-50/80 to-amber-50/80 hover:from-orange-100 hover:to-amber-100 border-2 border-dashed border-orange-300 hover:border-orange-500 rounded-2xl p-3.5 text-center shadow-2xs hover:shadow-md transition-all group flex-shrink-0 flex flex-col items-center justify-between cursor-pointer"
                title="View all extra sides & sweets"
              >
                <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center my-auto shadow-sm group-hover:scale-110 transition-transform">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h5 className="text-xs font-black text-slate-900 leading-snug">See More</h5>
                  <p className="text-[10px] text-orange-600 font-bold mt-0.5">View All Extras</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-black text-orange-700 bg-orange-200/60 px-2 py-0.5 rounded-md group-hover:bg-orange-500 group-hover:text-white transition">
                    Explore ➔
                  </span>
                </div>
              </div>
            </div>

            {/* BOTTOM HELPER / SEE MORE BAR */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px] sm:text-xs">
                {extraItems.length} extra items available • Packed inside your meal container with ₹0 delivery fee
              </span>
              <button
                type="button"
                onClick={() => setAllExtrasModalOpen(true)}
                className="font-black text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 cursor-pointer text-xs"
              >
                <span>See More Items</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* 2D. RECENT ORDERS LIST */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-500" />
                <span>Recent Orders &amp; Add-ons</span>
              </h3>
              {orders.length > 0 && (
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-black text-orange-600 hover:text-orange-700 cursor-pointer"
                >
                  View All ({orders.length}) ➔
                </button>
              )}
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-8 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No instant food orders placed yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5 mb-3">Order burgers, biryani, or midnight cravings anytime</p>
                <Link
                  to="/menu"
                  className="inline-flex items-center gap-1.5 bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-black shadow-xs hover:bg-orange-600 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Instant Food Menu
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {orders.slice(0, 3).map((o) => {
                  const id = o.orderId || o._id || o.id;
                  const itemSummary = Array.isArray(o.items)
                    ? o.items.map((i: any) => typeof i === 'string' ? i : `${i.name || 'Dish'} x${i.quantity || 1}`).join(', ')
                    : 'Special Meal';

                  return (
                    <div key={id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 px-2 rounded-xl transition">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-lg shrink-0">
                          🍱
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-slate-900">#{id.slice(-6).toUpperCase()}</span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getStatusBadge(o.status)}`}>
                              {o.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium truncate max-w-sm mt-0.5">{itemSummary}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        <span className="font-black text-sm text-slate-900">₹{o.totalAmount}</span>
                        <Link
                          to={`/track/${id}`}
                          className="px-3 py-1.5 bg-orange-50 hover:bg-orange-500 text-orange-600 hover:text-white border border-orange-200 rounded-xl text-xs font-bold transition"
                        >
                          Track Status
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2E. RATE TODAY'S MEAL & CHEF FEEDBACK */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 leading-snug">Rate Today's {currentShift.name}</h4>
                  <p className="text-xs text-slate-500">Live feedback directly reaches Chef Manoj &amp; Mess Manager</p>
                </div>
              </div>
              {ratingSubmitted && (
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  ✓ Recorded
                </span>
              )}
            </div>

            {!ratingSubmitted ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-center gap-2 py-1 bg-amber-50/50 rounded-2xl border border-amber-100">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setMealRating(star)}
                      className="p-1 hover:scale-125 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= mealRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200 hover:text-amber-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5 justify-center">
                  {['Hot & Fresh', 'Soft Rotis', 'Tasty Dal', 'Perfect Spice', 'Super Fast', 'Need Extra Salad'].map((tag) => {
                    const isSelected = ratingTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setRatingTags((prev) =>
                            isSelected ? prev.filter((t) => t !== tag) : [...prev, tag]
                          );
                        }}
                        className={`text-[11px] font-bold px-3 py-1 rounded-xl transition cursor-pointer border ${
                          isSelected
                            ? 'bg-orange-500 text-white border-orange-500 shadow-2xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{tag}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Chef note (optional): e.g. Taste was delicious!"
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setRatingSubmitted(true);
                      setSubMsg('🌟 Thank you! Your feedback reached Chef Manoj & Mess Kitchen team.');
                      setTimeout(() => setSubMsg(''), 5000);
                    }}
                    className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black rounded-xl shadow-xs transition cursor-pointer active:scale-95"
                  >
                    Submit
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center text-xs text-emerald-800 font-bold flex items-center justify-between">
                <span>⭐ {mealRating}/5 Stars • "{ratingTags.join(', ')}" recorded for kitchen!</span>
                <button
                  onClick={() => setRatingSubmitted(false)}
                  className="text-[11px] text-emerald-700 underline font-extrabold cursor-pointer"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Right Column (4 cols): Quick Controls, Wallet & FAQs */}
        <div className="lg:col-span-4 space-y-6">

          {/* 2E. QUICK ACTIONS HUB */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span>Student Quick Hub</span>
            </h3>

            <div className="space-y-2.5">
              <button
                onClick={handleOpenSkipModal}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-800 font-extrabold text-xs transition border border-orange-200/80 cursor-pointer active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">⏭️</span>
                  <div className="text-left">
                    <p className="font-black text-orange-950">Skip Next Meal</p>
                    <p className="text-[10px] text-orange-700 font-medium">Automatic 100% wallet credit refund</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-orange-600" />
              </button>

              <button
                onClick={handlePauseSub}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs transition border border-slate-200 cursor-pointer active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{subscription?.status === 'paused' ? '▶️' : '⏸️'}</span>
                  <div className="text-left">
                    <p className="font-black text-slate-900">{subscription?.status === 'paused' ? 'Resume Plan Deliveries' : 'Pause Plan (Vacations/Exams)'}</p>
                    <p className="text-[10px] text-slate-500 font-medium">Holds packing without losing meals</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <Link
                to="/timetable"
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs transition border border-slate-200 cursor-pointer active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">📅</span>
                  <div className="text-left">
                    <p className="font-black text-slate-900">7-Day Kitchen Timetable</p>
                    <p className="text-[10px] text-slate-500 font-medium">See breakfast, lunch &amp; dinner menu</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                to="/plans#pricing"
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs transition border border-slate-200 cursor-pointer active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">⚡</span>
                  <div className="text-left">
                    <p className="font-black text-slate-900">Upgrade / Renew Plan</p>
                    <p className="text-[10px] text-slate-500 font-medium">Switch to 3-Meal or Semester Pass</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>

              <button
                onClick={() => setPrefModalOpen(true)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs transition border border-slate-200 cursor-pointer active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">📍</span>
                  <div className="text-left">
                    <p className="font-black text-slate-900">Change Delivery Room</p>
                    <p className="text-[10px] text-slate-500 font-medium">Currently: {currentHostelDisplay}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* 2F. INSTANT WALLET QUICK RECHARGER (WARM THEME) */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-orange-500" />
                <span>Quick Wallet Recharge</span>
              </h4>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                0% Fee
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Current balance: <strong className="text-slate-900 font-extrabold">₹{user?.walletBalance ?? 0}</strong>
            </p>

            <div className="grid grid-cols-4 gap-2 mb-3">
              {[100, 250, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleTopup(amt)}
                  disabled={topupLoading}
                  className="py-2.5 bg-slate-50 hover:bg-orange-500 hover:text-white text-slate-800 rounded-xl text-xs font-black transition border border-slate-200/80 cursor-pointer active:scale-95 shadow-2xs"
                >
                  +₹{amt}
                </button>
              ))}
            </div>

            {topupSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl text-center mb-2 animate-fade-in">
                {topupSuccess}
              </div>
            )}

            <button
              onClick={() => setActiveTab('wallet')}
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black transition shadow-xs cursor-pointer active:scale-98 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Custom Top-Up Amount
            </button>
          </div>

          {/* 2G. HOSTEL BUDDY PRIVILEGE */}
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-3xl p-5 shadow-md shadow-orange-500/20 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-amber-200" />
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-100 bg-white/20 px-2 py-0.5 rounded-md">
                Hostel Buddy Privilege
              </span>
            </div>
            <h4 className="text-base font-black tracking-tight">Refer a Roommate, Get ₹150</h4>
            <p className="text-xs text-orange-100 mt-1 leading-relaxed">
              Give your hostel friends ₹150 off on their first monthly tiffin pass. You receive ₹150 directly in your campus wallet!
            </p>
            <div className="mt-3.5 flex items-center gap-2">
              <div className="bg-white/20 border border-white/30 rounded-xl px-3 py-2 text-xs font-mono font-bold flex-1 truncate">
                BITEZ-{user?.name?.slice(0, 3)?.toUpperCase() || 'STU'}150
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`Hey! Use my Bitez Mess invite code BITEZ-${user?.name?.slice(0, 3)?.toUpperCase() || 'STU'}150 for ₹150 off on fresh daily homestyle tiffins: http://localhost:5173/mess`);
                  setReferralCopied(true);
                  setTimeout(() => setReferralCopied(false), 3000);
                }}
                className="px-3.5 py-2 bg-white text-orange-600 hover:bg-orange-50 font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{referralCopied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          {/* 2H. HELPLINE & EMERGENCY ASSISTANCE */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-200/90 rounded-3xl p-5 text-slate-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-black text-slate-900">Campus Mess Kitchen Desk</h5>
                <p className="text-[10px] text-slate-500">Live 7:00 AM – 10:30 PM Everyday</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Facing any tiffin delivery issue or food feedback? Directly connect with our kitchen manager.
            </p>
            <div className="flex items-center gap-2">
              <Link
                to="/support"
                className="flex-1 py-2 bg-white hover:bg-orange-100 text-orange-700 font-black text-xs rounded-xl border border-orange-200 text-center transition shadow-2xs"
              >
                Submit Ticket
              </Link>
              <a
                href="https://wa.me/919876543210?text=Hello%20Bitez%20Mess%20Support"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl text-center transition shadow-2xs"
              >
                WhatsApp Desk
              </a>
            </div>
          </div>

        </div>

      </div>

    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // RENDER: SUBSCRIPTION TAB
  // ══════════════════════════════════════════════════════════════
  const renderSubscriptionTab = () => (
    <div className="space-y-6">
      
      {/* Plan Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full border ${
                subscription?.status === 'active'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : subscription?.status === 'paused'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                {subscription?.status === 'active' ? '● Active Meal Pass' : subscription?.status === 'paused' ? '⏸️ Paused' : 'Expired'}
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: #{String(subscription?._id || 'PASS').slice(-6).toUpperCase()}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {subscription?.planId?.name || 'Standard'} Meal Subscription
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Billed {subscription?.billingCycle || 'monthly'} • ₹{subscription?.amountPaid || 4299} paid • {subscription?.planId?.mealsPerDay || 2} Daily Meals
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleOpenSkipModal}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer active:scale-95"
            >
              ⏭️ Skip Next Meal
            </button>
            <button
              onClick={handlePauseSub}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              {subscription?.status === 'paused' ? '▶️ Resume Deliveries' : '⏸️ Pause Plan'}
            </button>
            <Link
              to="/plans#pricing"
              className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 font-extrabold text-xs rounded-xl border border-orange-200 transition"
            >
              ⚡ Change Plan
            </Link>
            <button
              onClick={() => setInvoiceModalOpen(true)}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs rounded-xl border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-orange-500" />
              <span>Mess Bill Receipt</span>
            </button>
          </div>
        </div>

        {/* 4 Detail Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
            <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Start Date</span>
            <p className="text-sm font-extrabold text-slate-900">
              {subscription?.startDate ? new Date(subscription.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '12 Oct 2026'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
            <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Valid Until</span>
            <p className="text-sm font-extrabold text-slate-900">
              {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '11 Nov 2026'}
            </p>
            <span className="text-[10px] text-emerald-600 font-bold">{daysLeft} days remaining</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
            <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Remaining Balance</span>
            <p className="text-sm font-black text-orange-600">
              {remainingMeals} / {totalMeals} Meals
            </p>
            <span className="text-[10px] text-slate-500 font-semibold">{progressPercent}% Quota Available</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
            <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Diet Style</span>
            <p className="text-sm font-extrabold text-slate-900 truncate">{currentDietDisplay}</p>
            <button
              onClick={() => setPrefModalOpen(true)}
              className="text-[10px] text-orange-600 font-bold hover:underline"
            >
              Edit Preference ➔
            </button>
          </div>
        </div>

        {/* Delivery Address Pill */}
        <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-lg">📍</span>
            <span className="text-slate-700">
              Current Hostel Dispatch Point: <strong className="text-slate-900 font-extrabold">{currentHostelDisplay}</strong>
            </span>
          </div>
          <button
            onClick={() => setPrefModalOpen(true)}
            className="text-xs font-black text-orange-600 hover:text-orange-700 bg-white px-3 py-1 rounded-lg border border-orange-200 shadow-2xs cursor-pointer"
          >
            Update Room Number
          </button>
        </div>
      </div>

      {/* Skip History Section */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>🗓️ Meal Skips &amp; Wallet Refund Log</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Every skipped meal is credited directly back to your Bitez wallet without waste</p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl">
            {subscription?.skipHistory?.length || subscription?.skippedMeals || 0} Skips Total
          </span>
        </div>

        {Array.isArray(subscription?.skipHistory) && subscription.skipHistory.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {subscription.skipHistory.map((skip: any, idx: number) => (
              <div key={skip.id || idx} className="py-3.5 flex items-center justify-between text-xs hover:bg-slate-50/50 px-2 rounded-xl transition">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{skip.mealType === 'breakfast' ? '🌅' : skip.mealType === 'lunch' ? '☀️' : '🌙'}</span>
                  <div>
                    <p className="font-extrabold text-slate-900 text-sm">
                      {skip.mealType === 'breakfast' ? '🌅 Morning Breakfast' : skip.mealType === 'lunch' ? '☀️ Lunch Thali' : '🌙 Dinner Feast'} — {skip.date}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Reason: "{skip.reason || 'Student skip'}" • Scheduled slot: {skip.mealSlot || (skip.mealType === 'breakfast' ? '08:00 AM' : skip.mealType === 'lunch' ? '12:30 PM' : '07:30 PM')}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-black text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg text-xs inline-block">
                    +₹{skip.refundCredit || 72}.00 Refunded
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-0.5 font-medium">Credited to wallet ✓</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
            <RotateCcw className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No skipped meals yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Need to eat outside? Skip upcoming meals 2h prior to get 100% wallet credit.</p>
          </div>
        )}
      </div>

    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // RENDER: ORDERS TAB
  // ══════════════════════════════════════════════════════════════
  const renderOrdersTab = () => (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 text-orange-500" />
            <span>Order History &amp; Food Delivery</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track live kitchen status, delivery progress, and past food orders
          </p>
        </div>

        <Link
          to="/menu"
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Order Food Now
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900">No food orders placed yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Try our crispy burgers, momos, rolls, or paneer specials delivered hot in 25 minutes!
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-1.5 bg-orange-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs hover:bg-orange-600 transition"
          >
            Explore Food Menu ➔
          </Link>
        </div>
      ) : (
        <div className="space-y-3.5">
          {orders.map((o) => {
            const id = o.orderId || o._id || o.id;
            const itemNames = Array.isArray(o.items)
              ? o.items.map((i: any) => typeof i === 'string' ? i : `${i.name || 'Dish'} x${i.quantity || 1}`).join(', ')
              : 'Meal Order';

            return (
              <div
                key={id}
                className="p-4 sm:p-5 border border-slate-200/90 rounded-2xl hover:border-orange-300 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white shadow-2xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="font-black text-slate-900 text-sm">#{id.slice(-6).toUpperCase()}</span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getStatusBadge(o.status)}`}>
                      {o.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(o.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 font-semibold truncate max-w-md">{itemNames}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">📍 {o.deliveryAddress || 'Campus Hostel Room'}</p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <span className="text-lg font-black text-slate-900">₹{o.totalAmount}</span>
                  <Link
                    to={`/track/${id}`}
                    className="px-4 py-2 bg-orange-50 hover:bg-orange-500 text-orange-600 hover:text-white border border-orange-200 rounded-xl text-xs font-black transition"
                  >
                    Track Status
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // RENDER: WALLET TAB
  // ══════════════════════════════════════════════════════════════
  const renderWalletTab = () => (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
          <Wallet className="w-6 h-6 text-orange-500" />
          <span>Bitez Campus Digital Wallet</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Zero payment failures, instant refunds from skipped meals, and 1-tap fast checkout.
        </p>
      </div>

      {/* Main Balance Card */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <p className="text-orange-100 text-xs font-black uppercase tracking-wider mb-1">Available Campus Balance</p>
        <h3 className="text-4xl sm:text-5xl font-black mb-2 tracking-tight">₹{user?.walletBalance ?? 0}</h3>
        <p className="text-xs text-orange-100">
          ✓ All meal skip refunds are directly deposited to this balance in real-time.
        </p>
      </div>

      {/* Quick Topup Selector */}
      <div className="space-y-4">
        <label className="block text-xs font-black uppercase tracking-wider text-slate-700">Select Top-Up Amount</label>
        <div className="grid grid-cols-4 gap-2.5">
          {[100, 250, 500, 1000].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setTopupAmount(amt)}
              className={`py-3 rounded-2xl font-black text-sm border transition-all cursor-pointer ${
                topupAmount === amt
                  ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-2xs'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
              }`}
            >
              ₹{amt}
            </button>
          ))}
        </div>

        <div className="flex gap-2.5">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-3.5 text-slate-400 font-bold">₹</span>
            <input
              type="number"
              min={10}
              max={50000}
              value={topupAmount}
              onChange={(e) => setTopupAmount(Number(e.target.value))}
              className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-2xl text-base font-bold text-slate-900 focus:outline-none focus:border-orange-500"
              placeholder="Custom Amount"
            />
          </div>
          <button
            onClick={() => handleTopup(topupAmount)}
            disabled={topupLoading || topupAmount <= 0}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-md transition cursor-pointer active:scale-95"
          >
            {topupLoading ? 'Adding...' : 'Add Cash'}
          </button>
        </div>

        {topupSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {topupSuccess}
          </div>
        )}
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // RENDER: PROFILE TAB
  // ══════════════════════════════════════════════════════════════
  const renderProfileTab = () => (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <User className="w-6 h-6 text-orange-500" />
            <span>Student Profile &amp; Preferences</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">Manage delivery address, contact details and room number</p>
        </div>
        <button
          onClick={() => setPrefModalOpen(true)}
          className="px-3.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs rounded-xl border border-orange-200 transition flex items-center gap-1.5 cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" /> Edit
        </button>
      </div>

      <div className="space-y-3">
        <div className="p-4 bg-slate-50/70 rounded-2xl flex justify-between items-center border border-slate-200/70">
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase">Full Name</p>
            <p className="text-base font-extrabold text-slate-900">{user?.name || 'Student'}</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50/70 rounded-2xl flex justify-between items-center border border-slate-200/70">
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase">Email Address</p>
            <p className="text-base font-extrabold text-slate-900">{user?.email || ''}</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50/70 rounded-2xl flex justify-between items-center border border-slate-200/70">
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase">Hostel &amp; Delivery Room</p>
            <p className="text-base font-extrabold text-slate-900">{currentHostelDisplay}</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50/70 rounded-2xl flex justify-between items-center border border-slate-200/70">
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase">Diet Style</p>
            <p className="text-base font-extrabold text-orange-600">{currentDietDisplay}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // MAIN RETURN
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 sm:pb-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">

        {/* ── TOP HEADER BAR ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] uppercase font-black tracking-widest bg-orange-50 text-orange-600 border border-orange-200/80 px-2 py-0.5 rounded-full">
                Student Mess Portal
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">•</span>
              <span className="text-[11px] sm:text-xs text-slate-500 font-semibold truncate">📍 {currentHostelDisplay}</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Welcome back, {user?.name?.split(' ')[0] || 'Rahul'}!</span>
              <span className="text-xl sm:text-2xl">👋</span>
            </h1>
            <p className="text-[11px] sm:text-sm text-slate-500 mt-0.5">
              Live campus tiffin balance, daily kitchen feed, skip manager &amp; live orders
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('wallet')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200/90 text-slate-800 text-xs font-extrabold rounded-xl hover:bg-orange-50 hover:text-orange-600 transition shadow-2xs cursor-pointer active:scale-95"
            >
              <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
              <span>₹{user?.walletBalance ?? 0}</span>
            </button>
            <Link
              to="/menu"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black rounded-xl shadow-md shadow-orange-500/20 transition cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Instant Food</span>
            </Link>
          </div>
        </div>

        {/* Action feedback toast */}
        {subMsg && (
          <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-extrabold text-center shadow-xs flex items-center justify-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{subMsg}</span>
          </div>
        )}

        {/* ── RESPONSIVE FLOATING NAVIGATION TABS ── */}
        <div className="flex overflow-x-auto scrollbar-hide bg-white p-1 sm:p-1.5 rounded-2xl border border-slate-200/90 shadow-2xs gap-1 sm:gap-1.5 snap-x">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'subscription', label: 'Plan & Skips', icon: Crown },
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'wallet', label: 'Wallet', icon: Wallet },
            { id: 'profile', label: 'Profile', icon: User }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`snap-start flex-1 min-w-[95px] sm:min-w-0 py-2 sm:py-2.5 px-2.5 sm:px-3.5 rounded-xl font-black text-xs sm:text-sm transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap select-none ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs scale-101'
                    : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
          <Link
            to="/timetable"
            className="snap-start flex-1 min-w-[95px] sm:min-w-0 py-2 sm:py-2.5 px-2.5 sm:px-3.5 rounded-xl font-black text-xs sm:text-sm transition-all text-center flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap select-none text-slate-600 hover:text-orange-600 hover:bg-orange-50/50"
          >
            <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
            <span>Timetable</span>
          </Link>
        </div>

        {/* ── ACTIVE TAB CONTENT ── */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'subscription' && renderSubscriptionTab()}
        {activeTab === 'orders' && renderOrdersTab()}
        {activeTab === 'wallet' && renderWalletTab()}
        {activeTab === 'profile' && renderProfileTab()}

      </div>

      {/* ── SKIP MEAL MODAL ── */}
      <SkipMealModal
        isOpen={isSkipModalOpen}
        onClose={() => setIsSkipModalOpen(false)}
        subscription={subscription}
        userWalletBalance={user?.walletBalance || 0}
        onSuccess={handleSkipSuccess}
      />

      {/* ── PREFERENCE EDIT MODAL ── */}
      {prefModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-orange-500" />
                <span>Update Delivery Room &amp; Diet</span>
              </h3>
              <button
                onClick={() => setPrefModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePreferences} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">Hostel Name</label>
                <input
                  type="text"
                  required
                  value={editHostel}
                  onChange={(e) => setEditHostel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-orange-500"
                  placeholder="e.g. Tagore Hostel, Ganga Hostel"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">Room Number</label>
                <input
                  type="text"
                  required
                  value={editRoom}
                  onChange={(e) => setEditRoom(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-orange-500"
                  placeholder="e.g. 204, B-12"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">Diet Style</label>
                <select
                  value={editDiet}
                  onChange={(e) => setEditDiet(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-orange-500 bg-white"
                >
                  <option value="Homestyle North Indian Veg">Homestyle North Indian Veg (Default)</option>
                  <option value="Jain Meal (No Onion/Garlic)">Jain Meal (No Onion/Garlic)</option>
                  <option value="High Protein Student Diet">High Protein Student Diet</option>
                  <option value="Low Oil Light Homestyle">Low Oil Light Homestyle</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">Hostel Delivery Note</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-orange-500"
                  placeholder="e.g. Leave outside room 204 door, call once rider arrives"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setPrefModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={prefSaving}
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {prefSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── PRINT DIGITAL PASS MODAL ── */}
      {passModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-in text-center">
            <div className="flex justify-end mb-1">
              <button
                onClick={() => setPassModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Pass Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#9A3412] via-[#C2410C] to-[#D97706] text-white text-left shadow-lg mb-4 border border-amber-400/40">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-200 bg-black/20 px-2 py-0.5 rounded-md border border-white/20">BITEZ SMART PASS</span>
                  <h4 className="text-lg font-black text-white mt-1">{user?.name || 'Student'}</h4>
                  <p className="text-xs text-amber-100 font-mono">ID: #{String(subscription?._id || 'PASS').slice(-6).toUpperCase()}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white text-orange-600 flex items-center justify-center font-black shadow-md text-xl">
                  🍱
                </div>
              </div>

              <div className="bg-white/15 backdrop-blur-sm p-3.5 rounded-2xl text-xs space-y-1 mb-4 border border-white/20">
                <p>📍 <strong>Hostel:</strong> {currentHostelDisplay}</p>
                <p>🥗 <strong>Diet:</strong> {currentDietDisplay}</p>
                <p>🍽️ <strong>Plan:</strong> {subscription?.planId?.name || 'Standard'} (2 Meals/Day)</p>
                <p>🗓️ <strong>Expires:</strong> {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString('en-IN') : '30 Days'}</p>
              </div>

              {/* QR Code representation */}
              <div className="bg-white p-3.5 rounded-2xl flex items-center justify-center gap-3.5 shadow-sm">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-amber-700 rounded-xl flex items-center justify-center text-white font-mono text-[9px] p-1.5 text-center shadow-inner">
                  [QR PASS CODE #{String(subscription?._id || 'PASS').slice(-6).toUpperCase()}]
                </div>
                <div className="text-slate-800 text-xs text-left">
                  <p className="font-black text-slate-900">Scan at Kitchen Counter</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Instant gate &amp; mess verification</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
              <button
                onClick={() => setPassModalOpen(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── OFFICIAL MESS INVOICE / RECEIPT MODAL ── */}
      {invoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-scale-in text-left">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-slate-900">Bitez Express Kitchen</span>
                  <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    Official Fee Receipt
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">FSSAI Lic: 10823999000124 • GSTIN: 20AAACB1234F1Z5</p>
              </div>
              <button
                onClick={() => setInvoiceModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 mb-5 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Reference:</span>
                <span className="font-mono font-bold text-slate-900">INV-2026-{String(subscription?._id || '98231').slice(-6).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-extrabold text-slate-900">{user?.name || 'Student'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hostel &amp; Room:</span>
                <span className="font-bold text-slate-900">{currentHostelDisplay}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subscription Validity:</span>
                <span className="font-bold text-slate-900">
                  {subscription?.startDate ? new Date(subscription.startDate).toLocaleDateString('en-IN') : '12 Oct 2026'} — {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString('en-IN') : '11 Nov 2026'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Plan Quota:</span>
                <span className="font-bold text-slate-900">{subscription?.planId?.name || 'Standard'} ({subscription?.planId?.mealsPerDay || 2} Meals/Day, {subscription?.totalMeals || 60} Total)</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden mb-5 text-xs">
              <div className="bg-slate-100 px-4 py-2 font-black text-slate-700 flex justify-between">
                <span>Fee Breakdown</span>
                <span>Amount</span>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>Monthly Mess Plan ({subscription?.totalMeals || 60} Thalis)</span>
                  <span>₹{subscription?.amountPaid || 4299}.00</span>
                </div>
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>Doorstep Insulated Delivery &amp; Packaging</span>
                  <span className="text-emerald-600 font-bold">FREE (Student Privilege)</span>
                </div>
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>Taxes &amp; FSSAI Hygiene Fee</span>
                  <span className="text-slate-500">Inclusive (₹0.00)</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
                  <span>Total Paid (Online UPI / Card)</span>
                  <span className="text-orange-600 font-black">₹{subscription?.amountPaid || 4299}.00</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 mb-5 text-center">
              Official computer-generated receipt valid for college/hostel fee reimbursement and scholarship proof.
            </p>

            <div className="flex gap-2.5">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save as PDF</span>
              </button>
              <button
                onClick={() => setInvoiceModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Meal-Bundled Extra Add-on Modal */}
      {extraModalOpen && selectedExtraItem && (
        <OrderExtraModal
          isOpen={extraModalOpen}
          onClose={handleCloseExtraModal}
          item={selectedExtraItem}
          subscription={subscription}
          user={user}
          onSuccess={handleExtraOrderSuccess}
        />
      )}

      {/* ── ALL EXTRA SIDES & SWEETS FULL MODAL (SEE MORE) ── */}
      {allExtrasModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-amber-200/90 overflow-hidden flex flex-col max-h-[92vh] animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Header Banner */}
            <div className="px-6 py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl shadow-inner">
                  🍱
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                      All Extra Sides &amp; Sweets
                    </h3>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/25 text-white tracking-wider">
                      ₹0 Delivery Fee
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-100 font-medium">
                    Freshly packed and delivered inside your student tiffin meal container
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAllExtrasModalOpen(false)}
                className="p-2 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition cursor-pointer"
                title="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search & Category Filter Toolbar */}
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200/80 space-y-3 shrink-0">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                {/* Search Input */}
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={extrasSearchQuery}
                    onChange={e => setExtrasSearchQuery(e.target.value)}
                    placeholder="Search roti, dahi, sweets..."
                    className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all placeholder:text-slate-400"
                  />
                  {extrasSearchQuery && (
                    <button
                      onClick={() => setExtrasSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Category Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-hide pb-0.5">
                  {[
                    { key: 'All', label: 'All Items', icon: '🍽️' },
                    { key: 'Roti', label: 'Rotis', icon: '🫓' },
                    { key: 'Side', label: 'Sides & Sabzi', icon: '🍛' },
                    { key: 'Sweet', label: 'Sweets', icon: '🍨' },
                    { key: 'Beverage', label: 'Drinks', icon: '🥛' }
                  ].map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => setExtrasCategoryFilter(cat.key as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shrink-0 flex items-center gap-1 ${
                        extrasCategoryFilter === cat.key
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-200/70 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Scrollable Items Grid */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1">
              {filteredAllExtras.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl">
                    🔍
                  </div>
                  <h4 className="text-base font-black text-slate-800">No Extra Items Found</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    No items match your search "{extrasSearchQuery}". Try a different keyword or reset filters.
                  </p>
                  <button
                    onClick={() => {
                      setExtrasSearchQuery('');
                      setExtrasCategoryFilter('All');
                    }}
                    className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredAllExtras.map((item, idx) => (
                    <div
                      key={item._id || item.id || idx}
                      className="bg-white border border-slate-200/90 rounded-2xl p-3.5 text-center shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between hover:border-orange-300"
                    >
                      <div>
                        <div className="relative w-full aspect-square max-h-32 mx-auto rounded-xl overflow-hidden mb-2.5 bg-slate-100 shadow-2xs group-hover:scale-102 transition-transform">
                          <img
                            src={getExtraImage(item)}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=compress&cs=tinysrgb&w=200';
                            }}
                          />
                          <span className="absolute top-1.5 left-1.5 bg-white/90 backdrop-blur-2xs text-[9px] font-black text-slate-700 px-1.5 py-0.5 rounded shadow-2xs">
                            {item.category || 'Add-on'}
                          </span>
                        </div>

                        <div className="flex items-center justify-center gap-1.5 mb-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <h5 className="text-xs font-black text-slate-900 truncate leading-snug">{item.name}</h5>
                        </div>
                        <p className="text-sm font-extrabold text-orange-600">₹{item.price}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Packed fresh in tiffin</p>
                      </div>

                      <div className="flex gap-1.5 mt-3 pt-2.5 border-t border-slate-100">
                        <button
                          disabled={!canPackAnyMeal && isSubscriber}
                          onClick={() => handleAddExtra(item)}
                          className={`flex-1 text-[10px] font-black py-2 rounded-xl transition-colors ${
                            !canPackAnyMeal && isSubscriber
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                              : 'bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-600 cursor-pointer'
                          }`}
                          title={!canPackAnyMeal ? (isMealDelivered ? "Meal Delivered" : isMealOutForDelivery ? "Meal Out for Delivery" : "Unavailable") : isSubscriber ? "Add to cart" : "Subscribers only"}
                        >
                          {!canPackAnyMeal && isSubscriber ? (isMealDelivered ? '🔒 Delivered' : '🚫 Out') : isSubscriber ? '+ Cart' : '🔒 Locked'}
                        </button>
                        <button
                          disabled={!canPackAnyMeal}
                          onClick={() => {
                            if (!canPackAnyMeal) return;
                            setAllExtrasModalOpen(false);
                            handleOpenExtraModal(item);
                          }}
                          className={`flex-1 text-[10px] font-black py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                            !canPackAnyMeal
                              ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-60 hover:scale-100 active:scale-100'
                              : isSubscriber
                              ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-95'
                              : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-95'
                          }`}
                          title={!canPackAnyMeal ? (isMealDelivered ? "Meal Delivered" : isMealOutForDelivery ? "Meal Out for Delivery" : "Unavailable") : isSubscriber ? "Order to deliver inside your scheduled meal" : "Exclusive to active subscribers"}
                        >
                          {!canPackAnyMeal ? (
                            <span>
                              {isMealDelivered ? '🔒 Delivered' : isMealOutForDelivery ? '🚫 Out' : '🔒 Unavailable'}
                            </span>
                          ) : isSubscriber ? (
                            <span>⚡ Pack</span>
                          ) : (
                            <span className="flex items-center gap-1"><Lock size={10} /> Members</span>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Extra items are delivered directly inside your meal box with <strong>₹0 Delivery Fee</strong>.</span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setAllExtrasModalOpen(false);
                    navigate('/cart');
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag size={14} />
                  <span>Go to Cart</span>
                </button>
                <button
                  onClick={() => setAllExtrasModalOpen(false)}
                  className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}