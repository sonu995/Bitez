import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Star,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Plus,
  Tag,
  Sparkles,
  HelpCircle,
  MessageCircle,
  Leaf,
  UtensilsCrossed,
  Bike,
  MapPin,
  Clock,
  CalendarDays,
  ChefHat,
  RotateCcw,
  HeartHandshake,
  Percent,
  Award,
  ThumbsUp,
  Quote,
  Flame,
  X,
  Check,
  Wallet,
  CreditCard,
  AlertCircle,
  Calendar,
  Users,
  Edit,
  Sun,
  Moon,
  Coffee,
  Crown,
  TrendingUp,
  RefreshCw,
  Sliders,
  Shield
} from 'lucide-react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { subscriptionsAPI, plansAPI, menuAPI, ordersAPI, extrasAPI, adminAPI } from '../services/api';
import SkipMealModal from '../components/SkipMealModal';
import OrderExtraModal from '../components/OrderExtraModal';
import MealLoadingScreen from '../components/MealLoadingScreen';

const Subscriptions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isPlansRoute = location.pathname === '/plans' || location.search.includes('view=plans');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'semester'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const getTodayDayName = () => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return dayNames[new Date().getDay()];
  };

  const [activeDay, setActiveDay] = useState(getTodayDayName());
  const [showAllExtras, setShowAllExtras] = useState(false);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const [dbPlans, setDbPlans] = useState<any[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [dynamicWeeklyMenu, setDynamicWeeklyMenu] = useState<Record<string, { breakfast: string; lunch: string; dinner: string }>>({});
  const [dynamicExtras, setDynamicExtras] = useState<any[]>([]);

  // User Mess Subscription & Dashboard State
  const [currentSub, setCurrentSub] = useState<any>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [showPlansView, setShowPlansView] = useState(isPlansRoute);

  useEffect(() => {
    if (isPlansRoute) {
      setShowPlansView(true);
    }
  }, [isPlansRoute]);

  const [skipModalOpen, setSkipModalOpen] = useState(false);
  const [subActionMsg, setSubActionMsg] = useState('');
  const [pauseLoading, setPauseLoading] = useState(false);
  const [todayMenuData, setTodayMenuData] = useState<any>(null);

  // Subscriptions Plans Carousel / Scroll State
  const subPlansScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollSubLeft, setCanScrollSubLeft] = useState(false);
  const [canScrollSubRight, setCanScrollSubRight] = useState(true);
  const [activeSubIndex, setActiveSubIndex] = useState(0);

  const scrollSubPlans = (direction: 'left' | 'right') => {
    if (subPlansScrollRef.current) {
      const scrollAmount = 360;
      subPlansScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleSubPlansScroll = () => {
    if (subPlansScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = subPlansScrollRef.current;
      setCanScrollSubLeft(scrollLeft > 15);
      setCanScrollSubRight(scrollLeft < scrollWidth - clientWidth - 15);
      const cardWidth = 340;
      const index = Math.round(scrollLeft / cardWidth);
      setActiveSubIndex(Math.min(Math.max(index, 0), dbPlans.length - 1));
    }
  };

  const [selectedPlanModal, setSelectedPlanModal] = useState<{
    name: string;
    price: number;
    meals: string;
    planId?: string;
  } | null>(null);
  const { user, refreshUser } = useAuth();
  const { addToCart } = useCart();
  const [subscribing, setSubscribing] = useState(false);
  const [subSuccess, setSubSuccess] = useState<string | null>(null);

  // Extra add-on order states
  const [selectedExtraModal, setSelectedExtraModal] = useState<{
    name: string;
    original: number;
    img: string;
  } | null>(null);
  const [extraOrdering, setExtraOrdering] = useState(false);
  const [extraNotification, setExtraNotification] = useState<{
    msg: string;
    type: 'success' | 'info';
    orderId?: string;
  } | null>(null);
  const [extraPaymentMethod, setExtraPaymentMethod] = useState<'cod' | 'wallet' | 'upi'>('cod');

  // Delivery & preferences form state
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [hostel, setHostel] = useState(user?.hostel || '');
  const [room, setRoom] = useState(user?.room || '');
  const [zoneCode, setZoneCode] = useState('NC-01');
  const [dietPreference, setDietPreference] = useState(user?.dietPreference || 'Standard Homestyle');
  const [paymentMethod, setPaymentMethod] = useState('Bitez Wallet / UPI');
  const [hasExistingSubError, setHasExistingSubError] = useState(false);

  // Sync profile details if logged-in user state updates
  useEffect(() => {
    if (user) {
      if (user.hostel) setHostel(user.hostel);
      if (user.room) setRoom(user.room);
      if (user.dietPreference) setDietPreference(user.dietPreference);
    }
  }, [user]);

  // Fetch current user's active/paused mess subscription
  useEffect(() => {
    if (!user) {
      setCurrentSub(null);
      setSubLoading(false);
      return;
    }

    setSubLoading(true);
    subscriptionsAPI.getMine()
      .then(res => {
        if (res?.subscription && (res.subscription.status === 'active' || res.subscription.status === 'paused')) {
          setCurrentSub(res.subscription);
        } else {
          setCurrentSub(null);
        }
      })
      .catch(() => {
        setCurrentSub(null);
      })
      .finally(() => {
        setSubLoading(false);
      });
  }, [user]);

  // Fetch today's live kitchen menu
  useEffect(() => {
    menuAPI.getToday()
      .then(res => {
        if (res?.menu) setTodayMenuData(res.menu);
      })
      .catch(() => {});
  }, []);

  const handleOpenSkipModal = () => {
    if (!currentSub) return;
    if ((currentSub.remainingMeals || 0) <= 0) {
      alert('You have no remaining meals left in this subscription cycle to skip.');
      return;
    }
    setSkipModalOpen(true);
  };

  const handleSkipSuccess = async (message: string, _credit: number) => {
    setSubActionMsg(message);
    await refreshUser();
    const updated = await subscriptionsAPI.getMine();
    if (updated?.subscription) {
      setCurrentSub(updated.subscription);
    }
    setTimeout(() => setSubActionMsg(''), 6000);
  };

  const handleTogglePause = async () => {
    const subId = currentSub?._id || currentSub?.id;
    if (!subId) return;
    const isPaused = currentSub.status === 'paused';
    const actionText = isPaused ? 'resume' : 'pause';
    if (!window.confirm(`Do you want to ${actionText} your daily tiffin subscription?`)) return;

    setPauseLoading(true);
    try {
      await subscriptionsAPI.pause(subId);
      await refreshUser();
      const updated = await subscriptionsAPI.getMine();
      setCurrentSub(updated?.subscription || null);
      setSubActionMsg(
        isPaused
          ? '🎉 Subscription resumed! Your daily meal packing is active.'
          : '⏸️ Subscription paused! Meal packing is held and your plan validity is saved.'
      );
      setTimeout(() => setSubActionMsg(''), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to update subscription status');
    } finally {
      setPauseLoading(false);
    }
  };

  const handleCancelSub = async () => {
    const subId = currentSub?._id || currentSub?.id;
    if (!subId) return;
    if (!window.confirm('Are you sure you want to cancel your meal subscription?')) return;
    try {
      await subscriptionsAPI.cancel(subId);
      await refreshUser();
      const updated = await subscriptionsAPI.getMine();
      setCurrentSub(updated?.subscription || null);
      setSubActionMsg('Subscription cancelled.');
      setTimeout(() => setSubActionMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel subscription');
    }
  };

  useEffect(() => {
    setPlansLoading(true);
    // 1. Fetch live mess plans from backend
    plansAPI.getAll()
      .then(res => {
        if (res?.plans && res.plans.length > 0) {
          const activePlans = res.plans.filter((p: any) => p.isActive !== false);
          setDbPlans(activePlans.length > 0 ? activePlans : res.plans);
        }
      })
      .catch(() => {})
      .finally(() => setPlansLoading(false));

    // Fetch delivery zones for realtime sync with admin hub
    adminAPI.getZones()
      .then(res => {
        if (res?.zones && res.zones.length > 0) {
          setDeliveryZones(res.zones);
          if (res.zones[0]?.code) setZoneCode(res.zones[0].code);
        }
      })
      .catch(() => {});

    // 2. Fetch live rotating weekly menu from backend
    menuAPI.getAll()
      .then(res => {
        if (res?.menu) {
          setDynamicWeeklyMenu(res.menu);
        }
      })
      .catch(() => {});

    // 3. Fetch live extra items from backend
    extrasAPI.getAll()
      .then(res => {
        if (res?.items && res.items.length > 0) {
          const getFallbackImg = (name: string) => {
            const lower = (name || '').toLowerCase();
            if (lower.includes('jamun') || lower.includes('sweet') || lower.includes('halwa')) {
              return 'https://images.pexels.com/photos/14460596/pexels-photo-14460596.jpeg?auto=compress&cs=tinysrgb&w=300';
            }
            if (lower.includes('paneer') || lower.includes('curry') || lower.includes('sabji')) {
              return 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=300';
            }
            if (lower.includes('roti') || lower.includes('paratha') || lower.includes('phulka')) {
              return 'https://images.pexels.com/photos/10860591/pexels-photo-10860591.jpeg?auto=compress&cs=tinysrgb&w=300';
            }
            if (lower.includes('lassi') || lower.includes('chaas') || lower.includes('dahi') || lower.includes('curd')) {
              return 'https://images.pexels.com/photos/8992928/pexels-photo-8992928.jpeg?auto=compress&cs=tinysrgb&w=300';
            }
            return 'https://images.pexels.com/photos/10860591/pexels-photo-10860591.jpeg?auto=compress&cs=tinysrgb&w=300';
          };

          const mapped = res.items.map((it: any) => ({
            name: it.name,
            original: Number(it.price) || 30,
            img: (it.imageUrl && !it.imageUrl.includes('placeholder')) ? it.imageUrl : (it.image || getFallbackImg(it.name)),
            id: it._id || it.id
          }));
          setDynamicExtras(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Pre-select plan if navigated from Home page with state
  useEffect(() => {
    if (location.state?.selectedPlan && dbPlans.length > 0) {
      const match = dbPlans.find((p: any) =>
        (p.name || '').toLowerCase() === (location.state.selectedPlan || '').toLowerCase() ||
        p._id === location.state.planId ||
        p.id === location.state.planId
      );
      if (match) {
        const base = Number(match.monthlyPrice) || 2499;
        const disc = Number(match.semesterDiscount) || 15;
        const semPrice = Math.round(base * (1 - disc / 100));
        const price = billingCycle === 'semester' ? semPrice : base;
        setSelectedPlanModal({
          name: match.name,
          price,
          meals: match.description || `${match.mealsPerDay || 2} Meals / Day`,
          planId: match._id || match.id
        });
      }
    }
  }, [location.state, dbPlans, billingCycle]);

  const getPlanId = (planName: string) => {
    const found = dbPlans.find(p =>
      (p.name && p.name.toLowerCase() === planName.toLowerCase()) ||
      p.id === planName ||
      p._id === planName
    );
    if (found) return found._id || found.id;
    if (planName.toLowerCase().includes('basic')) return '666611110000000000000001';
    if (planName.toLowerCase().includes('standard')) return '666611110000000000000002';
    if (planName.toLowerCase().includes('premium')) return '666611110000000000000003';
    return dbPlans[0]?._id || dbPlans[0]?.id || '666611110000000000000002';
  };

  const handleInstantSubscribe = async (forceReplace = false) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedPlanModal) return;
    setSubscribing(true);
    setSubSuccess(null);
    setHasExistingSubError(false);

    try {
      const planId = selectedPlanModal.planId || getPlanId(selectedPlanModal.name);

      await subscriptionsAPI.subscribe({
        planId,
        billingCycle,
        hostelAddress: hostel,
        room,
        zoneCode,
        dietPreference,
        paymentMethod,
        forceReplace
      });

      await refreshUser();
      setSubSuccess('🎉 Congratulations! Your mess subscription is now active!');
      setTimeout(() => {
        setSelectedPlanModal(null);
        setSubSuccess(null);
        setHasExistingSubError(false);
        navigate('/dashboard');
      }, 1600);
    } catch (err: any) {
      if (err.hasActiveSubscription || err.message?.includes('already have an active subscription')) {
        setHasExistingSubError(true);
      } else {
        alert(err.message || 'Subscription failed. Please check your details or try again.');
      }
    } finally {
      setSubscribing(false);
    }
  };

  const getPrice = (base: number) => billingCycle === 'semester' ? Math.round(base * 0.85) : base;
  const getDiscounted = (price: number) => Math.round(price * 0.95);

  const handleAddItem = (item: { name: string; original: number; img: string }) => {
    const discounted = getDiscounted(item.original);
    addToCart({
      id: 'extra-' + item.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: item.name,
      price: discounted,
      image: item.img,
      restaurant: 'Bitez Campus Mess',
      isVeg: true
    });
    setAddedItems(prev => ({ ...prev, [item.name]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [item.name]: false }));
    }, 2000);
    setExtraNotification({
      msg: `Added "${item.name}" (₹${discounted}) to your meal order!`,
      type: 'info'
    });
  };

  const handleOpenInstantExtra = (item: any) => {
    if (!user) {
      navigate('/login?redirect=/mess');
      return;
    }
    const discounted = getDiscounted(item.original || item.price || 30);
    setSelectedExtraModal({
      ...item,
      price: discounted,
      image: item.img || item.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=compress&cs=tinysrgb&w=300'
    });
  };

  const handleConfirmInstantExtraOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExtraModal) return;
    setExtraOrdering(true);
    try {
      const discounted = getDiscounted(selectedExtraModal.original);
      const deliveryAddress = user?.deliveryAddress || `${hostel}, Room ${room} (${zoneCode})`;
      const chosenPayment = extraPaymentMethod === 'wallet'
        ? 'Bitez Campus Wallet'
        : extraPaymentMethod === 'upi'
        ? 'Online UPI'
        : 'Cash on Delivery';

      const res = await ordersAPI.create({
        items: [{
          name: selectedExtraModal.name,
          price: discounted,
          quantity: 1,
          image: selectedExtraModal.img,
          isVeg: true
        }],
        totalAmount: discounted,
        deliveryAddress,
        paymentMethod: chosenPayment,
        isExtraOrder: true,
        orderType: 'extra_addon',
        notes: `1-Tap extra add-on ordered for student mess delivery`,
        customerName: user?.name,
        customerPhone: user?.phone
      });

      if (res?.success) {
        const orderId = res.order?.orderId || res.order?._id || 'CONFIRMED';
        setSelectedExtraModal(null);
        setExtraNotification({
          msg: `🎉 Extra Order #${orderId} confirmed! Dispatched with your meal.`,
          type: 'success',
          orderId
        });
        await refreshUser();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to place extra order. Please try again.');
    } finally {
      setExtraOrdering(false);
    }
  };

  const faqs = [
    {
      id: 0,
      icon: '🍱',
      tag: 'Subscription',
      q: 'How does the mess subscription work?',
      a: 'Choose your preferred Basic (1 meal), Standard (2 meals), or Premium (3 meals) plan, complete your online checkout, and fresh home-cooked meals will be delivered daily directly to your doorstep on your chosen time slots.',
      tip: 'Flexible delivery time slots available for breakfast (08:00–09:30 AM), lunch (12:00–1:30 PM) and dinner (7:30–9:00 PM).'
    },
    {
      id: 1,
      icon: '⏭️',
      tag: 'Skip Meal',
      q: 'Can I skip an upcoming meal if I am eating out?',
      a: 'Yes! You can easily skip any meal directly from the app before the daily cutoff time (07:00 AM for Breakfast, 10:30 AM for Lunch, 05:30 PM for Dinner). The credited amount is automatically saved to your wallet.',
      tip: '100% money credited back to your Bitez wallet on skips.'
    },
    {
      id: 2,
      icon: '🥗',
      tag: 'Dietary Options',
      q: 'Are there Jain, Vegan, or High-Protein options available?',
      a: 'Absolutely! Pure vegetarian, Jain (without onion/garlic), and high-protein dietary preferences are prepared separately with strict hygiene standards in dedicated kitchen areas.',
      tip: 'Specify your dietary preferences in your profile settings anytime.'
    },
    {
      id: 3,
      icon: '🔄',
      tag: 'Plan Upgrades',
      q: 'Can I upgrade or downgrade my meal plan midway?',
      a: 'Yes, you can modify or switch between Basic, Standard, and Premium tiers anytime. Any prorated price difference is seamlessly adjusted in your next billing cycle.',
      tip: 'Instant tier transitions with zero disruption to your daily mess meals.'
    },
    {
      id: 4,
      icon: '🎁',
      tag: 'Subscriber Perk',
      q: 'How do subscribers get discounts on instant food orders?',
      a: 'All active subscribers automatically enjoy an exclusive flat 5% to 10% discount on all instant orders, rolls, burgers, and beverages ordered through the app.',
      tip: 'Discounts apply automatically at checkout with no coupon code required.'
    },
  ];

  const [liveWeeklyMenu, setLiveWeeklyMenu] = useState<Record<string, { breakfast: string; lunch: string; dinner: string }>>({});

  useEffect(() => {
    menuAPI.getAll()
      .then(res => {
        if (res?.menu) setLiveWeeklyMenu(res.menu);
      })
      .catch(() => {});
  }, []);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const menu = liveWeeklyMenu[activeDay] || dynamicWeeklyMenu[activeDay] || { breakfast: '', lunch: '', dinner: '' };

  // ── MESS STUDENT DASHBOARD (Shown when student has active/paused subscription) ──
  const renderMessDashboard = () => {
    const remaining = currentSub?.remainingMeals ?? 30;
    const mealsPerDay = currentSub?.planId?.mealsPerDay || 2;
    const totalMeals = currentSub?.totalMeals || (currentSub?.billingCycle === 'semester' ? 180 : mealsPerDay * 30);
    const progressPercent = Math.min(100, Math.max(0, Math.round((remaining / totalMeals) * 100)));
    const planName = currentSub?.planId?.name || 'Standard';
    const isPaused = currentSub?.status === 'paused';
    const hostelAddress = currentSub?.hostelAddress || (user?.hostel ? `${user.hostel}, Room ${user.room || ''}` : 'Tagore Hostel, Room 204');
    const dietStyle = currentSub?.dietPreference || user?.dietPreference || 'Standard Homestyle Veg';

    const startDateStr = currentSub?.startDate
      ? new Date(currentSub.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'Active';
    const endDateStr = currentSub?.endDate
      ? new Date(currentSub.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : '30 Days';

    const daysRemaining = currentSub?.endDate
      ? Math.max(0, Math.ceil((new Date(currentSub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 30;

    // Time calculations for live kitchen shifts in IST
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const ist = new Date(utc + istOffset);
    const currentMins = ist.getHours() * 60 + ist.getMinutes();

    // Breakfast cutoff 07:00 AM (420 mins), Lunch cutoff 10:30 AM (630 mins), Dinner cutoff 5:30 PM (1050 mins)
    const isBreakfastCutoffPassed = currentMins > 420;
    const isLunchCutoffPassed = currentMins > 630;
    const isDinnerCutoffPassed = currentMins > 1050;

    // Active shift detection
    let activeShiftName: 'breakfast' | 'lunch' | 'dinner' = 'lunch';
    if (currentMins < 600) {
      activeShiftName = 'breakfast';
    } else if (currentMins < 930) {
      activeShiftName = 'lunch';
    } else {
      activeShiftName = 'dinner';
    }

    // Dish descriptions for today
    const currentDayMenu = liveWeeklyMenu[activeDay] || dynamicWeeklyMenu[activeDay] || {};
    const lunchDishes = todayMenuData?.lunch || currentDayMenu.lunch || 'Paneer Butter Masala, Dal Tadka, 4 Butter Phulkas, Jeera Rice, Salad, Gulab Jamun';
    const dinnerDishes = todayMenuData?.dinner || currentDayMenu.dinner || 'Seasonal Mix Veg, Dal Makhani, 4 Butter Rotis, Steamed Rice, Boondi Raita';
    const breakfastDishes = todayMenuData?.breakfast || currentDayMenu.breakfast || 'Poha / Aloo Paratha, Fresh Curd, Masala Chai';

    const greetingTime = ist.getHours() < 12 ? 'Good morning' : ist.getHours() < 17 ? 'Good afternoon' : 'Good evening';

    return (
      <div className="min-h-screen bg-[#FAF9F6] pb-24 sm:pb-16">
        {/* Top Sticky Hub Strip — Warm Glassmorphism Matching Bitez Theme */}
        <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-14 sm:top-20 z-30 px-4 py-2.5 shadow-2xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest bg-orange-50 text-orange-600 border border-orange-200/80 px-2.5 py-0.5 rounded-full">
                Mess Dashboard
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                isPaused
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'}`}></span>
                {isPaused ? 'Deliveries Paused' : 'Live Active Dispatch'}
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="text-slate-600 font-semibold hidden sm:inline">📍 {hostelAddress}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowPlansView(true)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-100" /> View All Plans / Upgrade
              </button>
              <button
                onClick={() => navigate('/support')}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold rounded-xl transition cursor-pointer hidden md:flex items-center gap-1.5 shadow-2xs"
              >
                <HelpCircle className="w-3.5 h-3.5 text-orange-600" /> Help
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
          
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full">
                  Student Mess Portal
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-medium text-slate-500">Live Campus Kitchen Feed</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {greetingTime}, {user?.name || 'Student'} 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Here is your live daily tiffin status, meal balance, skip manager, and kitchen schedule.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-2xs flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Campus Wallet</span>
                  <span className="text-sm font-extrabold text-slate-900">₹{user?.walletBalance ?? 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Notification Toast */}
          {subActionMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-bold text-center shadow-xs flex items-center justify-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{subActionMsg}</span>
            </div>
          )}

          {/* If Paused Alert Banner */}
          {isPaused && (
            <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-300 rounded-2xl sm:rounded-3xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
                  ⏸️
                </div>
                <div>
                  <h4 className="text-sm font-black text-amber-950">Subscription Deliveries are PAUSED</h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Your daily meal packing is on hold. No meals will be deducted. When you resume, your end date extends automatically!
                  </p>
                </div>
              </div>
              <button
                onClick={handleTogglePause}
                disabled={pauseLoading}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer shrink-0 disabled:opacity-50"
              >
                {pauseLoading ? 'Resuming...' : '▶️ Resume Meal Deliveries'}
              </button>
            </div>
          )}

          {/* ── 1. DIGITAL STUDENT MESS PASS (CLEAN CULINARY BRAND PASSCARD) ── */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg shadow-slate-900/5 overflow-hidden relative transition-all">
            {/* Top Signature Warm Accent Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600" />

            <div className="p-4 sm:p-7 space-y-4 sm:space-y-6">
              
              {/* Card Top: Pass Label & Status */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white p-2.5 shadow-md shadow-orange-500/20 flex items-center justify-center text-2xl font-black shrink-0">
                    🍱
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full">
                        BITEZ STUDENT MEAL PASS
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-mono font-bold">
                        #{String(currentSub?._id || currentSub?.id || 'PASS').slice(-6).toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                      {user?.name || 'Student Member'}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider uppercase border shadow-2xs ${
                    isPaused
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'}`} />
                    {isPaused ? '⏸️ PAUSED' : '🟢 ACTIVE & PACKING'}
                  </span>
                </div>
              </div>

              {/* Card Middle: Core Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
                
                {/* Remaining Meals with Progress */}
                <div className="bg-orange-50/60 border border-orange-200/70 rounded-2xl p-4 shadow-2xs hover:border-orange-300 transition-all">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-orange-800 mb-1">
                    Meals Remaining
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-orange-600">{remaining}</span>
                    <span className="text-xs font-bold text-slate-500">/ {totalMeals} meals</span>
                  </div>
                  <div className="w-full bg-orange-200/60 h-2.5 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="block text-[11px] text-orange-800 mt-1 font-bold">
                    {progressPercent}% balance left in cycle
                  </span>
                </div>

                {/* Plan Tier & Frequency */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:border-orange-200 transition-all">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Current Plan
                  </span>
                  <span className="text-xl font-black text-slate-900 block truncate">
                    {planName} Plan
                  </span>
                  <span className="text-xs text-orange-600 font-bold block mt-0.5 truncate">
                    {mealsPerDay} Meals / Day ({mealsPerDay === 1 ? 'Lunch or Dinner' : mealsPerDay === 3 ? 'Breakfast + Lunch + Dinner' : 'Lunch + Dinner'})
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium block mt-1">
                    Billed {currentSub?.billingCycle || 'monthly'}
                  </span>
                </div>

                {/* Validity */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:border-orange-200 transition-all">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Plan Validity
                  </span>
                  <span className="text-lg font-black text-slate-900 block">
                    {endDateStr}
                  </span>
                  <span className="text-xs text-amber-900 font-black bg-amber-100 px-2.5 py-0.5 rounded-full inline-block mt-0.5">
                    ⏳ {daysRemaining} days left
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium block mt-1">
                    Started: {startDateStr}
                  </span>
                </div>

                {/* Dietary Preference & Room */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:border-orange-200 transition-all">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Hostel &amp; Diet
                  </span>
                  <span className="text-sm font-black text-slate-900 block truncate">
                    📍 {hostelAddress}
                  </span>
                  <span className="text-xs text-emerald-700 font-bold block mt-0.5 truncate">
                    🥗 {dietStyle}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium block mt-1">
                    Zone: {currentSub?.zoneCode || 'NC-01'}
                  </span>
                </div>
              </div>

              {/* Card Bottom: Fast Actions Strip */}
              <div className="bg-slate-50/70 border-t border-slate-100 px-6 py-4 rounded-b-3xl -mx-6 -mb-6 sm:-mx-7 sm:-mb-7 mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={handleOpenSkipModal}
                    className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span>⏭️ Skip Meal</span>
                    <span className="bg-white/25 text-white text-[10px] px-2 py-0.5 rounded font-black">
                      +1 Meal Rollover
                    </span>
                  </button>

                  <button
                    onClick={handleTogglePause}
                    disabled={pauseLoading}
                    className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-2xs"
                  >
                    {pauseLoading ? 'Updating...' : isPaused ? '▶️ Resume Plan' : '⏸️ Pause Plan'}
                  </button>

                  <button
                    onClick={() => setShowPlansView(true)}
                    className="px-4 py-2.5 bg-white hover:bg-orange-50 text-orange-600 border border-orange-200 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Change Plan</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCancelSub}
                    className="text-xs font-semibold text-slate-400 hover:text-rose-600 underline decoration-slate-300 transition cursor-pointer"
                  >
                    Cancel Subscription
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* ── 2. TODAY'S LIVE MEALS & KITCHEN DISPATCH TRACKER ── */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>🍲</span> Today's Live Meals &amp; Kitchen Dispatch
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time status of breakfast, lunch, and dinner directly from the central mess kitchen.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
                  <Clock className="w-3 h-3" /> Cutoff: 2 hours prior to delivery
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Breakfast Shift */}
              <div className={`bg-white rounded-3xl border p-5 transition-all shadow-2xs relative ${
                activeShiftName === 'breakfast'
                  ? 'border-2 border-orange-500 shadow-md shadow-orange-500/10'
                  : 'border-slate-200/80 hover:border-orange-200'
              }`}>
                {activeShiftName === 'breakfast' && (
                  <span className="absolute -top-2.5 right-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-2xs">
                    Current Shift
                  </span>
                )}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center text-lg shadow-2xs">
                      🌅
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">Morning Breakfast</h4>
                      <span className="text-[11px] text-slate-400 font-medium">07:30 AM – 09:30 AM</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    currentMins >= 570
                      ? 'bg-slate-100 text-slate-600'
                      : mealsPerDay === 3
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-orange-50 text-orange-600 border border-orange-200'
                  }`}>
                    {currentMins >= 570 ? 'Served' : mealsPerDay === 3 ? 'Included' : 'Add-on'}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 mb-3">
                  <span className="block text-[10px] font-bold uppercase text-slate-500 mb-1">On the Menu:</span>
                  <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                    {breakfastDishes}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                  <span className="text-slate-500 font-medium">
                    {currentMins >= 570 ? '✅ Breakfast finished' : '⚡ Served hot in dining hall & doorstep'}
                  </span>
                  {!isBreakfastCutoffPassed && !isPaused && mealsPerDay >= 3 ? (
                    <button
                      onClick={() => setIsSkipModalOpen(true)}
                      className="text-orange-600 font-bold hover:underline cursor-pointer"
                    >
                      Skip Breakfast →
                    </button>
                  ) : mealsPerDay < 3 ? (
                    <button
                      onClick={() => navigate('/menu')}
                      className="text-orange-600 font-bold hover:underline cursor-pointer"
                    >
                      + Order Breakfast
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Lunch Shift */}
              <div className={`bg-white rounded-3xl border p-5 transition-all shadow-2xs relative ${
                activeShiftName === 'lunch'
                  ? 'border-2 border-orange-500 shadow-md shadow-orange-500/10'
                  : 'border-slate-200/80 hover:border-orange-200'
              }`}>
                {activeShiftName === 'lunch' && (
                  <span className="absolute -top-2.5 right-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-2xs">
                    Current Shift
                  </span>
                )}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center text-lg shadow-2xs">
                      ☀️
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">Afternoon Lunch</h4>
                      <span className="text-[11px] text-slate-400 font-medium">12:30 PM – 02:30 PM</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    currentMins >= 900
                      ? 'bg-slate-100 text-slate-600'
                      : currentMins >= 750
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-2xs animate-pulse'
                      : !isLunchCutoffPassed
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {currentMins >= 900
                      ? 'Delivered'
                      : currentMins >= 750
                      ? '🛵 Out for Delivery'
                      : !isLunchCutoffPassed
                      ? 'Skip Open'
                      : 'Packing'}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 mb-3">
                  <span className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Today's Tiffin Box:</span>
                  <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                    {lunchDishes}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                  <span className="text-slate-500 font-medium">
                    Cutoff: <strong className="text-slate-700">10:30 AM</strong>
                  </span>
                  {!isLunchCutoffPassed && !isPaused && (
                    <button
                      onClick={handleOpenSkipModal}
                      className="text-orange-600 font-bold hover:underline cursor-pointer"
                    >
                      Skip Lunch →
                    </button>
                  )}
                </div>
              </div>

              {/* Dinner Shift — Warm Twilight Amber */}
              <div className={`bg-white rounded-3xl border p-5 transition-all shadow-2xs relative ${
                activeShiftName === 'dinner'
                  ? 'border-2 border-orange-500 shadow-md shadow-orange-500/10'
                  : 'border-slate-200/80 hover:border-orange-200'
              }`}>
                {activeShiftName === 'dinner' && (
                  <span className="absolute -top-2.5 right-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-2xs">
                    Current Shift
                  </span>
                )}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center text-lg shadow-2xs">
                      🌙
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">Evening Dinner</h4>
                      <span className="text-[11px] text-slate-400 font-medium">07:30 PM – 09:30 PM</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    currentMins >= 1320
                      ? 'bg-slate-100 text-slate-600'
                      : currentMins >= 1170
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-2xs animate-pulse'
                      : !isDinnerCutoffPassed
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {currentMins >= 1320
                      ? 'Delivered'
                      : currentMins >= 1170
                      ? '🛵 Out for Delivery'
                      : !isDinnerCutoffPassed
                      ? 'Skip Open'
                      : 'Kitchen Prep'}
                  </span>
                </div>

                <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-3.5 mb-3">
                  <span className="block text-[10px] font-bold uppercase text-orange-800 mb-1">Tonight's Tiffin Box:</span>
                  <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                    {dinnerDishes}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                  <span className="text-slate-500 font-medium">
                    Cutoff: <strong className="text-slate-700">05:30 PM</strong>
                  </span>
                  {!isDinnerCutoffPassed && !isPaused && (
                    <button
                      onClick={handleOpenSkipModal}
                      className="text-orange-600 font-bold hover:underline cursor-pointer"
                    >
                      Skip Dinner →
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* ── 3. WEEKLY ROTATING TIMETABLE (7-DAY SCHEDULE) ── */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-500" /> Weekly Mess Menu Timetable
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select any day to preview what's cooking this week and plan your meals or skips.
                </p>
              </div>
              <button
                onClick={() => navigate('/timetable')}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                <span>Full Timetable Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Day Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {days.map((day) => {
                const isSelected = activeDay === day;
                const isToday = getTodayDayName() === day;
                return (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={`px-4 py-2 rounded-2xl font-black text-xs transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200'
                    }`}
                  >
                    <span>{day}</span>
                    {isToday && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                        isSelected ? 'bg-white text-orange-600' : 'bg-orange-500 text-white'
                      }`}>
                        Today
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Day Food Schedule Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-orange-200 transition-all">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900 mb-1.5">
                  <span>🌅</span> Breakfast (07:30 AM)
                </div>
                <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                  {(liveWeeklyMenu[activeDay] || dynamicWeeklyMenu[activeDay])?.breakfast || 'Poha, Boiled Sprouts, Masala Chai'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-orange-200 transition-all">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900 mb-1.5">
                  <span>☀️</span> Lunch (12:30 PM)
                </div>
                <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                  {(liveWeeklyMenu[activeDay] || dynamicWeeklyMenu[activeDay])?.lunch || 'Paneer Butter Masala, Dal Tadka, 4 Butter Phulkas, Jeera Rice, Salad, Gulab Jamun'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-orange-200 transition-all">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900 mb-1.5">
                  <span>🌙</span> Dinner (07:30 PM)
                </div>
                <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                  {(liveWeeklyMenu[activeDay] || dynamicWeeklyMenu[activeDay])?.dinner || 'Seasonal Mix Veg, Dal Makhani, 4 Butter Rotis, Steamed Rice, Boondi Raita'}
                </p>
              </div>
            </div>
          </div>

          {/* ── 4. INSTANT TIFFIN ADD-ONS (EXTRAS) ── */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" /> Extra Treats for Today's Tiffin
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add sweet treats, extra rotis, or beverages packed directly with your scheduled delivery box.
                </p>
              </div>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full self-start sm:self-auto">
                ⭐ 5% Student Discount Applied
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {(dynamicExtras.length > 0 ? dynamicExtras.slice(0, 5) : [
                { name: 'Extra Butter Roti (2 pcs)', original: 20, img: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=compress&cs=tinysrgb&w=300' },
                { name: 'Hot Gulab Jamun (2 pcs)', original: 40, img: 'https://images.pexels.com/photos/14460596/pexels-photo-14460596.jpeg?auto=compress&cs=tinysrgb&w=150' },
                { name: 'Chilled Sweet Lassi', original: 45, img: 'https://images.pexels.com/photos/8992928/pexels-photo-8992928.jpeg?auto=compress&cs=tinysrgb&w=150' },
                { name: 'Curd / Boondi Raita', original: 25, img: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=150' },
                { name: 'Masala Chaas', original: 20, img: 'https://images.pexels.com/photos/8992928/pexels-photo-8992928.jpeg?auto=compress&cs=tinysrgb&w=150' }
              ]).map((item: any, idx: number) => {
                const discounted = getDiscounted(item.original);
                return (
                  <div
                    key={item.id || item.name || idx}
                    className="bg-white border border-slate-200 hover:border-orange-300 rounded-2xl p-3.5 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all group"
                  >
                    <div>
                      <div className="w-full h-24 rounded-xl overflow-hidden mb-2.5 bg-slate-100">
                        <img
                          src={item.img}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/14460596/pexels-photo-14460596.jpeg?auto=compress&cs=tinysrgb&w=300';
                          }}
                        />
                      </div>
                      <h4 className="text-xs font-black text-slate-900 truncate mb-1" title={item.name}>
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 line-through text-[11px]">₹{item.original}</span>
                        <span className="text-xs font-black text-orange-600">₹{discounted}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenInstantExtra(item)}
                      className="mt-3 w-full py-1.5 bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-600 font-black text-[11px] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs active:scale-95 border border-orange-200/80"
                    >
                      <Plus className="w-3 h-3" /> Add to Tiffin
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 5. SKIP HISTORY & ATTENDANCE ── */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>⏭️</span> Skips &amp; Rollover Meal Balance
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Every meal skipped 2 hours prior to delivery automatically preserves your meal credits.
                </p>
              </div>
              <button
                onClick={handleOpenSkipModal}
                className="px-3.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-extrabold text-xs rounded-xl transition cursor-pointer"
              >
                + Skip Another Meal
              </button>
            </div>

            {Array.isArray(currentSub?.skipHistory) && currentSub.skipHistory.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {currentSub.skipHistory.slice(0, 5).map((skip: any, idx: number) => (
                  <div key={skip.id || idx} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 border border-orange-200/60 flex items-center justify-center font-bold text-sm">
                        ⏭️
                      </span>
                      <div>
                        <span className="font-extrabold text-slate-900 capitalize">
                          {skip.mealType || 'Meal'} on {skip.date}
                        </span>
                        <span className="block text-[11px] text-slate-500">
                          Reason: {skip.reason || 'Student preference / Out of campus'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-700 font-black text-xs block">
                        +1 Meal Rollover Credit
                      </span>
                      <span className="text-[10px] text-slate-400">Approved by kitchen</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
                <p className="text-xs font-bold text-slate-700">No skipped meals yet</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Heading home for the weekend or dining out? Skip upcoming meals anytime before the 2-hour cutoff!
                </p>
              </div>
            )}
          </div>

          {/* ── 6. CAMPUS WARDEN & KITCHEN HELPLINE (WARM CULINARY PALETTE) ── */}
          <div className="bg-gradient-to-r from-orange-50 via-amber-50/50 to-orange-50 rounded-3xl p-6 sm:p-7 border border-orange-200/70 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center text-2xl shrink-0 shadow-md shadow-orange-500/20">
                👨‍🍳
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">Need Special Dietary Care or Delivery Support?</h4>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">
                  Our hostel dispatch coordinator is available on campus daily from 07:00 AM to 10:30 PM.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => navigate('/support')}
                className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer active:scale-95"
              >
                File Feedback / Help
              </button>
              <button
                onClick={() => setShowPlansView(true)}
                className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl transition cursor-pointer shadow-2xs"
              >
                Browse All Plans
              </button>
            </div>
          </div>

        </div>

        {/* Skip Meal Modal */}
        <SkipMealModal
          isOpen={skipModalOpen}
          onClose={() => setSkipModalOpen(false)}
          subscription={currentSub}
          userWalletBalance={user?.walletBalance || 0}
          onSuccess={handleSkipSuccess}
        />

      </div>
    );
  };

  // Loading state while fetching user's mess subscription
  if (user && subLoading) {
    return (
      <MealLoadingScreen
        message="Loading Your Mess Dashboard..."
        subMessage="Fetching active meal pass, daily tiffin balance & kitchen schedule"
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">

      {/* ── BANNER WHEN SUBSCRIBER IS BROWSING MESS LANDING PAGE ── */}
      {currentSub && (
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-white px-4 py-3 shadow-lg sticky top-14 sm:top-20 z-40 border-b border-orange-400/40">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Active Student Mess Plan: <strong className="underline decoration-white/40">{currentSub?.planId?.name || 'Standard'} Plan</strong> ({currentSub?.remainingMeals ?? 0} meals remaining)</span>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-1.5 bg-white text-orange-600 hover:bg-orange-50 font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" /> Go to My Mess Dashboard
            </button>
          </div>
        </div>
      )}

      {/* ── ADMIN MANAGEMENT BANNER (Visible when logged in as Admin) ── */}
      {user?.role === 'admin' && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-4 py-2.5 shadow-md sticky top-14 sm:top-20 z-40 border-b border-amber-500/30">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Admin Mess Control:</span>
              <span className="text-slate-300 font-medium hidden sm:inline">Linked to Admin Operations Hub (Port 5000)</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => navigate('/admin', { state: { tab: 'plans' } })}
                className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Edit Meal Plans ({dbPlans.length})
              </button>
              <button
                onClick={() => navigate('/admin', { state: { tab: 'menu' } })}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center gap-1 cursor-pointer"
              >
                <Calendar className="w-3 h-3" /> Edit Timetable
              </button>
              <button
                onClick={() => navigate('/admin', { state: { tab: 'subscribers' } })}
                className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-lg shadow-xs transition flex items-center gap-1 cursor-pointer"
              >
                <Users className="w-3 h-3" /> Subscribers Hub
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                Full Admin Hub →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HERO SECTION - WARM CULINARY PALETTE ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/50 via-amber-50/20 to-white pt-8 sm:pt-12 pb-12 sm:pb-16 text-slate-900 border-b border-orange-100/60">
        {/* Ambient Decorative Glows */}
        <div className="absolute -top-28 -left-28 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 -right-16 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Playful Floating Accent Emojis */}
        <div className="absolute top-10 left-8 text-2xl opacity-60 animate-bounce-gentle select-none pointer-events-none hidden md:block">
          🌿
        </div>
        <div className="absolute top-20 right-[46%] text-xl opacity-40 animate-pulse select-none pointer-events-none hidden lg:block">
          ✨
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-8 lg:gap-10 items-center">
            
            {/* Left Column: Content */}
            <div className="md:col-span-7 pt-2 pb-4 text-left order-2 md:order-1">
              
              {/* Top Pill Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs sm:text-sm font-semibold shadow-2xs mb-5 transition-transform hover:scale-105 select-none">
                <span className="text-base leading-none">🌿</span>
                <span>Healthy • Fresh • Homemade</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12] mb-4">
                Mess &amp; Instant Order
                <br />
                <span className="text-orange-600">
                  All in One
                </span>{' '}
                Place
              </h1>

              {/* Subtitle */}
              <p className="text-slate-600 text-base sm:text-lg max-w-xl font-normal leading-relaxed mb-8">
                Daily mess plans for your healthy routine and fast instant orders for your cravings — from our kitchen to your doorstep.
              </p>

              {/* Two Service Cards Side-by-Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8 max-w-xl">
                
                {/* Card 1: Mess Plans */}
                <a
                  href="#pricing"
                  className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-orange-300 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform">
                      <UtensilsCrossed className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-orange-600 transition-colors">
                        Mess
                      </h3>
                      <p className="text-xs text-slate-500 leading-snug mt-0.5">
                        Healthy meals, daily tiffin, monthly subscription
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all shrink-0" />
                </a>

                {/* Card 2: Instant Order */}
                <button
                  onClick={() => navigate('/menu')}
                  className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-orange-300 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform">
                      <Bike className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-orange-600 transition-colors">
                        Instant Order
                      </h3>
                      <p className="text-xs text-slate-500 leading-snug mt-0.5">
                        Piping hot meals, rolls &amp; snacks in 25 mins
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all shrink-0" />
                </button>
              </div>

              {/* Action Button & Free Delivery Note */}
              <div className="flex flex-wrap items-center gap-5 sm:gap-7 mb-10">
                <a
                  href="#pricing"
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-base shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all duration-300 group"
                >
                  <span>Explore Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>

                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0 shadow-xs">
                    <MapPin className="w-5 h-5 text-orange-600 animate-bounce-gentle" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 leading-tight">
                      Free Delivery Within 2 km
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      (Min. Order ₹149)
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Feature Highlights Row with dividers */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-700">Fresh &amp; Hygienic Food</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-700">Timely Delivery</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-700">Easy Subscription</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-700">Safe &amp; Secure Payments</span>
                </div>
              </div>

            </div>

            {/* Right Column: Visual Composite (Visible on mobile and desktop) */}
            <div className="md:col-span-5 relative flex items-center justify-center md:justify-end mt-2 md:mt-0 order-1 md:order-2 mb-4 md:mb-0">
              {/* Ambient Back Glow */}
              <div className="absolute -inset-4 bg-orange-500/10 rounded-[3rem] blur-2xl -z-10" />

              {/* Main Visual Container */}
              <div className="relative p-2 sm:p-2.5 bg-white rounded-[2.25rem] sm:rounded-[2.75rem] shadow-[0_20px_50px_rgba(234,88,12,0.12)] border border-slate-200 transition-transform duration-500 hover:scale-[1.01] group">
                <div className="relative overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem] bg-slate-100">
                  <img
                    src="/hero-mess-visual.jpg"
                    alt="Mess Plans & Instant Order"
                    className="w-full max-w-[500px] h-auto object-cover select-none drop-shadow-md transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>

                {/* Floating Badge 1: 100% Homestyle Taste */}
                <div className="absolute -top-3 left-4 sm:left-6 bg-white px-3.5 py-1.5 rounded-full shadow-lg shadow-slate-900/10 border border-slate-200 flex items-center gap-2 animate-bounce-gentle">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    100% Homestyle Taste
                  </span>
                </div>

                {/* Floating Badge 2: Express Delivery */}
                <div className="absolute -bottom-3 right-4 sm:right-6 bg-white px-3.5 py-1.5 rounded-full shadow-lg shadow-slate-900/10 border border-slate-200 flex items-center gap-1.5 animate-bounce-gentle" style={{ animationDelay: '1s' }}>
                  <span className="text-sm">⚡</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    25 Min Express
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── WHY CUSTOMERS LOVE US ✨ (PREMIUM REDESIGN) ─────────── */}
      <section className="relative py-20 lg:py-24 bg-slate-50 border-t border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs sm:text-sm font-bold shadow-2xs mb-4">
              <Sparkles className="w-4 h-4 text-orange-500 animate-spin-slow" />
              <span>UNMATCHED QUALITY &amp; PEACE OF MIND</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Why Customers{' '}
              <span className="text-orange-600">
                Love Us ✨
              </span>
            </h2>

            <p className="text-slate-600 text-base sm:text-lg font-normal leading-relaxed">
              Chef-crafted homestyle recipes, absolute skipping freedom, and strict hygiene standards designed for students and working professionals.
            </p>

            {/* Social Proof Mini Bar */}
            <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-4 py-2 px-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex -space-x-2">
                <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=80" alt="Customer" />
                <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=80" alt="Customer" />
                <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=80" alt="Customer" />
                <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=80" alt="Customer" />
              </div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700">
                <div className="flex text-orange-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-orange-500 text-orange-500" />
                  ))}
                </div>
                <span><strong className="text-slate-900">4.9/5</strong> (2,500+ happy subscribers)</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                <span>FSSAI Certified Kitchens</span>
              </div>
            </div>
          </div>

          {/* 4 Feature Bento Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
            
            {/* Card 1: Fresh Daily */}
            <div className="group relative bg-white rounded-3xl p-6 border border-slate-200 hover:border-orange-500 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                    <ChefHat className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200/70 px-2.5 py-1 rounded-full">
                    Zero Preservatives
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">
                  Fresh Daily Tiffin Box
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Cooked fresh 45 mins before delivery with low-oil, pure home spices, and hot insulated packaging.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span>Light, digestible &amp; healthy</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span>Daily rotating 7-day menu</span>
                </div>
              </div>
            </div>

            {/* Card 2: Skip Anytime */}
            <div className="group relative bg-white rounded-3xl p-6 border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                    <RotateCcw className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                    Instant Credit
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">
                  Skip Anytime
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Going out or traveling? Skip any meal with 1 tap before daily cutoff time. Money is saved to your wallet.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span>100% money credited back</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span>Zero cancellation penalties</span>
                </div>
              </div>
            </div>

            {/* Card 3: Diet Friendly */}
            <div className="group relative bg-white rounded-3xl p-6 border border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                    <HeartHandshake className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    Separate Prep
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">
                  Diet-Friendly
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Dedicated cooking areas for Pure Vegetarian, Jain (no onion-garlic), and High-Protein fitness meals.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span>Strict Jain &amp; Veg segregation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span>Customizable spice levels</span>
                </div>
              </div>
            </div>

            {/* Card 4: VIP Subscriber Perks */}
            <div className="group relative bg-white rounded-3xl p-6 border border-slate-200 hover:border-amber-500 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                    <Percent className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                    VIP Savings
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">
                  5% Extra Discount
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Active subscribers automatically save flat 5% to 10% on rolls, burgers, and beverages from the food menu.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span>Instant checkout discount</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span>Priority express delivery</span>
                </div>
              </div>
            </div>

          </div>

          {/* Trust Metrics Strip - Vibrant Orange Brand Theme */}
          <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-orange-500/20 border border-orange-400/30 mb-14">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-white/20">
              <div className="pt-2 md:pt-0">
                <div className="text-3xl sm:text-4xl font-extrabold text-white mb-1">50,000+</div>
                <div className="text-xs sm:text-sm text-orange-100 font-medium">Tiffins Delivered</div>
              </div>
              <div className="pt-4 md:pt-0">
                <div className="text-3xl sm:text-4xl font-extrabold text-white mb-1">98.8%</div>
                <div className="text-xs sm:text-sm text-orange-100 font-medium">On-Time Delivery Rate</div>
              </div>
              <div className="pt-4 md:pt-0">
                <div className="text-3xl sm:text-4xl font-extrabold text-white mb-1">100%</div>
                <div className="text-xs sm:text-sm text-orange-100 font-medium">Skipped Meal Refunds</div>
              </div>
              <div className="pt-4 md:pt-0">
                <div className="text-3xl sm:text-4xl font-extrabold text-white mb-1">4.9 ★</div>
                <div className="text-xs sm:text-sm text-orange-100 font-medium">From 2,500+ Reviews</div>
              </div>
            </div>
          </div>

          {/* Verified Customer Quotes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Review 1 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
              <Quote className="w-8 h-8 text-orange-200 absolute top-5 right-5" />
              <div className="flex items-center gap-1 text-orange-500 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                ))}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed italic mb-5">
                "The food genuinely tastes just like wholesome home-cooked meals! The best feature is skipping a meal with 1 tap — whenever I eat out on weekends, the refund is instantly credited back to my wallet."
              </p>
              <div className="flex items-center gap-3">
                <img className="w-10 h-10 rounded-full object-cover border border-slate-200" src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100" alt="Pooja S." />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Pooja Sharma</h4>
                  <p className="text-slate-500 text-xs">BIT Mesra Hostel • Standard Plan</p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
              <Quote className="w-8 h-8 text-orange-200 absolute top-5 right-5" />
              <div className="flex items-center gap-1 text-orange-500 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                ))}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed italic mb-5">
                "Hygiene and packaging are unmatched. The stainless steel tiffin container keeps dal and rotis piping hot, and delivery is always on time. Perfect for working professionals!"
              </p>
              <div className="flex items-center gap-3">
                <img className="w-10 h-10 rounded-full object-cover border border-slate-200" src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100" alt="Rahul V." />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Rahul Verma</h4>
                  <p className="text-slate-500 text-xs">Software Engineer • Premium Plan</p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
              <Quote className="w-8 h-8 text-orange-200 absolute top-5 right-5" />
              <div className="flex items-center gap-1 text-orange-500 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                ))}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed italic mb-5">
                "The Jain meal option is a lifesaver. Pure vegetarian, strictly without onion or garlic, yet full of authentic flavour and very light on digestion."
              </p>
              <div className="flex items-center gap-3">
                <img className="w-10 h-10 rounded-full object-cover border border-slate-200" src="https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=100" alt="Aditi D." />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Aditi Deshmukh</h4>
                  <p className="text-slate-500 text-xs">Medical Intern • Basic Veg Plan</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── 1. WEEKLY MENU PREVIEW ───────────────────────────── */}
      <section id="menu" className="py-20 lg:py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-bold uppercase tracking-wider mb-3.5">
              <span>🍳 FRESH ROTATING DAILY MENU</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
              Weekly Menu <span className="text-orange-600">Preview 🍱</span>
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Check out what’s cooking before you subscribe. Prepared fresh twice daily with pure homestyle love.
            </p>
          </div>

          {/* Day Selector Tabs */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto max-w-full scrollbar-hide gap-1.5">
              {days.map(day => {
                const isActive = activeDay === day;
                return (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={`px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 scale-105'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    {day}
                    {day === 'Sun' && <span className="ml-1.5">🎉</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3 Meal Cards (Breakfast, Lunch, Dinner) */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                label: 'Breakfast',
                time: '8:00 AM – 10:00 AM',
                emoji: '☀️',
                tag: 'Morning Fuel',
                diet: 'Pure Veg',
                nutrition: '~420 kcal • 14g Protein',
                border: 'border-slate-200',
                badge: 'bg-orange-50 text-orange-600 border border-orange-100',
                value: menu.breakfast,
                img: activeDay === 'Sun' ? 'https://images.pexels.com/photos/103124/pexels-photo-103124.jpeg?auto=compress&cs=tinysrgb&w=600'
                  : activeDay === 'Sat' ? 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600'
                  : 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=600',
              },
              {
                label: 'Lunch',
                time: '12:30 PM – 2:30 PM',
                emoji: '🌤️',
                tag: 'Wholesome Thali',
                diet: 'Pure Veg / Chef Choice',
                nutrition: '~650 kcal • 24g Protein',
                border: 'border-slate-200',
                badge: 'bg-orange-50 text-orange-600 border border-orange-100',
                value: menu.lunch,
                img: activeDay === 'Wed' || activeDay === 'Thu'
                  ? 'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=600'
                  : 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=600',
              },
              {
                label: 'Dinner',
                time: '7:30 PM – 9:30 PM',
                emoji: '🌙',
                tag: 'Warm Comfort',
                diet: 'Balanced & Light',
                nutrition: '~580 kcal • 26g Protein',
                border: 'border-slate-200',
                badge: 'bg-orange-50 text-orange-600 border border-orange-100',
                value: menu.dinner,
                img: activeDay === 'Wed'
                  ? 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=600'
                  : 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=600',
              },
            ].map((meal, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-slate-200 hover:border-orange-500 overflow-hidden hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between group"
              >
                <div>
                  {/* Food Image with time pill */}
                  <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100">
                    <img
                      src={meal.img}
                      alt={meal.label}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    <span className="absolute top-3 right-3 bg-white text-slate-900 text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                      {meal.diet}
                    </span>

                    <span className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md text-slate-800 text-xs font-bold px-3 py-1 rounded-full border border-orange-200/80 shadow-xs">
                      ⏱️ {meal.time}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
                        {meal.tag}
                      </span>
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {meal.nutrition}
                      </span>
                    </div>

                    <h3 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2 mb-3">
                      <span>{meal.emoji}</span> {meal.label}
                    </h3>
                    <p className="text-slate-700 font-medium leading-relaxed text-sm">
                      {meal.value}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 text-slate-800 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" /> Insulated Tiffin Box
                  </span>
                  <span>100% Home Taste</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-slate-400 text-xs sm:text-sm mt-8 font-medium">
            * Daily menus are curated each week by experienced home chefs. Special Sunday festive thalis included with standard &amp; premium plans!
          </p>
        </div>
      </section>

      {/* ── 2. HOW IT WORKS ─── */}
      <section className="py-20 lg:py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-bold uppercase tracking-wider mb-3.5">
              <span>🚀 SEAMLESS 3-STEP EXPERIENCE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
              How It <span className="text-orange-600">Works 🚀</span>
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Start your subscription in 2 minutes and take full control of your daily meals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center relative">
            {[
              {
                step: '01',
                icon: '🍱',
                title: 'Choose Your Plan',
                desc: 'Pick Basic (1 meal), Standard (2 meals), or Premium (3 meals) based on your hostel or work routine.',
                badge: 'Flexible Durations',
              },
              {
                step: '02',
                icon: '🔄',
                title: 'Customize or Skip',
                desc: 'Inspect tomorrow’s menu in advance. Skip any meal with 1 tap before daily cutoff and get 100% wallet refund.',
                badge: 'Zero Food Waste',
              },
              {
                step: '03',
                icon: '🛵',
                title: 'Enjoy Fresh Food',
                desc: 'Piping hot, delicious home food arrives right at your room or PG doorstep on scheduled delivery slots.',
                badge: 'On-Time Always',
              },
            ].map((s, i) => (
              <div
                key={i}
                className="relative z-10 bg-white p-8 rounded-3xl border border-slate-200 hover:border-orange-500 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-4xl">{s.icon}</span>
                    <span className="text-xs font-extrabold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                      STEP {s.step}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold mb-3 text-slate-900 group-hover:text-orange-600 transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm mb-6">
                    {s.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 text-xs font-bold text-orange-600">
                  {s.badge}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 3. CHOOSE YOUR MESS PLAN (UPGRADED PRICING) ─────────── */}
      <section id="pricing" className="py-20 lg:py-24 bg-white scroll-mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-bold uppercase tracking-wider mb-3.5">
              <span>💳 TRANSPARENT PRICING • NO HIDDEN FEES</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
              Choose Your <span className="text-orange-600">Mess Plan 🍱</span>
            </h2>
            <p className="text-slate-600 text-base sm:text-lg mb-8">
              Flexible meal passes for students &amp; working professionals. Pause, upgrade, or skip anytime.
            </p>

            {/* Monthly vs Semester Switcher & Carousel Arrows */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-2">
              <div className="inline-flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-xs">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-7 py-3 rounded-xl font-bold text-sm transition-all duration-300 cursor-pointer ${
                    billingCycle === 'monthly'
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Monthly Plan
                </button>
                <button
                  onClick={() => setBillingCycle('semester')}
                  className={`px-7 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                    billingCycle === 'semester'
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Semester Pass</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-extrabold uppercase tracking-wider">
                    Save 15%
                  </span>
                </button>
              </div>

              {/* Scroll Arrow Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollSubPlans('left')}
                  disabled={!canScrollSubLeft}
                  aria-label="Scroll plans left"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-200 cursor-pointer ${
                    canScrollSubLeft
                      ? 'bg-white border-slate-300 text-slate-800 shadow-xs hover:bg-orange-500 hover:text-white hover:border-orange-500'
                      : 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollSubPlans('right')}
                  disabled={!canScrollSubRight}
                  aria-label="Scroll plans right"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-200 cursor-pointer ${
                    canScrollSubRight
                      ? 'bg-white border-slate-300 text-slate-800 shadow-xs hover:bg-orange-500 hover:text-white hover:border-orange-500'
                      : 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile Swipe Hint */}
            <p className="text-xs text-slate-400 font-semibold sm:hidden mt-3">
              👈 Swipe left/right to view all meal passes 👉
            </p>
          </div>

          {/* Pricing Cards Horizontal Scroll Carousel (Fetched live from Backend Database) */}
          {plansLoading && dbPlans.length === 0 ? (
            <div className="flex gap-6 overflow-x-auto pb-8 pt-4 px-2 max-w-7xl mx-auto scrollbar-hide">
              {[1, 2, 3].map(sk => (
                <div key={sk} className="w-[310px] shrink-0 bg-white border border-slate-200 rounded-3xl p-8 animate-pulse space-y-4">
                  <div className="h-6 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-10 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-32 bg-slate-100 rounded"></div>
                  <div className="h-12 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div
              ref={subPlansScrollRef}
              onScroll={handleSubPlansScroll}
              className="flex gap-6 items-stretch overflow-x-auto pb-8 pt-5 px-2 max-w-7xl mx-auto mb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {dbPlans.map((plan, i) => {
                const basePrice = Number(plan.monthlyPrice) || 2499;
                const discountPct = Number(plan.semesterDiscount) || 15;
                const semesterMonthly = Math.round(basePrice * (1 - discountPct / 100));
                const currentPrice = billingCycle === 'semester' ? semesterMonthly : basePrice;
                const savings = basePrice - semesterMonthly;
                const isPopular = Boolean(plan.isPopular);
                const mealsPerDay = plan.mealsPerDay || 2;
                const perMeal = Math.max(5, Math.round(currentPrice / (mealsPerDay * 30)));

                const features = Array.isArray(plan.features)
                  ? plan.features
                  : typeof plan.features === 'string'
                  ? plan.features.split('\n').filter(Boolean)
                  : ['Full rotating homestyle menu access', 'Hot insulated tiffin packaging', 'Skip meal wallet credit protection'];

                const planId = plan._id || plan.id;
                const lowerName = (plan.name || '').toLowerCase();
                const isTrial = lowerName.includes('trial');
                const isPremium = lowerName.includes('premium');

                return (
                  <div
                    key={planId || i}
                    className={`w-[295px] sm:w-[325px] lg:w-[340px] shrink-0 snap-start relative rounded-3xl p-7 transition-all duration-300 flex flex-col justify-between hover:-translate-y-2 ${
                      isPopular
                        ? 'bg-gradient-to-b from-orange-50/50 via-white to-white ring-2 ring-orange-500 shadow-2xl shadow-orange-500/15 border-orange-300 z-10'
                        : isTrial
                        ? 'bg-gradient-to-b from-emerald-50/40 via-white to-white border border-emerald-300 hover:border-emerald-500 shadow-md hover:shadow-xl'
                        : isPremium
                        ? 'bg-gradient-to-b from-purple-50/40 via-white to-white border border-purple-200 hover:border-purple-500 shadow-md hover:shadow-xl'
                        : 'bg-white border border-slate-200 hover:border-orange-500 shadow-sm hover:shadow-xl'
                    }`}
                  >
                    {/* Top Badge */}
                    <div className="absolute -top-3.5 left-6">
                      {isPopular ? (
                        <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 fill-white text-white" /> Most Popular
                        </span>
                      ) : isTrial ? (
                        <span className="bg-emerald-600 text-white px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> 1-Day Trial Pass
                        </span>
                      ) : isPremium ? (
                        <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                          👑 VIP Feast Pass
                        </span>
                      ) : (
                        <span className="bg-blue-600 text-white px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                          🌱 Budget Friendly
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-start justify-between mt-2 mb-2">
                        <div>
                          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                            {plan.name}
                          </h3>
                          <p className="text-orange-600 font-bold text-xs mt-0.5">
                            {plan.mealsPerDay ? `${plan.mealsPerDay} Meal${plan.mealsPerDay > 1 ? 's' : ''} / Day` : 'Wholesome Student Meal'}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-lg">
                          {isPopular ? '🍱' : isTrial ? '✨' : isPremium ? '👑' : '🥗'}
                        </div>
                      </div>

                      {/* Pricing Block */}
                      <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-100 my-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className={`text-3xl sm:text-4xl font-black tracking-tight ${isPopular ? 'text-orange-600' : 'text-slate-900'}`}>
                            ₹{currentPrice}
                          </span>
                          <span className="text-xs font-bold text-slate-400">/mo</span>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60">
                          <span className="text-[11px] font-semibold text-slate-500">Effective Cost:</span>
                          <span className="text-xs font-black text-orange-600 bg-orange-100/70 px-2 py-0.5 rounded-md">
                            ~₹{perMeal} / meal
                          </span>
                        </div>

                        {billingCycle === 'semester' && savings > 0 && (
                          <div className="mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            <span>Save ₹{savings}/mo ({discountPct}% OFF applied)</span>
                          </div>
                        )}
                      </div>

                      {/* Features List */}
                      <div className="mb-6">
                        <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2.5">
                          Plan Highlights:
                        </p>
                        <ul className="space-y-2.5">
                          {features.map((f: string, j: number) => (
                            <li key={j} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 leading-snug">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedPlanModal({
                        name: plan.name,
                        price: currentPrice,
                        meals: plan.description || `${plan.mealsPerDay || 2} Meals / Day`,
                        planId
                      })}
                      className={`w-full py-3.5 rounded-2xl font-bold transition-all cursor-pointer shadow-xs hover:shadow-md ${
                        isPopular
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-xl shadow-orange-500/25 py-4 hover:scale-105 active:scale-95'
                          : 'bg-orange-50 hover:bg-orange-500 text-orange-700 hover:text-white border-2 border-orange-200 hover:border-orange-500'
                      }`}
                    >
                      {isPopular ? `Subscribe ${plan.name} Plan 🔥` : `Get ${plan.name} Plan`}
                    </button>

                    {user?.role === 'admin' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/admin', { state: { tab: 'plans' } });
                        }}
                        className="mt-2.5 w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer"
                        title="Edit this plan in Admin Panel"
                      >
                        <Edit className="w-3.5 h-3.5 text-orange-500" />
                        <span>Edit in Admin Hub</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Dots Indicator for Subscriptions Plans */}
          {dbPlans.length > 1 && (
            <div className="flex justify-center items-center gap-2 mb-10">
              {dbPlans.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={() => {
                    if (subPlansScrollRef.current) {
                      subPlansScrollRef.current.scrollTo({
                        left: dotIdx * 350,
                        behavior: 'smooth'
                      });
                    }
                  }}
                  aria-label={`Go to plan ${dotIdx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    activeSubIndex === dotIdx
                      ? 'w-7 bg-orange-500'
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
          )}

          {/* 3-Day Tasting Guarantee Banner */}
          <div className="max-w-2xl mx-auto text-center p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 shadow-2xs">
            <ShieldCheck className="w-5 h-5 text-orange-600 shrink-0" />
            <span><strong>3-Day Tasting Guarantee:</strong> If you don't love the food in your first 3 days, get a 100% refund on unconsumed meals!</span>
          </div>

        </div>
      </section>

      {/* ── 4. CRAVING SOMETHING EXTRA? (5% SUBSCRIBER DISCOUNT) ── */}
      <section className="py-20 lg:py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2.5 bg-orange-500 text-white px-5 py-2 rounded-2xl shadow-md shadow-orange-500/20 mb-6">
              <span className="text-lg">🎉</span>
              <span className="font-extrabold text-xs uppercase tracking-wider">Subscriber Perk: Flat 5% OFF on Instant Orders</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
              Craving Something <span className="text-orange-600">Extra? 🤤</span>
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Add extra rotis, fresh paneer, sweet desserts, or refreshing shakes to your daily tiffin with 1 tap.
            </p>
          </div>

          {(() => {
            const allExtrasList = dynamicExtras;
            const initialExtrasList = allExtrasList.slice(0, 6);
            const displayedExtras = showAllExtras ? allExtrasList : initialExtrasList;
            const remainingCount = Math.max(0, allExtrasList.length - initialExtrasList.length);

            return (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
                  {displayedExtras.map((item, i) => {
                    const discounted = getDiscounted(item.original);
                    const isAdded = !!addedItems[item.name];

                    return (
                      <div
                        key={i}
                        className="bg-white p-4 rounded-3xl border border-slate-200 hover:border-orange-500 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all text-center group relative overflow-hidden flex flex-col justify-between"
                      >
                        <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-xl z-10">
                          -5%
                        </div>

                        <div>
                          <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-3 shadow-sm border-2 border-white group-hover:scale-105 transition-transform bg-slate-100">
                            <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm leading-tight mb-2">
                            {item.name}
                          </h4>
                          <div className="flex items-center justify-center gap-2 mb-3">
                            <span className="text-slate-400 text-xs line-through">₹{item.original}</span>
                            <span className="bg-orange-50 text-orange-600 text-xs font-extrabold px-2 py-0.5 rounded-lg border border-orange-100">
                              ₹{discounted}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5 w-full mt-1">
                          <button
                            onClick={() => handleAddItem(item)}
                            className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                              isAdded
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200/60'
                            }`}
                            title="Add to food cart"
                          >
                            {isAdded ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" /> Added!
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" /> Add to Cart
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleOpenInstantExtra(item)}
                            className="w-full py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
                            title="Direct 1-Tap order with your next tiffin"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> ⚡ 1-Tap Order
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Extra Addon Notification Banner */}
                {extraNotification && (
                  <div className={`mt-6 p-4 rounded-2xl flex items-center justify-between gap-4 max-w-xl mx-auto shadow-md animate-fade-in ${
                    extraNotification.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                      : 'bg-orange-50 border border-orange-200 text-orange-900'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className={`w-5 h-5 shrink-0 ${extraNotification.type === 'success' ? 'text-emerald-600' : 'text-orange-600'}`} />
                      <span className="text-xs font-bold">{extraNotification.msg}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {extraNotification.orderId ? (
                        <button
                          onClick={() => navigate(`/track/${extraNotification.orderId}`)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer whitespace-nowrap shadow-2xs"
                        >
                          Track Order →
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate('/cart')}
                          className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg cursor-pointer whitespace-nowrap shadow-2xs"
                        >
                          View Cart 🛒
                        </button>
                      )}
                      <button
                        onClick={() => setExtraNotification(null)}
                        className="p-1 hover:bg-black/5 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* See More Toggle */}
                {remainingCount > 0 && (
                  <div className="text-center mt-10">
                    <button
                      onClick={() => setShowAllExtras(!showAllExtras)}
                      className="inline-flex items-center gap-2 px-8 py-3.5 bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 font-bold rounded-2xl shadow-xs transition-all cursor-pointer"
                    >
                      {showAllExtras ? (
                        <>
                          <ChevronUp className="w-4 h-4" /> Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" /> View All Extra Items ({remainingCount} more)
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            );
          })()}

        </div>
      </section>

      {/* ── 5. WE DELIVER ACROSS CAMPUSES & HOSTELS ─────────────── */}
      <section className="py-20 lg:py-24 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-bold uppercase tracking-wider mb-4">
            <MapPin className="w-3.5 h-3.5 text-orange-600" />
            <span>ACTIVE DELIVERY COVERAGE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Serving Campuses &amp; <span className="text-orange-600">Hostels 📍</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mb-10 max-w-xl mx-auto">
            Daily meal runs are active across major educational institutes, student hostels, and working PG hubs.
          </p>

          <div className="bg-slate-50 rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm">
            
            {/* Live Status Indicator */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-bold mb-8 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span>Daily Delivery Active: Breakfast (08:00–09:30 AM) • Lunch (12:00–1:30 PM) • Dinner (7:30–9:00 PM)</span>
            </div>

            {/* Active Delivery Clusters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {[
                'BIT Mesra Hostels',
                'Sector 4 Student Hub',
                'City Centre PGs',
                'Sector 6 & Chas',
                'Medical & Nursing PGs',
                'Engineering Hostels',
              ].map((loc, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-2xs"
                >
                  <span className="text-orange-600 font-bold">✓</span> {loc}
                </div>
              ))}
            </div>

            <p className="text-xs sm:text-sm text-slate-500">
              Living in another hostel or private room?{' '}
              <a
                href="https://wa.me/919876543210?text=Hi%20Bitez%2C%20can%20you%20deliver%20to%20my%20hostel%3F"
                target="_blank"
                rel="noreferrer"
                className="text-orange-600 font-bold hover:underline"
              >
                Chat on WhatsApp to check your address →
              </a>
            </p>
          </div>

        </div>
      </section>

      {/* ── 6. FREQUENTLY ASKED QUESTIONS ──────────────────────── */}
      <section className="py-20 lg:py-24 bg-slate-50 border-t border-slate-200 relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-bold uppercase tracking-wider mb-3.5">
              <HelpCircle className="w-3.5 h-3.5 text-orange-600" />
              <span>GOT QUESTIONS? WE HAVE ANSWERS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
              Frequently Asked <span className="text-orange-600">Questions</span> ❓
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Everything you need to know about mess subscriptions, daily skips, pausing meals, and payment flexibility.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className={`rounded-2xl sm:rounded-3xl transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? 'bg-white border-2 border-orange-500 shadow-xl shadow-orange-500/5 ring-4 ring-orange-50'
                      : 'bg-white hover:bg-white border border-slate-200 hover:border-orange-300 shadow-2xs hover:shadow-md'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full px-5 sm:px-6 py-4.5 sm:py-5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 sm:gap-4 flex-1">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-2xs ${
                        isOpen ? 'bg-orange-50 border border-orange-200 text-orange-600' : 'bg-slate-100 border border-slate-200 text-slate-700'
                      }`}>
                        {faq.icon}
                      </div>
                      <div>
                        <div className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          {faq.tag}
                        </div>
                        <h3 className={`text-sm sm:text-base font-bold transition-colors leading-snug ${
                          isOpen ? 'text-slate-900 font-extrabold' : 'text-slate-800 group-hover:text-orange-600'
                        }`}>
                          {faq.q}
                        </h3>
                      </div>
                    </div>

                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                      isOpen
                        ? 'bg-orange-500 text-white rotate-180 shadow-sm'
                        : 'bg-slate-100 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-600'
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-1 animate-fade-in border-t border-slate-100">
                      <p className="text-slate-600 text-sm sm:text-[15px] leading-relaxed mb-3.5 pl-[52px] sm:pl-[56px]">
                        {faq.a}
                      </p>
                      {faq.tip && (
                        <div className="ml-[52px] sm:ml-[56px] p-3 rounded-xl bg-orange-50 border border-orange-200 flex items-start gap-2.5 text-xs text-orange-950 font-medium">
                          <Sparkles className="w-3.5 h-3.5 text-orange-600 flex-shrink-0 mt-0.5" />
                          <span>{faq.tip}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Help WhatsApp Box */}
          <div className="mt-10 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Have more questions about hostel delivery?</h4>
                <p className="text-xs text-slate-500">Our mess coordinator replies on WhatsApp within 5 minutes.</p>
              </div>
            </div>
            <a
              href="https://wa.me/919876543210?text=Hello%2C%20I%20have%20a%20question%20about%20Bitez%20mess%20plans"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors shrink-0"
            >
              <MessageCircle className="w-4 h-4 text-emerald-200" /> Chat on WhatsApp
            </a>
          </div>

        </div>
      </section>

      {/* ── 7. APP DOWNLOAD BANNER - Sunset Orange Brand Theme ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-orange-600 via-orange-500 to-amber-600 rounded-3xl p-10 md:p-16 overflow-hidden relative shadow-2xl shadow-orange-500/25 border border-orange-400/30 text-white">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-white text-sm font-bold mb-6 border border-white/30 backdrop-blur-md">
                  📱 Available on iOS &amp; Android
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
                  Manage Everything<br />From the App
                </h2>
                <p className="text-orange-100 text-lg mb-8 leading-relaxed">
                  Skip meals with 1 tap, inspect daily rotating menus, order extra sides, track delivery live, and check your wallet balance.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button className="flex items-center justify-center gap-3 bg-white hover:bg-orange-50 text-orange-600 px-6 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-orange-700/20 cursor-pointer">
                    <span className="text-2xl">🍎</span>
                    <div className="text-left">
                      <p className="text-[10px] font-medium text-orange-400 leading-none">Download on the</p>
                      <p className="text-base font-extrabold leading-none mt-0.5">App Store</p>
                    </div>
                  </button>
                  <button className="flex items-center justify-center gap-3 bg-white/20 hover:bg-white/30 text-white px-6 py-4 rounded-2xl font-bold transition-all border border-white/30 cursor-pointer backdrop-blur-md">
                    <span className="text-2xl">▶️</span>
                    <div className="text-left">
                      <p className="text-[10px] font-medium text-orange-100 leading-none">Get it on</p>
                      <p className="text-base font-extrabold leading-none mt-0.5">Google Play</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-4 w-full max-w-sm">
                {[
                  { icon: '⏭️', label: 'Skip Meals Instantly' },
                  { icon: '📅', label: 'View Weekly Menu' },
                  { icon: '💳', label: 'Wallet & Credits' },
                  { icon: '🚴', label: 'Live Delivery Track' },
                  { icon: '➕', label: 'Order Extras (-5%)' },
                  { icon: '🔔', label: 'Meal Reminders' },
                ].map((f, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-3 border border-white/10">
                    <span className="text-2xl">{f.icon}</span>
                    <span className="text-white font-semibold text-sm">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. SELECTED PLAN CONFIRMATION MODAL ─────────────────── */}
      {selectedPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 relative my-8">
            <button
              onClick={() => {
                setSelectedPlanModal(null);
                setHasExistingSubError(false);
              }}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Plan Header */}
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-2 text-2xl shadow-inner">
                🍱
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900">
                {selectedPlanModal.name}
              </h3>
              <p className="text-xs font-semibold text-orange-600 mt-0.5">
                {selectedPlanModal.meals}
              </p>
            </div>

            {/* Price & Billing Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-5 space-y-2 text-sm">
              <div className="flex justify-between items-center text-slate-600">
                <span>Billing Frequency:</span>
                <span className="font-bold text-slate-900 uppercase text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800">
                  {billingCycle === 'semester' ? 'Semester Pass (15% OFF)' : 'Monthly Plan'}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Effective Total:</span>
                <span className="font-extrabold text-slate-900 text-lg text-orange-600">
                  ₹{billingCycle === 'semester' ? Math.round(selectedPlanModal.price * 6) : selectedPlanModal.price}
                  <span className="text-xs font-normal text-slate-500 ml-1">
                    {billingCycle === 'semester' ? '/ 6 months' : '/ month'}
                  </span>
                </span>
              </div>
              <div className="flex justify-between text-slate-800 font-semibold text-xs pt-2 border-t border-slate-200">
                <span>Tasting Guarantee:</span>
                <span className="text-emerald-700 flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" /> 3-Day Tasting Refund Protection
                </span>
              </div>
            </div>

            {/* Delivery Preferences Form */}
            <div className="space-y-4 mb-5 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" /> Hostel / Hall of Residence
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {['Tagore Hostel', 'Ramanujan Hostel', 'Kasturba Girls', 'Mukherjee PG'].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHostel(h)}
                      className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all border text-left cursor-pointer ${
                        hostel === h
                          ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={hostel}
                  onChange={(e) => setHostel(e.target.value)}
                  placeholder="Or enter custom hostel / building"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Room / Flat No.
                  </label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="e.g. 204"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Campus Zone
                  </label>
                  <select
                    value={zoneCode}
                    onChange={(e) => setZoneCode(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 bg-white font-medium"
                  >
                    {deliveryZones.length > 0 ? (
                      deliveryZones.map((z: any) => (
                        <option key={z.id || z.code} value={z.code}>
                          {z.code} ({z.name})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="NC-01">NC-01 (North Campus)</option>
                        <option value="SC-02">SC-02 (South Campus)</option>
                        <option value="MN-03">MN-03 (Mukherjee Nagar)</option>
                        <option value="GT-04">GT-04 (GTB Nagar)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-orange-500" /> Dietary Preference
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'Standard Homestyle', label: '🥦 Homestyle Veg' },
                    { key: 'Pure Vegetarian', label: '🌱 Pure Vegetarian' },
                    { key: 'Jain Food', label: '🥗 Jain (No Garlic)' },
                    { key: 'High Protein', label: '💪 High Protein' }
                  ].map((d) => (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => setDietPreference(d.key)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border text-left cursor-pointer ${
                        dietPreference === d.key
                          ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-orange-500" /> Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'Bitez Wallet', label: `Wallet (₹${user?.walletBalance ?? 0})` },
                    { key: 'UPI / Online QR', label: 'UPI / Online' },
                    { key: 'Cash on 1st Delivery', label: 'Pay on Delivery' }
                  ].map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setPaymentMethod(p.key)}
                      className={`py-1.5 px-1.5 rounded-xl text-[11px] font-bold transition-all border text-center cursor-pointer truncate ${
                        paymentMethod === p.key
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Subscription Conflict Warning & Upgrade Option */}
            {(hasExistingSubError || user?.activeSubscription) && (
              <div className="p-3.5 mb-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-left">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold mb-0.5">Active Mess Subscription Detected</p>
                    <p className="text-amber-800 leading-snug">
                      You already have an active subscription! Subscribing will switch and upgrade your daily deliveries to this plan.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {subSuccess && (
              <div className="p-3.5 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold text-center">
                {subSuccess}
              </div>
            )}

            <div className="space-y-2.5">
              {hasExistingSubError || user?.activeSubscription ? (
                <button
                  onClick={() => handleInstantSubscribe(true)}
                  disabled={subscribing}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm text-center block shadow-lg shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {subscribing ? 'Upgrading Plan...' : '⚡ Confirm & Upgrade to This Plan'}
                </button>
              ) : (
                <button
                  onClick={() => handleInstantSubscribe(false)}
                  disabled={subscribing}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm text-center block shadow-lg shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {subscribing ? 'Activating Subscription...' : '⚡ Activate Mess Subscription Now'}
                </button>
              )}

              <a
                href={`https://wa.me/919876543210?text=Hi%20Bitez%2C%20I%20want%20to%20subscribe%20to%20the%20${encodeURIComponent(selectedPlanModal.name)}%20at%20%E2%82%B9${selectedPlanModal.price}%2Fmo%20for%20${encodeURIComponent(hostel)}%20Room%20${encodeURIComponent(room)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs text-center block transition-all cursor-pointer border border-slate-200"
              >
                Or Chat with Manager on WhatsApp 💬
              </a>
              <button
                onClick={() => {
                  setSelectedPlanModal(null);
                  setHasExistingSubError(false);
                }}
                className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Close &amp; Compare Other Plans
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 1-TAP INSTANT EXTRA ADD-ON ORDER MODAL ── */}
      {selectedExtraModal && (
        <OrderExtraModal
          isOpen={!!selectedExtraModal}
          onClose={() => setSelectedExtraModal(null)}
          item={selectedExtraModal}
          subscription={currentSub}
          user={user}
          onSuccess={(newOrder) => {
            const orderId = newOrder?.orderId || newOrder?._id || 'CONFIRMED';
            setSelectedExtraModal(null);
            setExtraNotification({
              msg: `🎉 Extra Order #${orderId} confirmed! Dispatched with your meal.`,
              type: 'success',
              orderId
            });
            refreshUser();
          }}
        />
      )}

      {/* Skip Meal Modal (when browsing plans) */}
      {currentSub && (
        <SkipMealModal
          isOpen={skipModalOpen}
          onClose={() => setSkipModalOpen(false)}
          subscription={currentSub}
          userWalletBalance={user?.walletBalance || 0}
          onSuccess={handleSkipSuccess}
        />
      )}

    </div>
  );
};

export default Subscriptions;