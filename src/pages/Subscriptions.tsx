import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Star, ShieldCheck, ChevronDown, ChevronUp, Plus, Tag, Sparkles, HelpCircle, MessageCircle, Leaf, UtensilsCrossed, Bike, MapPin, Clock, CalendarDays, ChefHat, RotateCcw, HeartHandshake, Percent, Award, ThumbsUp, Quote, Flame, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const weeklyMenu: Record<string, { breakfast: string; lunch: string; dinner: string }> = {
  Mon: { breakfast: 'Aloo Paratha + Curd + Chai', lunch: 'Dal Makhani + Jeera Rice + 3 Roti + Salad', dinner: 'Paneer Butter Masala + Rice + 3 Roti' },
  Tue: { breakfast: 'Poha + Boiled Eggs + Juice', lunch: 'Chole Masala + Puri + Raita', dinner: 'Kadhai Paneer + Dal Fry + 3 Roti' },
  Wed: { breakfast: 'Idli Sambar + Coconut Chutney', lunch: 'Chicken Curry / Mix Veg + Rice + 3 Roti', dinner: 'Veg Hakka Noodles + Manchurian' },
  Thu: { breakfast: 'Bread Butter + Omelette + Chai', lunch: 'Rajma Rice + Papad + Pickle', dinner: 'Chicken Tikka Masala + Rice + 3 Roti' },
  Fri: { breakfast: 'Upma + Fruit Bowl + Juice', lunch: 'Dal Tadka + Jeera Rice + Sabji + 3 Roti', dinner: 'Veg Biryani + Raita + Salan' },
  Sat: { breakfast: 'Chole Bhature + Lassi', lunch: 'Pav Bhaji + Butter Pav', dinner: 'Egg Curry / Palak Paneer + Rice + Roti' },
  Sun: { breakfast: 'Puri Sabji + Halwa + Chai', lunch: 'Special Sunday Thali (Chef\'s Choice)', dinner: 'Butter Chicken / Mix Veg + Naan + Gulab Jamun 🎉' },
};

const extraItems = [
  { name: 'Extra Roti (2)', original: 15, img: 'https://images.pexels.com/photos/10860591/pexels-photo-10860591.jpeg?auto=compress&cs=tinysrgb&w=150' },
  { name: 'Extra Paneer', original: 45, img: 'https://images.pexels.com/photos/9738981/pexels-photo-9738981.jpeg?auto=compress&cs=tinysrgb&w=150' },
  { name: 'Gulab Jamun', original: 30, img: 'https://images.pexels.com/photos/13435133/pexels-photo-13435133.jpeg?auto=compress&cs=tinysrgb&w=150' },
  { name: 'Fresh Curd', original: 20, img: 'https://images.pexels.com/photos/4113888/pexels-photo-4113888.jpeg?auto=compress&cs=tinysrgb&w=150' },
  { name: 'Sweet Lassi', original: 35, img: 'https://images.pexels.com/photos/10153303/pexels-photo-10153303.jpeg?auto=compress&cs=tinysrgb&w=150' },
  { name: 'Boiled Eggs (2)', original: 25, img: 'https://images.pexels.com/photos/824635/pexels-photo-824635.jpeg?auto=compress&cs=tinysrgb&w=150' },
];

const allExtraItems = [
  ...extraItems,
  { name: 'Mango Shake', original: 50, img: 'https://images.pexels.com/photos/3625372/pexels-photo-3625372.jpeg?auto=compress&cs=tinysrgb&w=150' },
  { name: 'Jeera Rice', original: 40, img: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=150' },
  { name: 'Papad (2)', original: 10, img: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=150' },
  { name: 'Achar / Pickle', original: 10, img: 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=150' },
  { name: 'Butter Naan', original: 25, img: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=150' },
  { name: 'Fruit Salad', original: 55, img: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=150' },
];

const Subscriptions = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'semester'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeDay, setActiveDay] = useState('Mon');
  const [showAllExtras, setShowAllExtras] = useState(false);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const [selectedPlanModal, setSelectedPlanModal] = useState<{ name: string; price: number; meals: string } | null>(null);

  const handleAddItem = (name: string) => {
    setAddedItems(prev => ({ ...prev, [name]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [name]: false }));
    }, 1800);
  };

  const getPrice = (base: number) => billingCycle === 'semester' ? Math.round(base * 0.85) : base;
  const getDiscounted = (price: number) => Math.round(price * 0.95);

  const faqs = [
    {
      id: 0,
      icon: '🍱',
      tag: 'Subscription',
      q: 'How does the mess subscription work?',
      a: 'Choose your preferred Basic (1 meal), Standard (2 meals), or Premium (3 meals) plan, complete your online checkout, and fresh home-cooked meals will be delivered daily directly to your doorstep on your chosen time slots.',
      tip: 'Flexible delivery time slots available for lunch (12:00–1:30 PM) and dinner (7:30–9:00 PM).'
    },
    {
      id: 1,
      icon: '⏭️',
      tag: 'Skip Meal',
      q: 'Can I skip an upcoming meal if I am eating out?',
      a: 'Yes! You can easily skip any meal directly from the app before the daily cutoff time (10 AM for Lunch, 5 PM for Dinner). The credited amount is automatically saved to your wallet.',
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

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const menu = weeklyMenu[activeDay];

  return (
    <div className="min-h-screen bg-orange-50/20">

      {/* ── HERO SECTION (MATCHING REFERENCE MOCKUP & COLOR THEME) ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FAF5EC] to-orange-50/25 pt-8 sm:pt-12 pb-12 sm:pb-16 text-slate-900 border-b border-orange-100/70">
        {/* Ambient Decorative Glows */}
        <div className="absolute -top-28 -left-28 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 -right-16 w-96 h-96 bg-orange-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-4 left-1/3 w-80 h-80 bg-rose-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Playful Floating Accent Emojis */}
        <div className="absolute top-10 left-8 text-2xl opacity-60 animate-bounce-gentle select-none pointer-events-none hidden md:block">
          🌿
        </div>
        <div className="absolute top-20 right-[46%] text-xl opacity-40 animate-pulse select-none pointer-events-none hidden lg:block">
          ✨
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-8 lg:gap-10 items-center">
            
            {/* Left Column: Content (Below image on mobile < 768px; left on tablet & desktop >= 768px) */}
            <div className="md:col-span-7 pt-2 pb-4 text-left order-2 md:order-1">
              
              {/* Top Pill Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs sm:text-sm font-semibold shadow-xs mb-5 transition-transform hover:scale-105 select-none">
                <span className="text-base leading-none">🌿</span>
                <span>Healthy • Fresh • Homemade</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12] mb-4">
                Mess &amp; Instant Order
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500">
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
                  className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-amber-50/70 hover:bg-amber-100/60 border border-amber-200/80 hover:border-amber-400/80 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100/90 text-amber-700 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform">
                      <UtensilsCrossed className="w-6 h-6 text-amber-600" />
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
                  className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-orange-50/70 hover:bg-orange-100/60 border border-orange-200/80 hover:border-orange-400/80 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-100/90 text-orange-600 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform">
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
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-white font-bold text-base shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all duration-300 group"
                >
                  <span>Explore Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>

                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-emerald-100/90 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
                    <MapPin className="w-5 h-5 text-emerald-600 animate-bounce-gentle" />
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
                  <div className="w-8 h-8 rounded-xl bg-emerald-100/80 flex items-center justify-center text-emerald-600 shrink-0">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-700">Fresh &amp; Hygienic Food</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100/80 flex items-center justify-center text-amber-600 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-700">Timely Delivery</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100/80 flex items-center justify-center text-blue-600 shrink-0">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-700">Easy Subscription &amp; Management</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-100/80 flex items-center justify-center text-orange-600 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-700">Safe &amp; Secure Payments</span>
                </div>
              </div>

            </div>

            {/* Right Column: Visual Composite (First on mobile < 768px; right on tablet & desktop >= 768px) */}
            <div className="md:col-span-5 relative flex items-center justify-center md:justify-end mt-2 md:mt-0 order-1 md:order-2 mb-4 md:mb-0">
              {/* Ambient Back Glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-amber-400/20 via-orange-400/15 to-emerald-400/15 rounded-[3rem] blur-2xl -z-10" />

              {/* Main Visual Container */}
              <div className="relative p-2 sm:p-2.5 bg-gradient-to-tr from-amber-200/60 via-white/95 to-orange-200/60 backdrop-blur-md rounded-[2.25rem] sm:rounded-[2.75rem] shadow-[0_20px_50px_rgba(234,88,12,0.15)] border border-white/90 transition-transform duration-500 hover:scale-[1.01] group">
                <div className="relative overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem] bg-gradient-to-b from-[#FAF4EC] to-[#F3E8D8]">
                  <img
                    src="/hero-mess-visual.jpg"
                    alt="Mess Plans & Instant Order"
                    className="w-full max-w-[500px] h-auto object-cover select-none drop-shadow-md transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>

                {/* Floating Badge 1: 100% Homestyle Taste */}
                <div className="absolute -top-3 left-4 sm:left-6 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg shadow-orange-500/10 border border-amber-100 flex items-center gap-2 animate-bounce-gentle">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800">
                    100% Homestyle Taste
                  </span>
                </div>

                {/* Floating Badge 2: Express Delivery */}
                <div className="absolute -bottom-3 right-4 sm:right-6 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg shadow-orange-500/10 border border-orange-100 flex items-center gap-1.5 animate-bounce-gentle" style={{ animationDelay: '1s' }}>
                  <span className="text-sm">⚡</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800">
                    25 Min Express
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── WHY CUSTOMERS LOVE US ✨ (PREMIUM REDESIGN) ─────────── */}
      <section className="relative py-20 lg:py-24 bg-gradient-to-b from-white via-orange-50/25 to-white overflow-hidden">
        {/* Subtle Ambient Background Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[48rem] h-[24rem] bg-gradient-to-r from-orange-200/20 via-amber-200/20 to-rose-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute -bottom-10 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100/80 border border-orange-200/80 text-orange-700 text-xs sm:text-sm font-bold shadow-xs mb-4">
              <Sparkles className="w-4 h-4 text-orange-500 animate-spin-slow" />
              <span>UNMATCHED QUALITY &amp; PEACE OF MIND</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Why Customers{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500">
                Love Us ✨
              </span>
            </h2>

            <p className="text-slate-600 text-base sm:text-lg font-normal leading-relaxed">
              Chef-crafted homestyle recipes, absolute skipping freedom, and strict hygiene standards designed for students and working professionals.
            </p>

            {/* Social Proof Mini Bar */}
            <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-4 py-2 px-5 rounded-2xl bg-white/90 backdrop-blur-md border border-orange-100/80 shadow-xs">
              <div className="flex -space-x-2">
                <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=80" alt="Customer" />
                <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=80" alt="Customer" />
                <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=80" alt="Customer" />
                <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=80" alt="Customer" />
              </div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700">
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span><strong className="text-slate-900">4.9/5</strong> (2,500+ happy subscribers)</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>FSSAI Certified Kitchens</span>
              </div>
            </div>
          </div>

          {/* 4 Feature Bento Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
            
            {/* Card 1: Fresh Daily */}
            <div className="group relative bg-white rounded-3xl p-6 border border-orange-100/80 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:scale-110 transition-transform">
                    <ChefHat className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 border border-orange-200/70 px-2.5 py-1 rounded-full">
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
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Light, digestible &amp; healthy</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Daily rotating 7-day menu</span>
                </div>
              </div>
            </div>

            {/* Card 2: Skip Anytime */}
            <div className="group relative bg-white rounded-3xl p-6 border border-amber-100/80 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                    <RotateCcw className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 rounded-full">
                    Instant Credit
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                  Skip Anytime
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Going out or traveling? Skip any meal with 1 tap before daily cutoff time. Money is saved to your wallet.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>100% money credited back</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Zero cancellation penalties</span>
                </div>
              </div>
            </div>

            {/* Card 3: Diet Friendly */}
            <div className="group relative bg-white rounded-3xl p-6 border border-rose-100/80 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/25 group-hover:scale-110 transition-transform">
                    <HeartHandshake className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200/70 px-2.5 py-1 rounded-full">
                    Separate Prep
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-rose-600 transition-colors">
                  Diet-Friendly
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Dedicated cooking areas for Pure Vegetarian, Jain (no onion-garlic), and High-Protein fitness meals.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Strict Jain &amp; Veg segregation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Customizable spice levels</span>
                </div>
              </div>
            </div>

            {/* Card 4: VIP Subscriber Perks */}
            <div className="group relative bg-white rounded-3xl p-6 border border-purple-100/80 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform">
                    <Percent className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200/70 px-2.5 py-1 rounded-full">
                    VIP Savings
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">
                  5% Extra Discount
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Active subscribers automatically save flat 5% to 10% on rolls, burgers, and beverages from the food menu.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Instant checkout discount</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Priority express delivery</span>
                </div>
              </div>
            </div>

          </div>

          {/* Trust Metrics Strip */}
          <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-orange-500/20 mb-14">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-white/20">
              <div className="pt-2 md:pt-0">
                <div className="text-3xl sm:text-4xl font-extrabold mb-1">50,000+</div>
                <div className="text-xs sm:text-sm text-orange-100 font-medium">Tiffins Delivered</div>
              </div>
              <div className="pt-4 md:pt-0">
                <div className="text-3xl sm:text-4xl font-extrabold mb-1">98.8%</div>
                <div className="text-xs sm:text-sm text-orange-100 font-medium">On-Time Delivery Rate</div>
              </div>
              <div className="pt-4 md:pt-0">
                <div className="text-3xl sm:text-4xl font-extrabold mb-1">100%</div>
                <div className="text-xs sm:text-sm text-orange-100 font-medium">Skipped Meal Refunds</div>
              </div>
              <div className="pt-4 md:pt-0">
                <div className="text-3xl sm:text-4xl font-extrabold mb-1">4.9 ★</div>
                <div className="text-xs sm:text-sm text-orange-100 font-medium">From 2,500+ Reviews</div>
              </div>
            </div>
          </div>

          {/* Verified Customer Quotes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Review 1 */}
            <div className="bg-white rounded-3xl p-6 border border-orange-100/70 shadow-sm hover:shadow-md transition-shadow relative">
              <Quote className="w-8 h-8 text-orange-200 absolute top-5 right-5" />
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed italic mb-5">
                "The food genuinely tastes just like wholesome home-cooked meals! The best feature is skipping a meal with 1 tap — whenever I eat out on weekends, the refund is instantly credited back to my wallet."
              </p>
              <div className="flex items-center gap-3">
                <img className="w-10 h-10 rounded-full object-cover border border-orange-200" src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100" alt="Pooja S." />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Pooja Sharma</h4>
                  <p className="text-slate-500 text-xs">BIT Mesra Hostel • Standard Plan</p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white rounded-3xl p-6 border border-orange-100/70 shadow-sm hover:shadow-md transition-shadow relative">
              <Quote className="w-8 h-8 text-orange-200 absolute top-5 right-5" />
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed italic mb-5">
                "Hygiene and packaging are unmatched. The stainless steel tiffin container keeps dal and rotis piping hot, and delivery is always on time. Perfect for working professionals!"
              </p>
              <div className="flex items-center gap-3">
                <img className="w-10 h-10 rounded-full object-cover border border-orange-200" src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100" alt="Rahul V." />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Rahul Verma</h4>
                  <p className="text-slate-500 text-xs">Software Engineer • Premium Plan</p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white rounded-3xl p-6 border border-orange-100/70 shadow-sm hover:shadow-md transition-shadow relative">
              <Quote className="w-8 h-8 text-orange-200 absolute top-5 right-5" />
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed italic mb-5">
                "The Jain meal option is a lifesaver. Pure vegetarian, strictly without onion or garlic, yet full of authentic flavour and very light on digestion."
              </p>
              <div className="flex items-center gap-3">
                <img className="w-10 h-10 rounded-full object-cover border border-orange-200" src="https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=100" alt="Aditi D." />
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
      <section id="menu" className="py-20 lg:py-24 bg-gradient-to-b from-orange-50/20 via-white to-orange-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-200/80 text-amber-800 text-xs font-bold uppercase tracking-wider mb-3.5">
              <span>🍳 FRESH ROTATING DAILY MENU</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
              Weekly Menu <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500">Preview 🍱</span>
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Check out what’s cooking before you subscribe. Prepared fresh twice daily with pure homestyle love.
            </p>
          </div>

          {/* Day Selector Tabs */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-orange-200/80 shadow-sm overflow-x-auto max-w-full scrollbar-hide gap-1.5">
              {days.map(day => {
                const isActive = activeDay === day;
                return (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={`px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 text-white shadow-md shadow-orange-500/20 scale-105'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-orange-50'
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
                border: 'border-orange-100',
                badge: 'bg-orange-100 text-orange-800',
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
                border: 'border-amber-100',
                badge: 'bg-amber-100 text-amber-800',
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
                border: 'border-rose-100',
                badge: 'bg-rose-100 text-rose-800',
                value: menu.dinner,
                img: activeDay === 'Wed'
                  ? 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=600'
                  : 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=600',
              },
            ].map((meal, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-orange-100/90 overflow-hidden hover:-translate-y-1.5 transition-all duration-300 shadow-md hover:shadow-xl flex flex-col justify-between group"
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
                    
                    <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-slate-800 text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                      {meal.diet}
                    </span>

                    <span className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20">
                      ⏱️ {meal.time}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
                        {meal.tag}
                      </span>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
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
                  <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Insulated Tiffin Box
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

      {/* ── 2. HOW IT WORKS (ORDERED NATURALLY BEFORE PRICING) ─── */}
      <section className="py-20 lg:py-24 bg-white border-y border-orange-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 border border-orange-200/80 text-orange-700 text-xs font-bold uppercase tracking-wider mb-3.5">
              <span>🚀 SEAMLESS 3-STEP EXPERIENCE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
              How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500">Works 🚀</span>
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
                color: 'from-orange-500 to-amber-500',
              },
              {
                step: '02',
                icon: '🔄',
                title: 'Customize or Skip',
                desc: 'Inspect tomorrow’s menu in advance. Skip any meal with 1 tap before daily cutoff and get 100% wallet refund.',
                badge: 'Zero Food Waste',
                color: 'from-emerald-500 to-teal-500',
              },
              {
                step: '03',
                icon: '🛵',
                title: 'Enjoy Fresh Food',
                desc: 'Piping hot, delicious home food arrives right at your room or PG doorstep on scheduled delivery slots.',
                badge: 'On-Time Always',
                color: 'from-rose-500 to-pink-500',
              },
            ].map((s, i) => (
              <div
                key={i}
                className="relative z-10 bg-gradient-to-b from-orange-50/30 to-white p-8 rounded-3xl border border-orange-100/80 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-4xl">{s.icon}</span>
                    <span className="text-xs font-extrabold text-slate-400 bg-white px-3 py-1 rounded-full border border-orange-100 shadow-2xs">
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

                <div className="pt-4 border-t border-orange-100/70 text-xs font-bold text-orange-600">
                  {s.badge}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 3. CHOOSE YOUR MESS PLAN (UPGRADED PRICING) ─────────── */}
      <section id="pricing" className="py-20 lg:py-24 bg-gradient-to-b from-orange-50/25 via-amber-50/15 to-white scroll-mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200/80 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3.5">
              <span>💳 TRANSPARENT PRICING • NO HIDDEN FEES</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
              Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500">Mess Plan 🍱</span>
            </h2>
            <p className="text-slate-600 text-base sm:text-lg mb-8">
              Flexible meal passes for students &amp; working professionals. Pause, upgrade, or skip anytime.
            </p>

            {/* Monthly vs Semester Switcher */}
            <div className="inline-flex items-center bg-white p-1.5 rounded-2xl border border-orange-200/90 shadow-md">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-7 py-3 rounded-xl font-bold text-sm transition-all duration-300 cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Plan
              </button>
              <button
                onClick={() => setBillingCycle('semester')}
                className={`px-7 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  billingCycle === 'semester'
                    ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Semester Pass</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold uppercase tracking-wider">
                  Save 15%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid lg:grid-cols-3 gap-8 items-center max-w-6xl mx-auto mb-12">
            
            {/* 1. Basic Plan */}
            <div className="bg-white border border-orange-100/90 shadow-lg rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-1">Basic</h3>
                <p className="text-orange-600 font-semibold text-sm mb-4">1 Meal / Day (Lunch or Dinner)</p>
                
                <div className="text-4xl font-extrabold text-slate-900 mb-1">
                  ₹{getPrice(2499)}
                  <span className="text-base font-normal text-slate-400">/mo</span>
                </div>
                {billingCycle === 'semester' && (
                  <p className="text-emerald-600 text-xs font-bold mb-3">You save ₹{2499 - getPrice(2499)}/month!</p>
                )}

                <hr className="my-6 border-slate-100" />
                
                <ul className="space-y-3 mb-8">
                  {[
                    'Lunch or Dinner daily (you choose)',
                    'Full Weekly Menu Access',
                    '2 Skips / Month with 100% Refund',
                    '5% OFF on Extra Instant Orders',
                    'Standard Tiffin Packaging',
                  ].map((f, i) => (
                    <li key={i} className="flex items-start text-sm text-slate-600">
                      <span className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 text-xs text-emerald-600 font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setSelectedPlanModal({ name: 'Basic (1 Meal/day)', price: getPrice(2499), meals: '1 Meal/day (Lunch or Dinner)' })}
                className="w-full py-3.5 rounded-2xl font-bold bg-slate-100 text-slate-800 hover:bg-orange-50 hover:text-orange-600 transition-all cursor-pointer"
              >
                Get Basic Plan
              </button>
            </div>

            {/* 2. Standard Plan (Most Popular) */}
            <div className="relative bg-white border-2 border-orange-500 shadow-2xl rounded-3xl p-9 lg:scale-105 z-10 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between h-full">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 text-white px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 fill-white text-white" /> Most Popular
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-2 mb-1">Standard</h3>
                <p className="text-orange-600 font-bold text-sm mb-4">2 Meals / Day (Lunch + Dinner)</p>
                
                <div className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 mb-1">
                  ₹{getPrice(4299)}
                  <span className="text-base font-normal text-slate-400">/mo</span>
                </div>
                {billingCycle === 'semester' && (
                  <p className="text-emerald-600 text-xs font-bold mb-3">You save ₹{4299 - getPrice(4299)}/month!</p>
                )}

                <hr className="my-6 border-slate-100" />
                
                <ul className="space-y-3.5 mb-8">
                  {[
                    'Both Lunch & Dinner included daily',
                    'Full Premium Rotating Menu',
                    'Unlimited Skips with Wallet Refunds',
                    'Sunday Special Feasts Included 🎉',
                    '5% OFF on Extra Instant Orders',
                    'Piping Hot Insulated Tiffin Box',
                  ].map((f, i) => (
                    <li key={i} className="flex items-start text-sm text-slate-700 font-medium">
                      <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 text-xs text-orange-600 font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setSelectedPlanModal({ name: 'Standard (2 Meals/day)', price: getPrice(4299), meals: 'Lunch + Dinner Daily' })}
                className="w-full py-4 rounded-2xl font-extrabold bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700 shadow-xl shadow-orange-500/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                Subscribe Standard Plan 🔥
              </button>
            </div>

            {/* 3. Premium Plan */}
            <div className="bg-white border border-orange-100/90 shadow-lg rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-1">Premium</h3>
                <p className="text-orange-600 font-semibold text-sm mb-4">3 Meals / Day + Evening Snacks</p>
                
                <div className="text-4xl font-extrabold text-slate-900 mb-1">
                  ₹{getPrice(5999)}
                  <span className="text-base font-normal text-slate-400">/mo</span>
                </div>
                {billingCycle === 'semester' && (
                  <p className="text-emerald-600 text-xs font-bold mb-3">You save ₹{5999 - getPrice(5999)}/month!</p>
                )}

                <hr className="my-6 border-slate-100" />
                
                <ul className="space-y-3 mb-8">
                  {[
                    'Breakfast + Lunch + Dinner + Evening Snacks',
                    'Priority Doorstep Express Delivery',
                    'Free Weekly Desserts & Shakes',
                    'Dedicated VIP Support Manager',
                    'Unlimited Skips with Wallet Roll-Over',
                    '10% OFF on Extra Instant Orders',
                  ].map((f, i) => (
                    <li key={i} className="flex items-start text-sm text-slate-600">
                      <span className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 text-xs text-emerald-600 font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setSelectedPlanModal({ name: 'Premium (3 Meals + Snacks)', price: getPrice(5999), meals: 'Breakfast + Lunch + Dinner + Snacks' })}
                className="w-full py-3.5 rounded-2xl font-bold bg-slate-100 text-slate-800 hover:bg-orange-50 hover:text-orange-600 transition-all cursor-pointer"
              >
                Get Premium Plan
              </button>
            </div>

          </div>

          {/* 3-Day Tasting Guarantee Banner */}
          <div className="max-w-2xl mx-auto text-center p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 shadow-2xs">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span><strong>3-Day Tasting Guarantee:</strong> If you don't love the food in your first 3 days, get a 100% refund on unconsumed meals!</span>
          </div>

        </div>
      </section>

      {/* ── 4. CRAVING SOMETHING EXTRA? (5% SUBSCRIBER DISCOUNT) ── */}
      <section className="py-20 lg:py-24 bg-white border-t border-orange-100/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2 rounded-2xl shadow-md shadow-emerald-500/20 mb-6">
              <span className="text-lg">🎉</span>
              <span className="font-extrabold text-xs uppercase tracking-wider">Subscriber Perk: Flat 5% OFF on Instant Orders</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
              Craving Something <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-rose-500">Extra? 🤤</span>
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Add extra rotis, fresh paneer, sweet desserts, or refreshing shakes to your daily tiffin with 1 tap.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
            {(showAllExtras ? allExtraItems : extraItems).map((item, i) => {
              const discounted = getDiscounted(item.original);
              const isAdded = !!addedItems[item.name];

              return (
                <div
                  key={i}
                  className="bg-white p-4 rounded-3xl border border-orange-100/90 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all text-center group relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-xl z-10">
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
                      <span className="bg-emerald-50 text-emerald-700 text-xs font-extrabold px-2 py-0.5 rounded-lg">
                        ₹{discounted}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddItem(item.name)}
                    className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      isAdded
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                        : 'bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-600'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Added!
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" /> Add
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* See More Toggle */}
          <div className="text-center mt-10">
            <button
              onClick={() => setShowAllExtras(!showAllExtras)}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 font-bold rounded-2xl shadow-xs transition-all cursor-pointer"
            >
              {showAllExtras ? (
                <>
                  <ChevronUp className="w-4 h-4" /> Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" /> View All Extra Items ({allExtraItems.length - extraItems.length} more)
                </>
              )}
            </button>
          </div>

        </div>
      </section>

      {/* ── 5. WE DELIVER ACROSS CAMPUSES & HOSTELS ─────────────── */}
      <section className="py-20 lg:py-24 bg-gradient-to-b from-orange-50/20 via-white to-orange-50/20 border-t border-orange-100/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200/80 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-4">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>ACTIVE DELIVERY COVERAGE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Serving Campuses &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500">Hostels 📍</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mb-10 max-w-xl mx-auto">
            Daily meal runs are active across major educational institutes, student hostels, and working PG hubs.
          </p>

          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-orange-100/90 shadow-md">
            
            {/* Live Status Indicator */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Daily Delivery Active: Lunch (12:00–1:30 PM) • Dinner (7:30–9:00 PM)</span>
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
                  className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-100 text-slate-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
                >
                  <span className="text-emerald-600">✓</span> {loc}
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
      <section className="py-20 lg:py-24 bg-[#FAF7F2] border-t border-orange-100/60 relative overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-orange-200/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/90 border border-amber-200/90 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>GOT QUESTIONS? WE HAVE ANSWERS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
              Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500">Questions</span> ❓
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
                      ? 'bg-white border-2 border-amber-400 shadow-xl shadow-amber-500/10 ring-4 ring-amber-100/50'
                      : 'bg-white/95 hover:bg-white border border-slate-200/80 hover:border-amber-300 shadow-2xs hover:shadow-md'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full px-5 sm:px-6 py-4.5 sm:py-5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 sm:gap-4 flex-1">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-2xs ${
                        isOpen ? 'bg-amber-100 border border-amber-300/80 text-amber-700' : 'bg-orange-50/80 border border-orange-100 text-orange-600'
                      }`}>
                        {faq.icon}
                      </div>
                      <div>
                        <div className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          {faq.tag}
                        </div>
                        <h3 className={`text-sm sm:text-base font-bold transition-colors leading-snug ${
                          isOpen ? 'text-amber-950 font-extrabold' : 'text-slate-800 group-hover:text-amber-600'
                        }`}>
                          {faq.q}
                        </h3>
                      </div>
                    </div>

                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                      isOpen
                        ? 'bg-amber-500 text-white rotate-180 shadow-sm'
                        : 'bg-slate-100 text-slate-400 group-hover:bg-amber-100 group-hover:text-amber-700'
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-1 animate-fade-in border-t border-amber-100/80">
                      <p className="text-slate-600 text-sm sm:text-[15px] leading-relaxed mb-3.5 pl-[52px] sm:pl-[56px]">
                        {faq.a}
                      </p>
                      {faq.tip && (
                        <div className="ml-[52px] sm:ml-[56px] p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 flex items-start gap-2.5 text-xs text-amber-900 font-medium">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
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
          <div className="mt-10 p-5 rounded-2xl bg-white border border-amber-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
            >
              <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
            </a>
          </div>

        </div>
      </section>

      {/* ── 7. APP DOWNLOAD BANNER ─────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-orange-600 via-amber-600 to-rose-600 rounded-3xl p-10 md:p-16 overflow-hidden relative shadow-xl shadow-orange-500/15">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-yellow-400/20 rounded-full blur-[60px] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-white text-sm font-bold mb-6">
                  📱 Available on iOS &amp; Android
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
                  Manage Everything<br />From the App
                </h2>
                <p className="text-white/90 text-lg mb-8 leading-relaxed">
                  Skip meals with 1 tap, inspect daily rotating menus, order extra sides, track delivery live, and check your wallet balance.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button className="flex items-center justify-center gap-3 bg-slate-950 text-white px-6 py-4 rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-lg cursor-pointer">
                    <span className="text-2xl">🍎</span>
                    <div className="text-left">
                      <p className="text-[10px] font-medium text-slate-400 leading-none">Download on the</p>
                      <p className="text-base font-extrabold leading-none mt-0.5">App Store</p>
                    </div>
                  </button>
                  <button className="flex items-center justify-center gap-3 bg-slate-950 text-white px-6 py-4 rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-lg cursor-pointer">
                    <span className="text-2xl">▶️</span>
                    <div className="text-left">
                      <p className="text-[10px] font-medium text-slate-400 leading-none">Get it on</p>
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
                  <div key={i} className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-3 border border-white/10">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-orange-100 relative">
            <button
              onClick={() => setSelectedPlanModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3 text-2xl shadow-inner">
                🍱
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-1">
                {selectedPlanModal.name}
              </h3>
              <p className="text-xs font-semibold text-orange-600">
                {selectedPlanModal.meals}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-100 mb-6 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Billing Frequency:</span>
                <span className="font-bold text-slate-900 uppercase text-xs">{billingCycle}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Plan Price:</span>
                <span className="font-extrabold text-slate-900 text-base">₹{selectedPlanModal.price}/mo</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold text-xs pt-1 border-t border-orange-200/60">
                <span>Trial Guarantee:</span>
                <span>3-Day Tasting Refund Protection</span>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href={`https://wa.me/919876543210?text=Hi%20Bitez%2C%20I%20want%20to%20subscribe%20to%20the%20${encodeURIComponent(selectedPlanModal.name)}%20at%20%E2%82%B9${selectedPlanModal.price}%2Fmo`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-center block shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600 transition-all cursor-pointer"
              >
                Confirm on WhatsApp Booking 💬
              </a>
              <button
                onClick={() => setSelectedPlanModal(null)}
                className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Close &amp; Compare Other Plans
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Subscriptions;