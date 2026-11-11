import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Plus, Minus, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Clock, ArrowRight, ShieldCheck, Utensils, Leaf, MapPin, Zap, HelpCircle, MessageCircle, Search, Phone, SlidersHorizontal, Grid, Flame, ChevronLeft, ChevronRight, UtensilsCrossed } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { plansAPI, menuAPI, dishesAPI } from '../services/api';

// Animated counter hook
const useCountUp = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !hasStarted) setHasStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    let start = 0;
    const inc = end / (duration / 16);
    const timer = setInterval(() => {
      start += inc;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [hasStarted, end, duration]);

  return { count, ref };
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { hasActiveSub } = useAuth();
  const { addToCart, items: cartItems, updateQuantity } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [foodSort, setFoodSort] = useState<'popular' | 'rating' | 'price_low' | 'price_high'>('popular');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [faqCategory, setFaqCategory] = useState<string>('all');
  const [faqSearch, setFaqSearch] = useState<string>('');

  const homeCategoryScrollRef = useRef<HTMLDivElement>(null);

  const scrollHomeCategories = (direction: 'left' | 'right') => {
    if (homeCategoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      homeCategoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Categories specifically for "Hungry? Order Now" section matching 3D circular design
  const hungryCategories = [
    { name: 'All Dishes', icon: '🔥', image: '/categories/all.png', cat: '' },
    { name: 'Burgers', icon: '🍔', image: '/categories/burgers.png', cat: 'burgers' },
    { name: 'Rolls', icon: '🌯', image: '/categories/rolls.png', cat: 'rolls' },
    { name: 'Chowmein', icon: '🍜', image: '/categories/chinese.png', cat: 'chowmein' },
    { name: 'Momos', icon: '🥟', image: '/categories/momos.png', cat: 'momos' },
    { name: 'Fries', icon: '🍟', image: '/categories/fries.png', cat: 'fries' },
    { name: 'Pizza', icon: '🍕', image: '/categories/pizza.png', cat: 'pizza' },
    { name: 'Biryani', icon: '🥘', image: '/categories/biryani.png', cat: 'biryani' },
    { name: 'Thali', icon: '🍛', image: '/categories/thali.png', cat: 'thali' },
    { name: 'South Indian', icon: '🫔', image: '/categories/south-indian.png', cat: 'south_indian' },
    { name: 'Curries & Breads', icon: '🍲', image: '/categories/curries.png', cat: 'curries' },
    { name: 'Combos & Meals', icon: '🍱', image: '/categories/thali.png', cat: 'combos' },
    { name: 'Fitness & Healthy', icon: '🥗', image: '/categories/healthy.png', cat: 'healthy' },
    { name: 'Desserts & Sweets', icon: '🍨', image: '/categories/desserts.png', cat: 'desserts' },
    { name: 'Shakes & Coolers', icon: '🥤', image: '/categories/beverages.png', cat: 'beverages' },
  ];

  // ── DYNAMIC LIVE STATE FROM BACKEND API ──────────────────
  const [messPlans, setMessPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [todaysMenu, setTodaysMenu] = useState<any>({
    breakfast: { emoji: '🥪', items: 'Loading today\'s breakfast...' },
    lunch: { emoji: '🍚', items: 'Loading today\'s lunch...' },
    dinner: { emoji: '🍲', items: 'Loading today\'s dinner...' }
  });
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [loadingDishes, setLoadingDishes] = useState(true);
  const [mealTimings, setMealTimings] = useState<any>(null);

  // Mess Plans Carousel / Slider State
  const messPlansRef = useRef<HTMLDivElement>(null);
  const [canScrollPlansLeft, setCanScrollPlansLeft] = useState(false);
  const [canScrollPlansRight, setCanScrollPlansRight] = useState(true);
  const [activePlanIndex, setActivePlanIndex] = useState(0);

  const scrollMessPlans = (direction: 'left' | 'right') => {
    if (messPlansRef.current) {
      const scrollAmount = 350;
      messPlansRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleMessPlansScroll = () => {
    if (messPlansRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = messPlansRef.current;
      setCanScrollPlansLeft(scrollLeft > 15);
      setCanScrollPlansRight(scrollLeft < scrollWidth - clientWidth - 15);
      const cardWidth = 330;
      const index = Math.round(scrollLeft / cardWidth);
      setActivePlanIndex(Math.min(Math.max(index, 0), messPlans.length - 1));
    }
  };

  const getPlanVisuals = (name: string, isPopular: boolean) => {
    const lower = (name || '').toLowerCase();
    if (isPopular) {
      return {
        badge: '🔥 MOST POPULAR',
        badgeBg: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-500/30',
        cardBorder: 'ring-2 ring-orange-500 shadow-2xl shadow-orange-500/15 border-orange-300',
        cardBg: 'bg-gradient-to-b from-orange-50/50 via-white to-white',
        emoji: '🍱',
        gradientHeader: 'from-orange-500 to-amber-500',
        accentColor: 'text-orange-600',
        btnBg: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/30',
        perks: 'Best value for 2 full meals everyday'
      };
    }
    if (lower.includes('trial')) {
      return {
        badge: '⚡ 1-DAY TRIAL PASS',
        badgeBg: 'bg-emerald-600 text-white shadow-emerald-600/20',
        cardBorder: 'border-emerald-300 hover:border-emerald-500 shadow-md hover:shadow-xl',
        cardBg: 'bg-gradient-to-b from-emerald-50/40 via-white to-white',
        emoji: '✨',
        gradientHeader: 'from-emerald-500 to-teal-500',
        accentColor: 'text-emerald-600',
        btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20',
        perks: 'Try taste before monthly plan'
      };
    }
    if (lower.includes('premium')) {
      return {
        badge: '👑 VIP ALL-ACCESS',
        badgeBg: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-600/20',
        cardBorder: 'border-purple-200 hover:border-purple-500 shadow-md hover:shadow-xl',
        cardBg: 'bg-gradient-to-b from-purple-50/40 via-white to-white',
        emoji: '👑',
        gradientHeader: 'from-purple-600 to-indigo-600',
        accentColor: 'text-purple-600',
        btnBg: 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20',
        perks: 'All 3 meals + desserts & VIP support'
      };
    }
    return {
      badge: '🌱 BUDGET FRIENDLY',
      badgeBg: 'bg-blue-600 text-white shadow-blue-600/20',
      cardBorder: 'border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-xl',
      cardBg: 'bg-white',
      emoji: '🥗',
      gradientHeader: 'from-blue-500 to-cyan-500',
      accentColor: 'text-blue-600',
      btnBg: 'bg-slate-900 hover:bg-orange-500 text-white shadow-sm hover:shadow-md',
      perks: '1 nutritious meal daily'
    };
  };

  const getPerMealPrice = (monthlyPrice: number, mealsStr: string) => {
    const mealsPerDay = parseInt(mealsStr) || 2;
    const totalMeals = mealsPerDay * 30;
    return Math.max(5, Math.round(monthlyPrice / totalMeals));
  };

  useEffect(() => {
    // 1. Fetch live plans
    plansAPI.getAll().then((data: any) => {
      if (data?.plans && data.plans.length > 0) {
        const activePlans = data.plans.filter((p: any) => p.isActive !== false);
        const formatted = activePlans.map((p: any) => ({
          id: p._id || p.id,
          name: p.name,
          meals: `${p.mealsPerDay || 1} Meal${(p.mealsPerDay || 1) > 1 ? 's' : ''}/Day`,
          duration: 'Monthly',
          price: p.monthlyPrice,
          popular: !!p.isPopular,
          features: (p.features && p.features.length > 0) ? p.features : [
            `${p.mealsPerDay || 1} Daily Meal${(p.mealsPerDay || 1) > 1 ? 's' : ''}`,
            'Fresh Homestyle Food',
            'Doorstep Campus Delivery',
            'Pause & Skip Facility'
          ]
        }));
        setMessPlans(formatted);
      }
    }).catch((e: any) => console.error('Error fetching plans:', e))
      .finally(() => setLoadingPlans(false));

    // 2. Fetch live today's rotating menu & meal timings
    menuAPI.getToday().then((data: any) => {
      if (data?.breakfast && data?.lunch && data?.dinner) {
        setTodaysMenu({
          breakfast: data.breakfast,
          lunch: data.lunch,
          dinner: data.dinner
        });
      }
    }).catch((e: any) => console.error('Error fetching today menu:', e));

    menuAPI.getMealTimings?.().then((res: any) => {
      if (res?.timings) setMealTimings(res.timings);
    }).catch(() => {});

    // 3. Fetch live dishes
    dishesAPI.getAll().then((data: any) => {
      if (data?.dishes && data.dishes.length > 0) {
        setFoodItems(data.dishes);
      }
    }).catch((e: any) => console.error('Error fetching food items:', e))
      .finally(() => setLoadingDishes(false));
  }, []);

  const reviews = [
    { name: 'Rahul S.', rating: 5, text: 'Food quality is consistently great and delivery is always on time. The mess plan saves me so much money and hassle! 🔥', avatar: '👨‍🎓' },
    { name: 'Priya M.', rating: 5, text: 'Best tiffin service in the city! I love the daily menu variety and the app makes it super easy to skip and pause meals. ⭐', avatar: '👩‍💼' },
    { name: 'Amit K.', rating: 4, text: 'Affordable and delicious food. The skip-meal feature is very convenient during exam weeks. Highly recommended! 🍕', avatar: '👨‍💻' },
    { name: 'Sneha R.', rating: 5, text: 'Finally a food platform that understands students and busy professionals! Great combos and punctual delivery. 🍱', avatar: '👩‍🎓' },
  ];

  const faqs = [
    {
      id: 0,
      category: 'mess',
      tag: 'Mess Subscription',
      icon: '🍱',
      q: 'How does the mess subscription work?',
      a: 'Choose between Basic (1 meal/day), Standard (2 meals/day), or Premium (3 meals/day) monthly plans. Complete your payment online, and freshly cooked, hygienic home-style food is delivered right to your hostel or doorstep on your chosen daily schedule.',
      tip: 'You can customize your delivery time slots for lunch (12:00–1:30 PM) and dinner (7:30–9:00 PM).'
    },
    {
      id: 1,
      category: 'mess',
      tag: 'Skip Flexibility',
      icon: '⏭️',
      q: 'Can I skip an upcoming meal if I am eating out?',
      a: 'Yes, 100%! You can easily skip any scheduled lunch or dinner directly from your dashboard before the daily cutoff time (10:00 AM for Lunch, 5:00 PM for Dinner). The credited amount is immediately retained in your account wallet.',
      tip: 'Skips are credited 100% to your wallet — zero food or money wasted!'
    },
    {
      id: 2,
      category: 'mess',
      tag: 'Pause Anytime',
      icon: '⏸️',
      q: 'Can I pause my subscription during exams or vacation?',
      a: 'Absolutely! If you are traveling home, on college break, or preparing for exams, you can pause your plan with a single tap in the dashboard. Your subscription validity automatically extends by the exact number of paused days.',
      tip: 'Unlimited pause flexibility on Standard and Premium plans without extra fees.'
    },
    {
      id: 3,
      category: 'delivery',
      tag: 'Instant vs Mess',
      icon: '⚡',
      q: 'How are instant orders and mess plans different?',
      a: 'Mess plans are scheduled recurring daily home-cooked thalis with balanced nutrition (roti, sabji, dal, rice). Instant orders are on-demand meals from our kitchen menu (burgers, rolls, biryani, pizzas) delivered fresh and hot in 20–25 minutes.',
      tip: 'Enjoy daily home tiffins and quick instant cravings together from the same account.'
    },
    {
      id: 4,
      category: 'delivery',
      tag: 'Coverage Area',
      icon: '📍',
      q: 'How do I check delivery availability in my area?',
      a: 'Use the live location pin in the top navigation bar or enter your hostel/pincode at checkout. We actively cover Bokaro Steel City, Chas, Sec-1 to Sec-12, and major student coaching hubs.',
      tip: 'Free delivery on all mess subscriptions and instant orders above ₹199.'
    },
    {
      id: 5,
      category: 'payments',
      tag: 'Payments & Refunds',
      icon: '💳',
      q: 'Which payment methods are accepted?',
      a: 'We accept all secure payment methods: UPI (Google Pay, PhonePe, Paytm, BHIM), Credit & Debit cards, Net Banking, and Bitez Wallet. Cash on Delivery (COD) is also available for instant orders.',
      tip: '100% encrypted, secure transactions with instant refund credits to wallet.'
    },
  ];

  const faqCategories = [
    { id: 'all', label: 'All Questions', count: 6 },
    { id: 'mess', label: 'Mess & Subscriptions', icon: '🍱', count: 3 },
    { id: 'delivery', label: 'Delivery & Coverage', icon: '🛵', count: 2 },
    { id: 'payments', label: 'Payments & Skips', icon: '💳', count: 1 },
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = faqCategory === 'all' || faq.category === faqCategory;
    const matchesSearch = faqSearch.trim() === '' ||
      faq.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.a.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.tag.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredFoodItems = foodItems
    .filter(item => {
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      const matchesVeg = !vegOnly || item.isVeg;
      return matchesCategory && matchesVeg;
    })
    .sort((a, b) => {
      if (foodSort === 'rating') return b.rating - a.rating;
      if (foodSort === 'price_low') return a.price - b.price;
      if (foodSort === 'price_high') return b.price - a.price;
      return 0; // default 'popular' preserves curated list order
    });
  const getCartQuantity = (itemId: string) => { const cartItem = cartItems.find(item => item.id === itemId); return cartItem ? cartItem.quantity : 0; };
  const handleAddToCart = (item: any) => addToCart({ id: item.id, name: item.name, price: item.price, image: item.image, restaurant: item.restaurant, isVeg: item.isVeg });

  return (
    <div className="min-h-screen">
      {/* HERO SECTION - WARM CULINARY PALETTE */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/50 via-amber-50/20 to-transparent pt-6 pb-8 lg:pt-8 lg:pb-10 border-b border-orange-100/70">
        {/* Soft background ambient blurs */}
        <div className="absolute top-0 right-10 w-[500px] h-[500px] bg-gradient-to-br from-orange-500/15 to-amber-500/10 rounded-full blur-3xl pointer-events-none -z-0"></div>
        <div className="absolute top-20 right-48 w-80 h-80 bg-orange-500/8 rounded-full blur-3xl pointer-events-none -z-0"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-6 items-center">

            {/* LEFT CONTENT COLUMN */}
            <div className="md:col-span-6 text-center md:text-left order-2 md:order-1">
              {/* Handwritten script badge */}
              <div className="inline-flex flex-col items-center md:items-start mb-2 sm:mb-3">
                <span className="font-handwritten text-xl sm:text-3xl text-slate-900 font-bold tracking-wide">
                  Healthy Food • Fresh Meals • Always On Time
                </span>
                {/* Brand hand-drawn accent brush underline */}
                <svg className="w-24 sm:w-32 h-2 sm:h-2.5 text-orange-500 fill-none -mt-1" viewBox="0 0 120 10">
                  <path d="M 4 7 Q 60 2 116 6" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
              </div>

              {/* Main Headline */}
              <h1 className="text-2xl sm:text-5xl lg:text-[54px] font-black text-slate-900 tracking-tight leading-[1.14] mb-3 sm:mb-5">
                Mess &amp; Instant Order <br />
                All in <span className="text-orange-600">One Place</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl mx-auto md:mx-0 mb-4 sm:mb-8">
                Get fresh, home-style mess plans for your daily meals and fast instant orders for your cravings — quick, easy and reliable.
              </p>

              {/* ── MOBILE-EXCLUSIVE APP EXPERIENCE (swiggy / zomato style) ── */}
              <div className="sm:hidden mb-5">
                {/* 1. App-Style Interactive Search Bar */}
                <div
                  onClick={() => navigate('/menu')}
                  className="flex items-center gap-2.5 bg-white px-3.5 py-3 rounded-2xl border border-orange-200/90 shadow-sm text-slate-400 cursor-pointer active:scale-98 transition-all hover:border-orange-400 mb-3"
                >
                  <Search className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate-600 flex-1 text-left truncate">
                    Search "Shahi Thali", "Biryani", "Rolls"...
                  </span>
                  <span className="text-[10px] font-black text-orange-600 bg-orange-100/90 px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    25m ⚡
                  </span>
                </div>

                {/* 2. Compact Modern Dual Switcher (Replaces the two tall clunky stacked cards) */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    onClick={() => navigate('/mess')}
                    className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 active:scale-95 transition-all text-left cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-lg flex-shrink-0">
                      🍱
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black leading-tight flex items-center justify-between">
                        <span>Daily Mess</span>
                        <ArrowRight className="w-3 h-3 text-white/80" />
                      </div>
                      <div className="text-[10px] text-orange-100 font-medium truncate">
                        From ₹40/meal
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate('/menu')}
                    className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white border border-orange-300 text-slate-900 shadow-xs active:scale-95 transition-all text-left cursor-pointer hover:bg-orange-50/50"
                  >
                    <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-lg flex-shrink-0">
                      ⚡
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black leading-tight flex items-center justify-between">
                        <span>Instant Order</span>
                        <ArrowRight className="w-3 h-3 text-orange-500" />
                      </div>
                      <div className="text-[10px] text-orange-600 font-black truncate">25 Min Express</div>
                    </div>
                  </button>
                </div>

                {/* 3. Promo Strip Pill */}
                <div
                  onClick={() => navigate('/menu')}
                  className="flex items-center justify-between bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200/80 rounded-xl px-3 py-2 text-xs shadow-2xs cursor-pointer active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] truncate">
                    <Sparkles className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                    <span>Flat <strong className="text-orange-600 font-black">20% OFF</strong> First Meal • Use <strong>SAVE20</strong></span>
                  </div>
                  <span className="text-[10px] font-black text-orange-600 bg-white px-2 py-0.5 rounded-full border border-orange-200 shadow-2xs flex-shrink-0 ml-1">
                    Order ➔
                  </span>
                </div>
              </div>

              {/* ── DESKTOP/TABLET TWO MAIN ACTION CARDS (hidden on small mobile screens) ── */}
              <div className="hidden sm:grid sm:grid-cols-2 gap-3.5 max-w-lg mx-auto md:mx-0 mb-6">
                {/* 1. Explore Mess (Mess Landing Page) */}
                <button
                  id="hero-explore-mess"
                  onClick={() => navigate('/mess')}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all text-left group cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    🍱
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-extrabold flex items-center justify-between">
                      <span>Mess</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                    <p className="text-[11px] text-white/90 font-medium truncate">
                      Daily Home Thalis @ ₹40
                    </p>
                  </div>
                </button>

                {/* 2. Order Instant Food */}
                <button
                  id="hero-order-food-now"
                  onClick={() => navigate('/menu')}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-white hover:bg-orange-50 text-orange-700 hover:text-orange-800 border-2 border-orange-400 hover:border-orange-500 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all text-left group cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    ⚡
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-extrabold flex items-center justify-between">
                      <span>Instant Order</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                    <p className="text-[11px] text-slate-500 group-hover:text-orange-700 font-medium truncate">⚡ 25 Min Express</p>
                  </div>
                </button>
              </div>

              {/* SLEEK TRUST BADGES ROW */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1 sm:pt-2 text-[10px] sm:text-[11px] font-semibold text-slate-700">
                <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white text-slate-800 border border-slate-200 shadow-2xs">
                  <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-600 flex-shrink-0" />
                  <span>100% Homestyle Taste</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-orange-50 text-orange-800 border border-orange-200/70 shadow-2xs">
                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-600 flex-shrink-0" />
                  <span>On-Time Delivery</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white text-slate-800 border border-slate-200 shadow-2xs">
                  <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-700 flex-shrink-0" />
                  <span>FSSAI Certified</span>
                </span>
              </div>
            </div>

            {/* RIGHT COMPOSITE VISUAL COLUMN (Header Image - visible on mobile and desktop) */}
            <div className="md:col-span-6 relative flex items-center justify-center pt-2 md:pt-0 order-1 md:order-2 mb-4 sm:mb-6 md:mb-0">

              <div className="relative w-full max-w-[620px] group">

                {/* 1. Ambient Background Glowing Light Orbs */}
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />

                {/* 2. Rotating Decorative Dashed Orbital Shape */}
                <div className="absolute inset-0 sm:-inset-4 border-2 border-dashed border-orange-200/60 rounded-[2.25rem] sm:rounded-[3.75rem] pointer-events-none animate-spin-slow opacity-80" />

                {/* 3. Floating Sparkle Accent */}
                <div className="absolute -top-3 left-1/4 z-30 animate-bounce-gentle pointer-events-none hidden sm:block">
                  <Sparkles className="w-5 h-5 text-orange-500 drop-shadow" />
                </div>

                {/* 4. Main Organic Shaped Container with Glassmorphism Border */}
                <div className="relative p-2 sm:p-3.5 bg-white/90 backdrop-blur-xl rounded-[2rem] sm:rounded-[3.25rem] lg:rounded-[3.5rem] shadow-[0_20px_50px_-15px_rgba(234,88,12,0.15)] border border-slate-200/80 transition-all duration-700 ease-out group-hover:-translate-y-2 group-hover:shadow-[0_25px_60px_-12px_rgba(234,88,12,0.25)]">

                  {/* Inner Shaped Frame */}
                  <div className="relative overflow-hidden rounded-[1.75rem] sm:rounded-[2.75rem] lg:rounded-[3rem] bg-slate-100 aspect-[16/10] sm:aspect-[16/9.5] flex items-center justify-center">

                    {/* Top glass shine effect */}
                    <div className="absolute inset-x-0 top-0 h-20 sm:h-28 bg-gradient-to-b from-white/40 to-transparent pointer-events-none z-10" />

                    {/* High Resolution Bitez Composite Art with smooth zoom on hover */}
                    <img
                      src="/hero-tiffinmate-main.jpg"
                      alt="Bitez - Mess and Instant Order"
                      className="w-full h-full object-cover sm:object-contain transition-transform duration-700 ease-out group-hover:scale-[1.03] select-none filter drop-shadow-md"
                    />

                    {/* Subtle bottom gradient tint */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-900/10 to-transparent pointer-events-none" />
                  </div>

                </div>

                {/* 5. FLOATING ANIMATED BADGES */}

                {/* Top-Right Badge: "Instant Order & Express Delivery" */}
                <div className="hidden min-[480px]:flex absolute -top-3.5 right-4 sm:right-6 bg-white/95 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg shadow-slate-900/10 border border-slate-200 items-center gap-2 z-20 animate-float-smooth hover:scale-105 transition-transform cursor-pointer">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                  <span className="font-handwritten text-base sm:text-lg font-bold text-slate-800 tracking-wide">
                    Instant Order &amp; Express Delivery
                  </span>
                  <span className="text-sm">📍</span>
                </div>

                {/* Top-Left Badge: "100% Homestyle Taste" */}
                <div className="absolute top-2 left-2 sm:-top-3.5 sm:-left-3 bg-white/95 backdrop-blur-md px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full shadow-lg shadow-slate-900/10 border border-slate-200 flex items-center gap-1.5 sm:gap-2 z-20 animate-float-delay hover:scale-105 transition-transform cursor-pointer">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 shadow-2xs">
                    <Leaf className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-900 tracking-tight">
                    100% Homestyle Taste
                  </span>
                </div>

                {/* Bottom-Left Badge: "4.9 ⭐ (10k+ Tiffins)" */}
                <div className="absolute bottom-2 left-2 sm:-bottom-3 sm:-left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl sm:rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200 flex items-center gap-1.5 sm:gap-2 z-20 animate-float-reverse hover:scale-105 transition-transform cursor-pointer">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-[10px] sm:text-xs shadow-sm flex-shrink-0">
                    🍱
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <div className="flex text-orange-500">
                        <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-orange-500 text-orange-500" />
                        <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-orange-500 text-orange-500" />
                        <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-orange-500 text-orange-500" />
                        <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-orange-500 text-orange-500" />
                        <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-orange-500 text-orange-500" />
                      </div>
                      <span className="text-[10px] sm:text-xs font-black text-slate-900 ml-0.5">4.9</span>
                    </div>
                    <span className="text-[8px] sm:text-[9.5px] font-semibold text-slate-500">10,000+ Tiffins</span>
                  </div>
                </div>

                {/* Bottom-Right Badge: "⚡ 25 Min Express Delivery" */}
                <div className="absolute bottom-2 right-2 sm:-bottom-3 sm:right-3 bg-white/95 backdrop-blur-md text-slate-800 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg shadow-orange-500/10 border border-orange-200/80 flex items-center gap-1 sm:gap-1.5 z-20 animate-float-slow hover:scale-105 transition-transform cursor-pointer">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                  <Zap className="w-3 h-3 text-orange-500 fill-orange-500" />
                  <span className="text-[10px] sm:text-xs font-bold text-slate-800 tracking-wide">
                    25 Min Express
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* MESS PLANS - CAROUSEL / SCROLL SECTION */}
      <section id="mess-plans" className="py-10 sm:py-12 lg:py-14 bg-gradient-to-b from-[#FDFBF7] via-white to-[#FDFBF7] relative overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-400/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header with Left/Right Arrows */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-orange-700 text-xs font-black uppercase tracking-wider mb-3 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                <span>STUDENT MEAL PASSES • 100% HOMESTYLE</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-3">
                Choose Your Mess <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">Plan 🍱</span>
              </h2>
              <p className="text-slate-600 text-sm sm:text-base max-w-2xl leading-relaxed">
                Hygienic, wholesome thalis prepared twice daily and delivered directly to your hostel room. Pause, skip, or swap meals anytime with zero penalty.
              </p>
            </div>

            {/* Slider Controls */}
            <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
              <span className="text-xs font-bold text-slate-400 hidden sm:inline-flex items-center gap-1.5 mr-1">
                Scroll plans
              </span>
              <button
                onClick={() => scrollMessPlans('left')}
                disabled={!canScrollPlansLeft}
                aria-label="Scroll plans left"
                className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all duration-200 cursor-pointer ${canScrollPlansLeft
                    ? 'bg-white border-slate-300 text-slate-800 shadow-sm hover:bg-orange-500 hover:text-white hover:border-orange-500 hover:scale-105 active:scale-95'
                    : 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                  }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollMessPlans('right')}
                disabled={!canScrollPlansRight}
                aria-label="Scroll plans right"
                className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all duration-200 cursor-pointer ${canScrollPlansRight
                    ? 'bg-white border-slate-300 text-slate-800 shadow-sm hover:bg-orange-500 hover:text-white hover:border-orange-500 hover:scale-105 active:scale-95'
                    : 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                  }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Swipe hint on small screens */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-3 px-1 sm:hidden">
            <span>👈 Swipe horizontally to view all plans</span>
            <span>{activePlanIndex + 1} / {messPlans.length}</span>
          </div>

          {/* Horizontal Scroll Track */}
          <div
            ref={messPlansRef}
            onScroll={handleMessPlansScroll}
            className="flex gap-5 sm:gap-6 overflow-x-auto pb-6 pt-3 px-1 scrollbar-hide snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {loadingPlans && messPlans.length === 0 ? (
              Array(3).fill(0).map((_, idx) => (
                <div key={idx} className="w-[290px] sm:w-[320px] lg:w-[330px] shrink-0 rounded-3xl p-6 bg-slate-50 border border-slate-200 animate-pulse h-96 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="h-6 w-24 bg-slate-200 rounded-full" />
                    <div className="h-8 w-40 bg-slate-200 rounded-lg" />
                    <div className="h-10 w-28 bg-slate-200 rounded-lg" />
                    <div className="space-y-2 pt-4">
                      <div className="h-4 w-full bg-slate-200 rounded" />
                      <div className="h-4 w-5/6 bg-slate-200 rounded" />
                      <div className="h-4 w-4/6 bg-slate-200 rounded" />
                    </div>
                  </div>
                  <div className="h-12 w-full bg-slate-200 rounded-2xl" />
                </div>
              ))
            ) : messPlans.map((plan, i) => {
              const visuals = getPlanVisuals(plan.name, plan.popular);
              const perMeal = getPerMealPrice(plan.price, plan.meals);

              return (
                <div
                  key={plan.id || i}
                  className={`w-[290px] sm:w-[320px] lg:w-[330px] shrink-0 snap-start relative rounded-3xl p-6 sm:p-7 transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between ${visuals.cardBg} ${visuals.cardBorder}`}
                >
                  {/* Top Badge */}
                  <div className="absolute -top-3.5 left-6">
                    <span className={`text-[11px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 ${visuals.badgeBg}`}>
                      {visuals.badge}
                    </span>
                  </div>

                  <div>
                    {/* Header info */}
                    <div className="flex items-start justify-between mt-2 mb-3">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                          {plan.name}
                        </h3>
                        <p className="text-xs font-bold text-slate-500 mt-0.5">
                          {plan.meals}
                        </p>
                      </div>
                      <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-xl shadow-xs">
                        {visuals.emoji}
                      </div>
                    </div>

                    {/* Price Block with Per-Meal Breakdown */}
                    <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 mb-5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                          ₹{plan.price}
                        </span>
                        <span className="text-xs font-bold text-slate-400">/month</span>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60">
                        <span className="text-[11px] font-semibold text-slate-500">Effective Cost:</span>
                        <span className="text-xs font-black text-orange-600 bg-orange-100/70 px-2 py-0.5 rounded-md">
                          ~₹{perMeal} / meal
                        </span>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="mb-6">
                      <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3">
                        What's Included:
                      </p>
                      <ul className="space-y-2.5">
                        {plan.features.map((f: string, j: number) => (
                          <li key={j} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 leading-snug">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Action CTA */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => navigate('/plans', { state: { selectedPlan: plan.name, planId: plan.id } })}
                      className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${visuals.btnBg}`}
                    >
                      <span>Subscribe Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <p className="text-[10px] text-center text-slate-400 font-semibold mt-2.5">
                      ✓ Instant activation • Doorstep delivery
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots Indicator */}
          {messPlans.length > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              {messPlans.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={() => {
                    if (messPlansRef.current) {
                      messPlansRef.current.scrollTo({
                        left: dotIdx * 340,
                        behavior: 'smooth'
                      });
                    }
                  }}
                  aria-label={`Go to plan ${dotIdx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${activePlanIndex === dotIdx
                      ? 'w-7 bg-orange-500'
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                />
              ))}
            </div>
          )}

          {/* Guarantee / Trust Badge Footer */}
          <div className="mt-7 sm:mt-8 p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">3-Day Tasting Guarantee</h4>
                <p className="text-[11px] sm:text-xs text-slate-500">Not 100% satisfied with the food? Get a direct refund on unconsumed meals.</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/timetable')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5"
            >
              <span>Compare Full Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* TODAY'S LIVE KITCHEN MENU HIGHLIGHT */}
      <section id="todays-menu" className="py-10 sm:py-12 lg:py-14 bg-[#FBF9F5] border-t border-orange-100/70 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-6 sm:mb-8 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-orange-700 text-xs font-black uppercase tracking-wider mb-3 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>COOKING FRESH IN CAMPUS KITCHEN TODAY</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mb-2 sm:mb-3">
              Today&apos;s Live <span className="text-orange-600">Mess Menu 🍳</span>
            </h2>
            <p className="text-slate-500 text-xs sm:text-base">
              Freshly prepared homestyle meals today — check the full 7-day rotating schedule in the Weekly Timetable.
            </p>
          </div>

          {/* 3 Today Meal Cards with Food Images */}
          {(() => {
            const mealsData = [
              {
                title: mealTimings?.breakfast?.label || 'Breakfast',
                emoji: '☀️',
                time: mealTimings?.breakfast?.deliveryTimeStr || '08:00 AM – 09:30 AM',
                items: typeof todaysMenu.breakfast === 'string' ? todaysMenu.breakfast : todaysMenu.breakfast?.items || 'Aloo Paratha + Curd + Chai',
                tag: 'Morning Energy',
                img: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=600',
                fallback: '/categories/south-indian.png'
              },
              {
                title: mealTimings?.lunch?.label || 'Lunch Thali',
                emoji: '🌤️',
                time: mealTimings?.lunch?.deliveryTimeStr || '12:30 PM – 02:00 PM',
                items: typeof todaysMenu.lunch === 'string' ? todaysMenu.lunch : todaysMenu.lunch?.items || 'Dal Makhani + Jeera Rice + 3 Roti + Salad',
                tag: 'Balanced Homestyle',
                img: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=600',
                fallback: '/categories/thali.png'
              },
              {
                title: mealTimings?.dinner?.label || 'Dinner',
                emoji: '🌙',
                time: mealTimings?.dinner?.deliveryTimeStr || '07:30 PM – 09:00 PM',
                items: typeof todaysMenu.dinner === 'string' ? todaysMenu.dinner : todaysMenu.dinner?.items || 'Paneer Butter Masala + Rice + 3 Roti',
                tag: 'Warm Comfort',
                img: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=600',
                fallback: '/categories/curries.png'
              }
            ];

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                {mealsData.map(m => (
                  <div
                    key={m.title}
                    className="bg-white rounded-3xl overflow-hidden hover:-translate-y-1 transition-all duration-300 border border-slate-200 shadow-xs hover:shadow-xl hover:border-orange-200 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Visual Food Image Banner */}
                      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100">
                        <img
                          src={m.img}
                          alt={m.title}
                          onError={(e) => {
                            if (!e.currentTarget.dataset.fallbackApplied) {
                              e.currentTarget.dataset.fallbackApplied = '1';
                              e.currentTarget.src = m.fallback;
                            }
                          }}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                        <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-slate-800 text-[11px] font-black px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
                          <span>{m.emoji}</span>
                          <span>{m.tag}</span>
                        </span>
                        <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs">
                          ✓ Pure Veg
                        </span>
                        <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/15 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-orange-400" />
                          <span>{m.time}</span>
                        </span>
                      </div>

                      <div className="p-5 sm:p-6 text-left">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2 flex items-center gap-1.5">
                          <span>{m.title}</span>
                        </h3>
                        <div className="bg-orange-50/60 rounded-2xl p-3.5 border border-orange-100/80">
                          <p className="text-slate-800 text-xs sm:text-sm font-bold leading-relaxed">{m.items}</p>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 sm:px-6 pb-4 pt-2 border-t border-slate-100 text-xs text-slate-400 font-semibold flex items-center justify-between">
                      <span>Hot Insulated Tiffin</span>
                      <span className="text-orange-600 font-bold">100% Homestyle</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Single Canonical Action Link to Weekly Mess Timetable */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-2">
            <Link
              to="/timetable"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-md shadow-orange-500/20 text-xs sm:text-sm cursor-pointer"
            >
              <span>Open Weekly Mess Timetable 🍱</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/mess"
              className="inline-flex items-center gap-1.5 text-slate-700 font-bold hover:text-orange-600 text-xs sm:text-sm transition-colors py-2.5 px-4 rounded-2xl hover:bg-white"
            >
              <span>Subscribe Mess Plan</span>
              <span>→</span>
            </Link>
          </div>

        </div>
      </section>

      {/* INSTANT ORDER - 3-COLOR THEME */}
      <section id="food-delivery" className="relative py-10 sm:py-12 lg:py-14 bg-white overflow-hidden border-t border-slate-200/80">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* 1. SECTION HEADER */}
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold uppercase tracking-wider mb-2.5 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span>⚡ Express Instant Delivery in 20–25 Mins</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-[42px] font-black text-slate-900 tracking-tight leading-[1.15] mb-2 sm:mb-2.5">
              Hungry? <span className="text-orange-600">Instant Order Now</span> 🍔
            </h2>

            <p className="text-slate-600 text-xs sm:text-base leading-relaxed">
              Freshly cooked hot meals, biryanis, rolls, burgers, and snacks delivered straight to your door in minutes.
            </p>
          </div>

          {/* 2. CIRCULAR CATEGORY SHOWCASE BAR */}
          <div className="relative mb-8 bg-slate-50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-slate-200 shadow-xs overflow-hidden">
            {/* Strip Sub-header */}
            <div className="flex items-center justify-between mb-3 sm:mb-4 relative z-10">
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                Select a Cuisine or Category
              </span>

              {/* Scroll controls */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollHomeCategories('left')}
                  className="w-8 h-8 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-600 hover:text-orange-600 hover:border-orange-300 transition-all active:scale-95 cursor-pointer"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollHomeCategories('right')}
                  className="w-8 h-8 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-600 hover:text-orange-600 hover:border-orange-300 transition-all active:scale-95 cursor-pointer"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horizontal Scrolling Circular Category Cards */}
            <div className="relative">
              <div
                ref={homeCategoryScrollRef}
                className="flex items-start gap-3 sm:gap-6 md:gap-7 overflow-x-auto scroll-smooth py-2 px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {hungryCategories.map((c) => {
                  const isActive = (!selectedCategory && c.cat === '') || selectedCategory === c.cat;
                  return (
                    <button
                      key={c.cat || 'all'}
                      onClick={() => setSelectedCategory(c.cat)}
                      className="group flex flex-col items-center flex-shrink-0 cursor-pointer transition-all duration-200 outline-none focus:outline-none focus-visible:outline-none select-none"
                      style={{ minWidth: '74px', maxWidth: '96px' }}
                    >
                      {/* Floating Circular Card */}
                      <div
                        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center transition-all duration-300 transform group-hover:-translate-y-1.5 ${isActive
                            ? 'ring-2 ring-orange-500 shadow-md bg-white scale-105'
                            : 'shadow-xs group-hover:shadow-md border border-slate-200'
                          }`}
                      >
                        <img
                          src={c.image}
                          alt={c.name}
                          className="w-9 h-9 sm:w-12 sm:h-12 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-xs pointer-events-none"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'block';
                          }}
                        />
                        <span className="hidden text-3xl pointer-events-none">
                          {c.icon}
                        </span>
                      </div>

                      {/* Category Label Underneath */}
                      <div className="mt-2.5 sm:mt-3 text-center w-full">
                        <span
                          className={`block text-xs sm:text-sm tracking-tight transition-colors duration-200 leading-tight ${isActive
                              ? 'font-bold text-orange-600'
                              : 'font-semibold text-slate-700 group-hover:text-slate-900'
                            }`}
                        >
                          {c.name}
                        </span>
                        {isActive && (
                          <div className="w-5 h-1 bg-orange-500 rounded-full mx-auto mt-1" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Sub-bar with Item Count, Veg Filter, and Link to Full Menu */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-2 border-t border-slate-200 relative z-10 text-xs">
              <span className="text-slate-500 font-medium">
                Showing <strong className="text-slate-800">{filteredFoodItems.length}</strong> items in{' '}
                <span className="text-orange-600 font-bold">
                  {hungryCategories.find(c => c.cat === selectedCategory)?.name || 'All Dishes'}
                </span>
              </span>

              <div className="flex items-center gap-3">
                {/* Veg Only Toggle */}
                <button
                  onClick={() => setVegOnly(!vegOnly)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold border transition-all cursor-pointer ${vegOnly
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                >
                  <div className={`w-3 h-3 rounded border flex items-center justify-center ${vegOnly ? 'border-white bg-emerald-600' : 'border-emerald-600 bg-white'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${vegOnly ? 'bg-white' : 'bg-emerald-600'}`} />
                  </div>
                  <span>Veg Only</span>
                </button>

                {/* View Full Menu link */}
                <Link
                  to={selectedCategory ? `/menu?category=${selectedCategory}` : '/menu'}
                  className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-bold transition-colors"
                >
                  <span>Full Menu</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>

          {/* 3. RESPONSIVE FOOD GRID */}
          {filteredFoodItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm max-w-md mx-auto mb-10">
              <p className="text-4xl mb-2">🥗</p>
              <h4 className="font-extrabold text-slate-800 text-base mb-1">No items found</h4>
              <p className="text-slate-500 text-xs mb-4">No matching dishes with current filters.</p>
              <button
                onClick={() => { setSelectedCategory(''); setVegOnly(false); }}
                className="px-4 py-2 rounded-full bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 min-[440px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6 mb-10">
              {(selectedCategory ? filteredFoodItems : filteredFoodItems.slice(0, 8)).map(item => {
                const qty = getCartQuantity(item.id);
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 border border-slate-200 hover:border-orange-300 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group"
                  >
                    {/* Top Content & Image */}
                    <div>
                      {/* Image Box */}
                      <div className="relative aspect-[4/3] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 mb-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
                          {/* Veg / Non-Veg Icon */}
                          <div className={`w-5 h-5 rounded-md border-2 bg-white/95 backdrop-blur-md flex items-center justify-center shadow-xs ${item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                          </div>

                          {/* Tag or Discount */}
                          {item.tag ? (
                            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 text-white text-[10px] font-bold shadow-xs">
                              {item.tag}
                            </span>
                          ) : item.originalPrice ? (
                            <span className="px-2 py-0.5 rounded-full bg-orange-600 text-white text-[10px] font-bold shadow-xs">
                              {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                            </span>
                          ) : null}
                        </div>

                        {/* Prep Time */}
                        <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-700 flex items-center gap-1 shadow-xs">
                          <Clock className="w-2.5 h-2.5 text-orange-500" />
                          <span>{item.prepTime || '20m'}</span>
                        </div>
                      </div>

                      {/* Category & Kitchen */}
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1">
                        <span className="text-orange-600 uppercase tracking-wider text-[10px]">
                          {item.category.replace('_', ' ')}
                        </span>
                        <span className="truncate max-w-[110px] font-medium text-slate-500">
                          {item.restaurant}
                        </span>
                      </div>

                      {/* Name */}
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base mb-1.5 group-hover:text-orange-600 transition-colors line-clamp-1">
                        {item.name}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center gap-1.5 mb-3">
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-orange-50 text-orange-800 text-[11px] font-bold border border-orange-200/60">
                          <Star className="w-3 h-3 fill-orange-500 text-orange-500" />
                          <span>{item.rating}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">
                          ({item.reviewsCount || '150+'})
                        </span>
                      </div>
                    </div>

                    {/* Bottom Price & Add to Cart */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg sm:text-xl font-black text-slate-900">
                          ₹{item.price}
                        </span>
                        {item.originalPrice && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{item.originalPrice}
                          </span>
                        )}
                      </div>

                      {qty === 0 ? (
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>ADD</span>
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      ) : (
                        <div className="flex items-center bg-orange-500 text-white rounded-xl shadow-sm px-1 py-0.5 gap-1">
                          <button
                            onClick={() => updateQuantity(item.id, qty - 1)}
                            className="w-6 h-6 rounded-lg hover:bg-white/20 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-black text-xs w-4 text-center">{qty}</span>
                          <button
                            onClick={() => updateQuantity(item.id, qty + 1)}
                            className="w-6 h-6 rounded-lg hover:bg-white/20 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 4. "SEE MORE" BUTTON */}
          <div className="flex flex-col items-center justify-center text-center">
            <Link
              to="/menu"
              id="hungry-see-more-btn"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-orange-500/25 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer"
            >
              <span>See More Dishes</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <p className="text-xs text-slate-500 font-medium mt-2.5">
              Explore 50+ more dishes on the full instant menu
            </p>
          </div>

        </div>
      </section>

      {/* OFFERS - PREMIUM SHOWCASE PROMO CARDS */}
      <section id="offers" className="py-10 sm:py-12 lg:py-14 bg-gradient-to-b from-slate-50 to-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-orange-700 text-xs font-black uppercase tracking-wider mb-3 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>EXCLUSIVE CAMPUS DEALS &amp; COMBOS</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Hot Campus <span className="text-orange-600">Special Offers 🎁</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

            {/* Card 1: Express Fast-Food Combo (Warm Peach & Cream Palette) */}
            <div className="group relative rounded-[2rem] p-6 sm:p-8 bg-gradient-to-br from-orange-50 via-white to-amber-50/90 text-slate-900 overflow-hidden shadow-lg shadow-orange-500/5 border-2 border-orange-200/80 hover:border-orange-400 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              {/* Soft Ambient Accent */}
              <div className="absolute -top-16 -right-16 w-56 h-56 bg-orange-200/35 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200 text-[10px] font-black uppercase tracking-wider">
                      🔥 Today&apos;s Fast-Food Special
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase">
                      Save 45%
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2.5 mb-2">
                    <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
                      Special Combo <span className="text-orange-600">@ ₹99</span>
                    </h3>
                    <span className="text-sm sm:text-base text-slate-400 line-through font-bold">₹179</span>
                  </div>

                  <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed mb-4">
                    Crispy Veg Burger + Salted Peri Peri Fries + Chilled Beverage delivered hot in 25 mins.
                  </p>

                  {/* Feature Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {['🍔 Crispy Burger', '🍟 Peri Peri Fries', '🥤 Cold Drink'].map(chip => (
                      <span key={chip} className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-white border border-orange-200/70 text-slate-700 shadow-2xs">
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Appetizing Visual Frame */}
                <div className="relative shrink-0 self-center sm:self-auto">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-white p-1.5 border border-orange-200 shadow-xl rotate-2 group-hover:rotate-0 transition-transform duration-500">
                    <img
                      src="https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400"
                      alt="Special Combo Burger and Fries"
                      onError={(e) => {
                        if (!e.currentTarget.dataset.fallbackApplied) {
                          e.currentTarget.dataset.fallbackApplied = '1';
                          e.currentTarget.src = '/categories/burgers.png';
                        }
                      }}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  </div>
                  <span className="absolute -bottom-2 -right-2 bg-slate-900 text-amber-300 font-black text-[10px] px-2.5 py-1 rounded-full shadow-md border-2 border-white">
                    ⚡ 25m Express
                  </span>
                </div>
              </div>

              <div className="relative z-10 pt-4 border-t border-orange-200/60 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] font-mono font-extrabold text-orange-700 bg-white border border-orange-200 px-3 py-1.5 rounded-xl shadow-2xs">
                  CODE: COMBO99
                </span>
                <Link
                  to="/menu"
                  className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl transition-all shadow-md shadow-orange-500/20 active:scale-95"
                >
                  <span>Order Combo Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Card 2: New Student Mess Subscription Offer (Fresh Mint & Saffron Palette) */}
            <div className="group relative rounded-[2rem] p-6 sm:p-8 bg-gradient-to-br from-emerald-50/70 via-white to-amber-50 text-slate-900 overflow-hidden shadow-lg shadow-emerald-500/5 border-2 border-emerald-200/80 hover:border-emerald-400 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              {/* Soft Ambient Accent */}
              <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-emerald-200/35 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase tracking-wider">
                      🎉 New Student Offer
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-black uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                      Limited Seats
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2.5 mb-2">
                    <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
                      First Month <span className="text-emerald-600">@ ₹999</span>
                    </h3>
                    <span className="text-sm sm:text-base text-slate-400 line-through font-bold">₹1,999</span>
                  </div>

                  <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed mb-4">
                    Subscribe this month and unlock ₹0 hostel doorstep delivery + Sunday Royal Desserts included.
                  </p>

                  {/* Benefit Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {['🚀 ₹0 Delivery Fee', '🍨 Weekend Desserts', '⏭️ Easy Skips'].map(chip => (
                      <span key={chip} className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-white border border-emerald-200/70 text-slate-700 shadow-2xs">
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Appetizing Thali Visual Frame */}
                <div className="relative shrink-0 self-center sm:self-auto">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-white p-1.5 border border-emerald-200 shadow-xl -rotate-2 group-hover:rotate-0 transition-transform duration-500">
                    <img
                      src="https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=400"
                      alt="Homestyle Mess Thali Tiffin"
                      onError={(e) => {
                        if (!e.currentTarget.dataset.fallbackApplied) {
                          e.currentTarget.dataset.fallbackApplied = '1';
                          e.currentTarget.src = '/categories/thali.png';
                        }
                      }}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  </div>
                  <span className="absolute -bottom-2 -right-2 bg-emerald-600 text-white font-black text-[10px] px-2.5 py-1 rounded-full shadow-md border-2 border-white">
                    🍱 50% OFF 1st Mo
                  </span>
                </div>
              </div>

              <div className="relative z-10 pt-4 border-t border-emerald-200/60 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] font-extrabold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Verified Campus Mess Pass
                </span>
                <Link
                  to="/mess"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl transition-all shadow-md shadow-emerald-600/20 active:scale-95"
                >
                  <span>Explore Mess Plans</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* WHY CHOOSE US - COLORFUL VALUE PROPOSITIONS */}
      <section className="relative py-10 sm:py-12 lg:py-14 bg-gradient-to-b from-white via-orange-50/20 to-white border-t border-slate-200/60 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-100 via-amber-100 to-rose-100 border border-orange-200/80 text-orange-800 text-xs font-black uppercase tracking-wider mb-3 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>THE BITEZ ADVANTAGE</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mb-2 sm:mb-3 tracking-tight">
              Why Students &amp; Pros{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-rose-500 to-purple-600">
                Choose Us ✨
              </span>
            </h2>
            <p className="text-slate-600 text-xs sm:text-base">
              Designed specifically for daily convenience, pocket-friendly nutrition, and complete flexibility.
            </p>
          </div>
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                icon: '🍱',
                title: 'Authentic Homestyle Taste',
                desc: 'Freshly prepared, non-oily nutritious food made daily with whole wheat rotis and fresh ingredients.',
                badge: 'Pure Veg & Fresh',
                cardStyle: 'bg-gradient-to-br from-orange-50 via-amber-50/60 to-white border-orange-200 hover:border-orange-400 shadow-orange-500/10',
                iconPod: 'bg-gradient-to-br from-orange-500 to-amber-500 shadow-orange-500/30',
                badgeStyle: 'bg-orange-100 text-orange-700 border-orange-200'
              },
              {
                icon: '🚴',
                title: 'Punctual Delivery',
                desc: 'On-time Breakfast, Lunch & Dinner delivery slots right to your hostel room or campus gate.',
                badge: '3 Daily Meal Slots',
                cardStyle: 'bg-gradient-to-br from-sky-50 via-blue-50/60 to-white border-sky-200 hover:border-sky-400 shadow-sky-500/10',
                iconPod: 'bg-gradient-to-br from-sky-500 to-indigo-600 shadow-sky-500/30',
                badgeStyle: 'bg-sky-100 text-sky-700 border-sky-200'
              },
              {
                icon: '💰',
                title: 'Affordable Pricing',
                desc: 'Pocket-friendly subscriptions starting @ just ₹40/meal with zero hidden charges or extra delivery fees.',
                badge: '₹0 Delivery Fee',
                cardStyle: 'bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white border-emerald-200 hover:border-emerald-400 shadow-emerald-500/10',
                iconPod: 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30',
                badgeStyle: 'bg-emerald-100 text-emerald-700 border-emerald-200'
              },
              {
                icon: '📅',
                title: 'Instant Skips & Pauses',
                desc: 'Skip any meal before cutoff for +1 rollover meal balance, or pause your plan during vacations.',
                badge: '+1 Meal Rollover',
                cardStyle: 'bg-gradient-to-br from-purple-50 via-fuchsia-50/60 to-white border-purple-200 hover:border-purple-400 shadow-purple-500/10',
                iconPod: 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-purple-500/30',
                badgeStyle: 'bg-purple-100 text-purple-700 border-purple-200'
              }
            ].map((item, i) => (
              <div
                key={i}
                className={`rounded-3xl p-6 text-center shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border-2 flex flex-col justify-between group ${item.cardStyle}`}
              >
                <div>
                  <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300 ${item.iconPod}`}>
                    {item.icon}
                  </div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">{item.desc}</p>
                </div>
                <div className="pt-2">
                  <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${item.badgeStyle}`}>
                    {item.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DELIVERY AREA CHECKER */}
      <section className="py-10 sm:py-12 lg:py-14 bg-orange-50/25 border-t border-orange-100/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2 sm:mb-2.5">We Deliver Near You 📍</h2>
          <p className="text-slate-500 mb-6 sm:mb-7 text-xs sm:text-base">Check if service is active in your college campus, hostel, coaching, or workplace</p>
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-200/80 shadow-md">
            <div className="text-5xl sm:text-6xl mb-4">🗺️</div>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3 max-w-md mx-auto">
              <input type="text" placeholder="Enter your campus, PG, or area" className="flex-1 w-full px-5 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-xs sm:text-sm outline-none" />
              <button className="w-full sm:w-auto px-6 py-3 bg-orange-500 text-white font-bold text-xs sm:text-sm rounded-2xl hover:bg-orange-600 transition-all shadow-md shadow-orange-500/20 whitespace-nowrap cursor-pointer">Check Availability</button>
            </div>
          </div>
        </div>
      </section>

      {/* CUSTOMER REVIEWS - 3-COLOR THEME */}
      <section className="py-10 sm:py-12 lg:py-14 bg-white border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2 sm:mb-3">Loved by 10,000+ Foodies ⭐</h2>
            <p className="text-slate-500 text-xs sm:text-base">Real reviews from students, hostellers, and office professionals across the city</p>
          </div>
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {reviews.map((review, i) => (
              <div key={i} className="bg-slate-50 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 border border-slate-200 hover:border-orange-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-1 mb-3">{[...Array(5)].map((_, j) => <Star key={j} className={`w-4 h-4 ${j < review.rating ? 'text-orange-500 fill-orange-500' : 'text-slate-200'}`} />)}</div>
                  <p className="text-slate-600 text-xs sm:text-sm mb-5 leading-relaxed italic">"{review.text}"</p>
                </div>
                <div className="flex items-center space-x-3 pt-3 border-t border-slate-200">
                  <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-lg">{review.avatar}</div>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">— {review.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS - 3-COLOR THEME */}
      <section id="faqs" className="relative py-10 sm:py-12 lg:py-14 bg-slate-50 overflow-hidden border-t border-slate-200/80">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">

            {/* LEFT COLUMN: Sticky Header & Live Support Card */}
            <div className="lg:col-span-4 lg:sticky lg:top-24">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
                <HelpCircle className="w-3.5 h-3.5 text-orange-600" />
                <span>Got Questions?</span>
              </div>

              {/* Title */}
              <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-slate-900 tracking-tight leading-[1.15] mb-4">
                Frequently Asked <br />
                <span className="text-orange-600">
                  Questions
                </span> ❓
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
                Everything you need to know about our daily tiffin mess, meal skipping, instant orders, and refunds.
              </p>

              {/* Interactive Help & Live Support Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 font-bold">
                      💬
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Need personal help?</h4>
                      <p className="text-[11px] text-slate-500">Support desk is active</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200 shadow-2xs">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                    Live
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-5">
                  Have a custom mess plan request or question about delivery coverage? We are just a message away.
                </p>

                <div className="space-y-2.5">
                  <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat on WhatsApp</span>
                  </a>

                  <Link
                    to="/support"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-slate-600" />
                    <span>Open Help Center & FAQs</span>
                  </Link>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Search + Category Filters + Interactive Accordions */}
            <div className="lg:col-span-8">

              {/* Search Bar */}
              <div className="relative mb-5">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search questions (e.g. skip meal, pause plan, UPI, delivery time...)"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none text-sm text-slate-900 placeholder:text-slate-400 shadow-xs transition-all"
                />
                {faqSearch && (
                  <button
                    onClick={() => setFaqSearch('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
                {faqCategories.map((cat) => {
                  const isActive = faqCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setFaqCategory(cat.id)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${isActive
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 scale-102'
                          : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-2xs'
                        }`}
                    >
                      {cat.icon && <span>{cat.icon}</span>}
                      <span>{cat.label}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Accordion Cards */}
              <div className="space-y-3.5">
                {filteredFaqs.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm">
                    <p className="text-3xl mb-2">🔍</p>
                    <h4 className="font-bold text-slate-800 text-base mb-1">No matching questions found</h4>
                    <p className="text-slate-500 text-xs mb-4">Try searching with a different keyword or reset filters.</p>
                    <button
                      onClick={() => { setFaqSearch(''); setFaqCategory('all'); }}
                      className="px-4 py-2 rounded-full bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors cursor-pointer"
                    >
                      Reset Search & Filters
                    </button>
                  </div>
                ) : (
                  filteredFaqs.map((faq) => {
                    const isOpen = openFaq === faq.id;
                    return (
                      <div
                        key={faq.id}
                        className={`rounded-2xl sm:rounded-3xl transition-all duration-300 overflow-hidden ${isOpen
                            ? 'bg-white border-2 border-orange-500 shadow-md ring-4 ring-orange-100'
                            : 'bg-white hover:bg-white border border-slate-200 hover:border-orange-200 shadow-2xs hover:shadow-md'
                          }`}
                      >
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                          className="w-full px-5 sm:px-6 py-4.5 sm:py-5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-3.5 sm:gap-4 flex-1">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-2xs ${isOpen ? 'bg-orange-50 border border-orange-200 text-orange-700' : 'bg-slate-50 border border-slate-200 text-slate-700'
                              }`}>
                              {faq.icon}
                            </div>
                            <div>
                              <div className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                {faq.tag}
                              </div>
                              <h3 className={`text-sm sm:text-base font-bold transition-colors leading-snug ${isOpen ? 'text-orange-600 font-extrabold' : 'text-slate-800 group-hover:text-orange-600'
                                }`}>
                                {faq.q}
                              </h3>
                            </div>
                          </div>

                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 ${isOpen
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
                              <div className="ml-[52px] sm:ml-[56px] p-3 rounded-xl bg-orange-50 border border-orange-200/70 flex items-start gap-2.5 text-xs text-orange-900 font-medium">
                                <Sparkles className="w-3.5 h-3.5 text-orange-600 flex-shrink-0 mt-0.5" />
                                <span>{faq.tip}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;