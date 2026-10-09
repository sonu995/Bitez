import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Plus, Minus, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Clock, ArrowRight, ShieldCheck, Utensils, Leaf, MapPin, Zap, HelpCircle, MessageCircle, Search, Phone, SlidersHorizontal, Grid, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

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

  const messPlans = [
    { name: 'Basic', meals: '1 Meal/Day', duration: 'Monthly', price: 1200, features: ['Choose Lunch or Dinner', 'Skip up to 3 meals/month', 'Pause anytime', 'Delivery 12–1 PM or 7–8 PM'] },
    { name: 'Standard', meals: '2 Meals/Day', duration: 'Monthly', price: 2200, popular: true, features: ['Lunch + Dinner included', 'Skip up to 5 meals/month', 'Pause anytime', 'Priority delivery'] },
    { name: 'Premium', meals: '3 Meals/Day', duration: 'Monthly', price: 3000, features: ['Breakfast + Lunch + Dinner', 'Unlimited skips', 'Pause & resume anytime', 'Priority delivery + Weekend specials'] },
  ];

  const todaysMenu = {
    breakfast: { emoji: '🥪', items: 'Grilled Sandwich + Hot Masala Chai' },
    lunch: { emoji: '🍚', items: 'Basmati Rice + Dal Tadka + Seasonal Sabji + 4 Butter Rotis' },
    dinner: { emoji: '🍲', items: 'Jeera Rice + Dal Fry + Shahi Paneer + 4 Soft Rotis' },
  };

  const foodItems = [
    { id: '1', name: 'Crispy Chicken Burger', price: 120, originalPrice: 150, rating: 4.5, reviewsCount: '340+', image: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=500', category: 'burgers', isVeg: false, restaurant: 'Quick Bites', prepTime: '20-25 mins', tag: 'Bestseller 🔥' },
    { id: '2', name: 'Aloo Tikki Veg Burger', price: 90, originalPrice: 110, rating: 4.3, reviewsCount: '210+', image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=500', category: 'burgers', isVeg: true, restaurant: 'Quick Bites', prepTime: '15-20 mins', tag: 'Must Try ⭐' },
    { id: '3', name: 'Paneer Tikka Roll', price: 80, originalPrice: 100, rating: 4.4, reviewsCount: '180+', image: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=500', category: 'rolls', isVeg: true, restaurant: 'Roll Corner', prepTime: '15-20 mins', tag: 'Popular 🌯' },
    { id: '4', name: 'Double Egg Chicken Roll', price: 100, originalPrice: 130, rating: 4.6, reviewsCount: '420+', image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=500', category: 'rolls', isVeg: false, restaurant: 'Roll Corner', prepTime: '20-25 mins', tag: 'Chef Special 👨‍🍳' },
    { id: '5', name: 'Street Style Veg Chowmein', price: 70, originalPrice: 90, rating: 4.2, reviewsCount: '150+', image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=500', category: 'chowmein', isVeg: true, restaurant: 'Chinese Corner', prepTime: '15-20 mins', tag: 'Budget Pick 💰' },
    { id: '6', name: 'Steamed Chicken Momos', price: 80, originalPrice: 100, rating: 4.5, reviewsCount: '390+', image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=500', category: 'momos', isVeg: false, restaurant: 'Momo Hub', prepTime: '15-20 mins', tag: 'Hot & Spicy 🌶️' },
    { id: '7', name: 'Peri Peri Masala Fries', price: 60, originalPrice: 75, rating: 4.1, reviewsCount: '120+', image: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=500', category: 'fries', isVeg: true, restaurant: 'Quick Bites', prepTime: '10-15 mins', tag: 'Crispy Snack 🍟' },
    { id: '8', name: 'Student Combo Meal', price: 150, originalPrice: 199, rating: 4.7, reviewsCount: '510+', image: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=500', category: 'combos', isVeg: false, restaurant: 'Quick Bites', prepTime: '25-30 mins', tag: 'Value Combo 🍱' },
    { id: '9', name: 'Hyderabadi Dum Biryani', price: 180, originalPrice: 220, rating: 4.8, reviewsCount: '620+', image: 'https://images.pexels.com/photos/7394819/pexels-photo-7394819.jpeg?auto=compress&cs=tinysrgb&w=500', category: 'biryani', isVeg: false, restaurant: 'Biryani Express', prepTime: '25-30 mins', tag: 'Top Rated 👑' },
    { id: '10', name: 'Farmhouse Cheesy Pizza', price: 199, originalPrice: 249, rating: 4.6, reviewsCount: '280+', image: 'https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg?auto=compress&cs=tinysrgb&w=500', category: 'pizza', isVeg: true, restaurant: 'Pizza Italia', prepTime: '20-25 mins', tag: 'Cheesy Delight 🍕' },
    { id: '11', name: 'Shahi Special Veg Thali', price: 140, originalPrice: 170, rating: 4.7, reviewsCount: '740+', image: 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=500', category: 'thali', isVeg: true, restaurant: 'Homestyle Kitchen', prepTime: '20-25 mins', tag: 'Homestyle 🍛' },
    { id: '12', name: 'Crispy Butter Masala Dosa', price: 90, originalPrice: 115, rating: 4.5, reviewsCount: '310+', image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=500', category: 'south_indian', isVeg: true, restaurant: 'South Junction', prepTime: '15-20 mins', tag: 'South Classic 🫔' },
    { id: '13', name: 'Butter Chicken with 2 Naan', price: 220, originalPrice: 280, rating: 4.8, reviewsCount: '640+', image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=500', category: 'curries', isVeg: false, restaurant: 'Bitez Kitchen', prepTime: '20-25 mins', tag: 'Top Rated ⭐' },
    { id: '14', name: 'Dal Makhani & Jeera Rice Bowl', price: 130, originalPrice: 160, rating: 4.6, reviewsCount: '320+', image: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=500', category: 'curries', isVeg: true, restaurant: 'Bitez Kitchen', prepTime: '15-20 mins', tag: 'Comfort Food 🍲' },
    { id: '15', name: 'Steamed Idli Sambar (4 Pcs)', price: 70, originalPrice: 90, rating: 4.5, reviewsCount: '230+', image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=500', category: 'south_indian', isVeg: true, restaurant: 'South Junction', prepTime: '10-12 mins', tag: 'Under ₹99 ⚡' },
    { id: '16', name: 'High-Protein Paneer Salad Bowl', price: 130, originalPrice: 160, rating: 4.8, reviewsCount: '310+', image: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=500', category: 'healthy', isVeg: true, restaurant: 'Green Fit Kitchen', prepTime: '10-12 mins', tag: 'Fitness Choice 🥗' },
    { id: '17', name: 'Grilled Herb Chicken Bowl', price: 190, originalPrice: 230, rating: 4.9, reviewsCount: '270+', image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=500', category: 'healthy', isVeg: false, restaurant: 'Green Fit Kitchen', prepTime: '15-20 mins', tag: 'Gym Pro 💪' },
    { id: '18', name: 'Warm Gulab Jamun (2 Pcs)', price: 50, originalPrice: 70, rating: 4.9, reviewsCount: '670+', image: 'https://images.pexels.com/photos/13435133/pexels-photo-13435133.jpeg?auto=compress&cs=tinysrgb&w=500', category: 'desserts', isVeg: true, restaurant: 'Sweet Treats', prepTime: '5 mins', tag: 'Sweet Delight 🍨' },
    { id: '19', name: 'Thick Alphonso Mango Shake', price: 70, originalPrice: 90, rating: 4.8, reviewsCount: '350+', image: 'https://images.pexels.com/photos/3625372/pexels-photo-3625372.jpeg?auto=compress&cs=tinysrgb&w=500', category: 'beverages', isVeg: true, restaurant: 'Coolers & Shakes', prepTime: '5-8 mins', tag: 'Best Chiller 🥭' },
    { id: '20', name: 'Punjabi Sweet Lassi with Malai', price: 55, originalPrice: 75, rating: 4.7, reviewsCount: '310+', image: 'https://images.pexels.com/photos/10153303/pexels-photo-10153303.jpeg?auto=compress&cs=tinysrgb&w=500', category: 'beverages', isVeg: true, restaurant: 'Coolers & Shakes', prepTime: '5 mins', tag: 'Refreshing 🥛' }
  ];

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
      {/* HERO SECTION - TIFFINMATE REFERENCE DESIGN */}
      <section className="relative overflow-hidden bg-[#FAF7F2] pt-8 pb-4 lg:pt-10 lg:pb-6">
        {/* Soft background ambient blurs */}
        <div className="absolute top-0 right-10 w-[500px] h-[500px] bg-amber-200/20 rounded-full blur-3xl pointer-events-none -z-0"></div>
        <div className="absolute top-20 right-48 w-80 h-80 bg-sky-200/20 rounded-full blur-3xl pointer-events-none -z-0"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-6 items-center">
            
            {/* LEFT CONTENT COLUMN (Below image ONLY on mobile < 768px; on left on tablet & desktop >= 768px) */}
            <div className="md:col-span-6 text-center md:text-left order-2 md:order-1">
              {/* Handwritten script badge */}
              <div className="inline-flex flex-col items-center md:items-start mb-3">
                <span className="font-handwritten text-2xl sm:text-3xl text-emerald-950 font-bold tracking-wide">
                  Healthy Food • Fresh Meals • Always On Time
                </span>
                {/* Yellow hand-drawn accent brush underline under 'Healthy Food' */}
                <svg className="w-28 sm:w-32 h-2.5 text-amber-500 fill-none -mt-1" viewBox="0 0 120 10">
                  <path d="M 4 7 Q 60 2 116 6" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black text-slate-900 tracking-tight leading-[1.14] mb-4 sm:mb-5">
                Mess &amp; Instant Order <br />
                All in <span className="text-amber-500">One Place</span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl mx-auto md:mx-0 mb-6 sm:mb-8">
                Get fresh, home-style mess plans for your daily meals and fast instant orders for your cravings — quick, easy and reliable.
              </p>

              {/* THE TWO MAIN ACTION CARDS - DIRECT, CONCISE, ZERO DUPLICATION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-lg mx-auto md:mx-0 mb-6">
                {/* 1. Explore Mess */}
                <button
                  id="hero-explore-mess"
                  onClick={() => navigate('/mess')}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all text-left group cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    🍱
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-extrabold flex items-center justify-between">
                      <span>Mess</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                    <p className="text-[11px] text-white/90 font-medium truncate">Daily Home Thalis @ ₹40</p>
                  </div>
                </button>

                {/* 2. Order Instant Food */}
                <button
                  id="hero-order-food-now"
                  onClick={() => navigate('/menu')}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-white hover:bg-slate-900 text-slate-900 hover:text-white border-2 border-slate-900 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all text-left group cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-amber-100 group-hover:bg-white/20 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    ⚡
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-extrabold flex items-center justify-between">
                      <span>Instant Order</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                    <p className="text-[11px] text-slate-500 group-hover:text-white/80 font-medium truncate">⚡ 25 Min Express</p>
                  </div>
                </button>
              </div>

              {/* SLEEK TRUST BADGES ROW */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2 text-[11px] font-semibold text-slate-600">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>100% Homestyle Taste</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/70">
                  <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span>On-Time Delivery</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200/70">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>FSSAI Certified</span>
                </span>
              </div>
            </div>

            {/* RIGHT COMPOSITE VISUAL COLUMN (First on mobile < 768px, second/right on tablet & desktop >= 768px) */}
            <div className="md:col-span-6 relative flex items-center justify-center pt-2 md:pt-0 order-1 md:order-2 mb-4 sm:mb-6 md:mb-0">
              
              <div className="relative w-full max-w-[620px] group">
                
                {/* 1. Ambient Background Glowing Light Orbs */}
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-amber-400/25 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-orange-400/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
                
                {/* 2. Rotating Decorative Dashed Orbital Shape - constrained to avoid horizontal overflow */}
                <div className="absolute inset-0 sm:-inset-4 border-2 border-dashed border-amber-300/40 rounded-[2.25rem] sm:rounded-[3.75rem] pointer-events-none animate-spin-slow opacity-80" />

                {/* 3. Floating Sparkle Accent */}
                <div className="absolute -top-3 left-1/4 z-30 animate-bounce-gentle pointer-events-none hidden sm:block">
                  <Sparkles className="w-5 h-5 text-amber-400 drop-shadow" />
                </div>

                {/* 4. Main Organic Shaped Container with Glassmorphism Border */}
                <div className="relative p-2 sm:p-3.5 bg-gradient-to-tr from-amber-400/35 via-white/90 to-orange-400/35 backdrop-blur-xl rounded-[2rem] sm:rounded-[3.25rem] lg:rounded-[3.5rem] shadow-[0_25px_60px_-15px_rgba(234,88,12,0.22)] border border-white/90 transition-all duration-700 ease-out group-hover:-translate-y-2 group-hover:shadow-[0_30px_70px_-12px_rgba(234,88,12,0.3)]">
                  
                  {/* Inner Shaped Frame with Soft Food Tint */}
                  <div className="relative overflow-hidden rounded-[1.75rem] sm:rounded-[2.75rem] lg:rounded-[3rem] bg-gradient-to-b from-[#FAF4EC] via-[#F5ECE0] to-[#EFE2D2] aspect-[16/10] sm:aspect-[16/9.5] flex items-center justify-center">
                    
                    {/* Top glass shine effect */}
                    <div className="absolute inset-x-0 top-0 h-20 sm:h-28 bg-gradient-to-b from-white/40 to-transparent pointer-events-none z-10" />

                    {/* High Resolution Bitez Composite Art with smooth zoom on hover */}
                    <img
                      src="/hero-tiffinmate-main.jpg"
                      alt="Bitez - Mess and Instant Order"
                      className="w-full h-full object-cover sm:object-contain transition-transform duration-700 ease-out group-hover:scale-[1.03] select-none filter drop-shadow-md"
                    />

                    {/* Subtle bottom gradient tint */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-amber-950/5 to-transparent pointer-events-none" />
                  </div>

                </div>

                {/* 5. FLOATING ANIMATED BADGES - Perfectly spaced for mobile & tablet */}

                {/* Top-Right Badge: "Instant Order & Fast Delivery" */}
                <div className="hidden min-[480px]:flex absolute -top-3.5 right-4 sm:right-6 bg-white/95 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg shadow-orange-500/10 border border-amber-100/90 items-center gap-2 z-20 animate-float-smooth hover:scale-105 transition-transform cursor-pointer">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                  <span className="font-handwritten text-base sm:text-lg font-bold text-slate-800 tracking-wide">
                    Instant Order &amp; Express Delivery
                  </span>
                  <span className="text-sm">📍</span>
                </div>

                {/* Top-Left Badge: "100% Homestyle Taste" */}
                <div className="absolute top-2 left-2 sm:-top-3.5 sm:-left-3 bg-white/95 backdrop-blur-md px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full shadow-lg shadow-emerald-500/10 border border-emerald-100/90 flex items-center gap-1.5 sm:gap-2 z-20 animate-float-delay hover:scale-105 transition-transform cursor-pointer">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-2xs">
                    <Leaf className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-emerald-950 tracking-tight">
                    100% Homestyle Taste
                  </span>
                </div>

                {/* Bottom-Left Badge: "4.9 ⭐ (10k+ Tiffins)" */}
                <div className="absolute bottom-2 left-2 sm:-bottom-3 sm:-left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl sm:rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-100 flex items-center gap-1.5 sm:gap-2 z-20 animate-float-reverse hover:scale-105 transition-transform cursor-pointer">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center font-bold text-[10px] sm:text-xs shadow-sm flex-shrink-0">
                    🍱
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <div className="flex text-amber-400">
                        <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
                        <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
                        <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
                        <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
                        <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
                      </div>
                      <span className="text-[10px] sm:text-xs font-black text-slate-900 ml-0.5">4.9</span>
                    </div>
                    <span className="text-[8px] sm:text-[9.5px] font-semibold text-slate-500">10,000+ Tiffins</span>
                  </div>
                </div>

                {/* Bottom-Right Badge: "⚡ 25 Min Express Delivery" */}
                <div className="absolute bottom-2 right-2 sm:-bottom-3 sm:right-3 bg-slate-900/95 backdrop-blur-md text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-xl shadow-slate-900/25 border border-slate-800 flex items-center gap-1 sm:gap-1.5 z-20 animate-float-slow hover:scale-105 transition-transform cursor-pointer">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-[10px] sm:text-xs font-bold text-white tracking-wide">
                    25 Min Express
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* MESS PLANS */}
      <section id="mess-plans" className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2 sm:mb-3">Choose Your Mess Plan 🍱</h2>
            <p className="text-slate-500 text-sm sm:text-lg">Fresh, hygienic home-style thalis delivered daily to your doorstep</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-8 max-w-7xl mx-auto items-stretch">
            {messPlans.map((plan, i) => (
              <div key={i} className={`relative bg-white rounded-3xl p-6 sm:p-7 lg:p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 border border-orange-100/80 flex flex-col justify-between ${plan.popular ? 'ring-2 ring-orange-500 md:scale-105 shadow-xl shadow-orange-100 z-10' : 'hover:shadow-xl'}`}>
                {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2"><span className="bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 text-white px-5 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-lg whitespace-nowrap">🔥 Most Popular</span></div>}
                <div className="text-center">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-1">{plan.name}</h3>
                  <p className="text-orange-600 font-bold mb-1 text-sm sm:text-base">{plan.meals}</p>
                  <p className="text-slate-400 text-xs sm:text-sm mb-4">{plan.duration}</p>
                  <div className="text-3xl sm:text-4xl font-extrabold text-gradient-orange mb-6">₹{plan.price}<span className="text-base font-normal text-slate-400">/mo</span></div>
                  <ul className="space-y-2.5 sm:space-y-3 mb-8 text-left">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start text-xs sm:text-sm text-slate-600">
                        <span className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center mr-2.5 mt-0.5 flex-shrink-0 text-xs text-emerald-600 font-bold">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
                <button onClick={() => navigate('/mess')} className={`w-full py-3.5 rounded-2xl font-bold text-sm sm:text-base transition-all cursor-pointer ${plan.popular ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700 shadow-lg shadow-orange-500/25' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Subscribe Now</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TODAY'S MENU */}
      <section id="todays-menu" className="py-12 sm:py-16 bg-orange-50/25 border-y border-orange-100/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2 sm:mb-3">Today's Mess Menu 🍱</h2>
            <p className="text-slate-500 text-xs sm:text-base">See what is cooking fresh today before you subscribe</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {Object.entries(todaysMenu).map(([meal, data]) => (
              <div key={meal} className="bg-white rounded-3xl p-6 sm:p-7 text-center hover:-translate-y-1 transition-all duration-300 border border-orange-100/80 shadow-sm hover:shadow-md">
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">{data.emoji}</div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 capitalize mb-1.5">{meal}</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{data.items}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-7 sm:mt-8">
            <Link to="/mess" className="inline-flex items-center space-x-2 text-amber-600 font-bold hover:text-amber-700 transition-colors text-sm sm:text-base">
              <span>View Full Weekly Mess Schedule</span><span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* INSTANT ORDER */}
      <section id="food-delivery" className="relative py-14 sm:py-20 bg-[#FAF7F2] overflow-hidden border-t border-orange-100/60">
        {/* Soft background ambient blurs */}
        <div className="absolute top-10 right-10 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-orange-200/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* 1. SECTION HEADER */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/90 border border-amber-200 text-amber-950 text-xs font-bold uppercase tracking-wider mb-2.5 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
              </span>
              <span>⚡ Express Instant Delivery in 20–25 Mins</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-[42px] font-black text-slate-900 tracking-tight leading-[1.15] mb-2 sm:mb-2.5">
              Hungry? <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-rose-500">Instant Order Now</span> 🍔
            </h2>

            <p className="text-slate-600 text-xs sm:text-base leading-relaxed">
              Freshly cooked hot meals, biryanis, rolls, burgers, and snacks delivered straight to your door in minutes.
            </p>
          </div>

          {/* 2. CIRCULAR CATEGORY SHOWCASE BAR (Exact 3D Icon design from user reference) */}
          <div className="relative mb-8 bg-white/70 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-amber-100/90 shadow-xs overflow-hidden">
            {/* Ambient Warm Gradient Glows */}
            <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />

            {/* Strip Sub-header with Desktop Navigation Chevrons */}
            <div className="flex items-center justify-between mb-3 sm:mb-4 relative z-10">
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Select a Cuisine or Category
              </span>

              {/* Scroll controls for desktop */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollHomeCategories('left')}
                  className="w-8 h-8 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-600 hover:text-amber-600 hover:border-amber-300 hover:shadow-md transition-all active:scale-95 cursor-pointer"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollHomeCategories('right')}
                  className="w-8 h-8 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-600 hover:text-amber-600 hover:border-amber-300 hover:shadow-md transition-all active:scale-95 cursor-pointer"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horizontal Scrolling Circular Category Cards */}
            <div className="relative">
              {/* Fade fringes on edges */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 sm:w-6 bg-gradient-to-r from-white/90 to-transparent z-10" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-4 sm:w-6 bg-gradient-to-l from-white/90 to-transparent z-10" />

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
                      {/* Floating Circular Card with Soft Drop Shadow */}
                      <div
                        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center transition-all duration-300 transform group-hover:-translate-y-1.5 ${
                          isActive
                            ? 'ring-3 ring-amber-500 ring-offset-2 ring-offset-[#FAF7F2] shadow-[0_12px_28px_rgba(245,158,11,0.28)] bg-gradient-to-b from-white to-amber-50/50 scale-105'
                            : 'shadow-[0_8px_20px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.04)] group-hover:shadow-[0_16px_30px_rgba(0,0,0,0.12)] border border-slate-100'
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
                          className={`block text-xs sm:text-sm tracking-tight transition-colors duration-200 leading-tight ${
                            isActive
                              ? 'font-bold text-amber-600'
                              : 'font-semibold text-slate-700 group-hover:text-slate-900'
                          }`}
                        >
                          {c.name}
                        </span>
                        {isActive && (
                          <div className="w-5 h-1 bg-amber-500 rounded-full mx-auto mt-1 animate-pulse" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Sub-bar with Item Count, Veg Filter, and Link to Full Menu */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-2 border-t border-slate-200/60 relative z-10 text-xs">
              <span className="text-slate-500 font-medium">
                Showing <strong className="text-slate-800">{filteredFoodItems.length}</strong> items in{' '}
                <span className="text-amber-600 font-bold">
                  {hungryCategories.find(c => c.cat === selectedCategory)?.name || 'All Dishes'}
                </span>
              </span>

              <div className="flex items-center gap-3">
                {/* Veg Only Toggle */}
                <button
                  onClick={() => setVegOnly(!vegOnly)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold border transition-all cursor-pointer ${
                    vegOnly
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  <div className={`w-3 h-3 rounded border flex items-center justify-center ${vegOnly ? 'border-white bg-emerald-600' : 'border-emerald-600 bg-white'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${vegOnly ? 'bg-white' : 'bg-emerald-600'}`} />
                  </div>
                  <span>Veg Only</span>
                </button>

                {/* View Full Menu link with selected category */}
                <Link
                  to={selectedCategory ? `/menu?category=${selectedCategory}` : '/menu'}
                  className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 font-bold transition-colors"
                >
                  <span>Full Menu</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>

          {/* 3. RESPONSIVE FOOD GRID (1 col mobile, 2 cols 440px+, 3 cols tablet, 4 cols desktop) */}
          {filteredFoodItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm max-w-md mx-auto mb-10">
              <p className="text-4xl mb-2">🥗</p>
              <h4 className="font-extrabold text-slate-800 text-base mb-1">No items found</h4>
              <p className="text-slate-500 text-xs mb-4">No matching dishes with current filters.</p>
              <button
                onClick={() => { setSelectedCategory(''); setVegOnly(false); }}
                className="px-4 py-2 rounded-full bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors cursor-pointer"
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
                    className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 border border-slate-100 hover:border-amber-300 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group"
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
                          <div className={`w-5 h-5 rounded-md border-2 bg-white/95 backdrop-blur-md flex items-center justify-center shadow-xs ${
                            item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                          </div>

                          {/* Tag or Discount */}
                          {item.tag ? (
                            <span className="px-2 py-0.5 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-bold shadow-xs">
                              {item.tag}
                            </span>
                          ) : item.originalPrice ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
                              {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                            </span>
                          ) : null}
                        </div>

                        {/* Prep Time */}
                        <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-700 flex items-center gap-1 shadow-xs">
                          <Clock className="w-2.5 h-2.5 text-amber-500" />
                          <span>{item.prepTime || '20m'}</span>
                        </div>
                      </div>

                      {/* Category & Kitchen */}
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1">
                        <span className="text-amber-600 uppercase tracking-wider text-[10px]">
                          {item.category.replace('_', ' ')}
                        </span>
                        <span className="truncate max-w-[110px] font-medium text-slate-500">
                          {item.restaurant}
                        </span>
                      </div>

                      {/* Name */}
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base mb-1.5 group-hover:text-amber-600 transition-colors line-clamp-1">
                        {item.name}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center gap-1.5 mb-3">
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
                          <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
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
                          className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-extrabold text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>ADD</span>
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      ) : (
                        <div className="flex items-center bg-amber-500 text-white rounded-xl shadow-sm px-1 py-0.5 gap-1">
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

          {/* 4. "SEE MORE" BUTTON REDIRECTING TO /menu */}
          <div className="flex flex-col items-center justify-center text-center">
            <Link
              to="/menu"
              id="hungry-see-more-btn"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-amber-500/25 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer"
            >
              <span>See More Dishes</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <p className="text-xs text-slate-500 font-medium mt-2.5">
              Explore 50+ more burgers, rolls, pizzas, biryanis & desserts on the full menu
            </p>
          </div>

        </div>
      </section>

      {/* OFFERS */}
      <section id="offers" className="py-12 sm:py-16 bg-orange-50/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-6 sm:p-8 md:p-10 text-white relative overflow-hidden shadow-lg shadow-orange-500/15 flex flex-col justify-between">
              <div className="absolute top-4 right-6 text-5xl sm:text-6xl opacity-30 pointer-events-none">🍔</div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-yellow-200 mb-1.5 sm:mb-2">🔥 Today's Fast-Food Special</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold mb-2 sm:mb-3">Special Combo @ ₹99</h3>
                <p className="text-white/90 text-xs sm:text-sm mb-6 leading-relaxed">Crispy Chicken / Veg Burger + Salted Peri Peri Fries + Cold Beverage</p>
              </div>
              <div>
                <Link to="/menu" className="inline-block bg-white text-orange-600 font-extrabold text-xs sm:text-sm px-6 py-3 rounded-2xl hover:bg-amber-100 hover:text-orange-700 transition-all shadow-md active:scale-95">Order Combo Now →</Link>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 relative overflow-hidden border border-orange-200 shadow-md flex flex-col justify-between">
              <div className="absolute top-4 right-6 text-5xl sm:text-6xl opacity-20 pointer-events-none">🍱</div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-orange-600 mb-1.5 sm:mb-2">🎉 New Student Subscription Offer</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2 sm:mb-3">First Month @ ₹999</h3>
                <p className="text-slate-600 text-xs sm:text-sm mb-6 leading-relaxed">Subscribe this month and get free express delivery + weekend dessert specials included.</p>
              </div>
              <div>
                <Link to="/mess" className="inline-block bg-gradient-to-r from-orange-500 to-rose-500 text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-2xl hover:from-orange-600 hover:to-rose-600 transition-all shadow-md shadow-orange-500/25 active:scale-95">Subscribe to Mess →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US - DISTINCT VALUE PROPOSITIONS */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2 sm:mb-3">Why Students &amp; Pros Choose Us ✨</h2>
            <p className="text-slate-500 text-xs sm:text-base">Designed specifically for daily convenience, pocket-friendly nutrition, and complete flexibility.</p>
          </div>
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: '🍱', title: 'Authentic Homestyle Taste', desc: 'Freshly prepared, non-oily nutritious food made daily with whole wheat rotis and fresh ingredients.' },
              { icon: '🚴', title: 'Punctual Delivery', desc: 'Guaranteed delivery slots (12–1 PM lunch, 7:30–8:30 PM dinner) right to your hostel or desk.' },
              { icon: '💰', title: 'Affordable Pricing', desc: 'Pocket-friendly subscriptions starting @ just ₹40/meal with zero hidden or delivery fees.' },
              { icon: '📅', title: 'Instant Skips & Pauses', desc: 'Skip any meal before cutoff with 100% wallet refund, or pause validity during vacations.' }
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 text-center shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-orange-100/70 flex flex-col justify-start">
                <div className="text-4xl mb-3.5">{item.icon}</div>
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg mb-2">{item.title}</h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DELIVERY AREA CHECKER */}
      <section className="py-12 sm:py-16 bg-orange-50/25 border-y border-orange-100/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2 sm:mb-3">We Deliver Near You 📍</h2>
          <p className="text-slate-500 mb-8 sm:mb-10 text-xs sm:text-base">Check if service is active in your college campus, hostel, coaching, or workplace</p>
          <div className="bg-white rounded-3xl p-6 sm:p-10 mb-4 border border-orange-200/80 shadow-md">
            <div className="text-6xl sm:text-7xl mb-4 sm:mb-6">🗺️</div>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3 max-w-md mx-auto">
              <input type="text" placeholder="Enter your campus, PG, or area" className="flex-1 w-full px-5 py-3 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-xs sm:text-sm outline-none" />
              <button className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs sm:text-sm rounded-2xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 whitespace-nowrap cursor-pointer">Check Availability</button>
            </div>
          </div>
        </div>
      </section>

      {/* CUSTOMER REVIEWS */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2 sm:mb-3">Loved by 10,000+ Foodies ⭐</h2>
            <p className="text-slate-500 text-xs sm:text-base">Real reviews from students, hostellers, and office professionals across the city</p>
          </div>
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {reviews.map((review, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 sm:p-7 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-orange-100/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-1 mb-3">{[...Array(5)].map((_, j) => <Star key={j} className={`w-4 h-4 ${j < review.rating ? 'text-amber-400 fill-current' : 'text-slate-200'}`} />)}</div>
                  <p className="text-slate-600 text-xs sm:text-sm mb-5 leading-relaxed italic">"{review.text}"</p>
                </div>
                <div className="flex items-center space-x-3 pt-3 border-t border-slate-100">
                  <div className="w-9 h-9 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center text-lg">{review.avatar}</div>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">— {review.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section id="faqs" className="relative py-20 lg:py-24 bg-[#FAF7F2] overflow-hidden border-t border-orange-100/60">
        {/* Ambient subtle glow backdrops */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -right-20 w-96 h-96 bg-orange-200/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            
            {/* LEFT COLUMN: Sticky Header & Live Support Card */}
            <div className="lg:col-span-4 lg:sticky lg:top-24">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/90 border border-amber-200/90 text-amber-900 text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Got Questions?</span>
              </div>

              {/* Title */}
              <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-slate-900 tracking-tight leading-[1.15] mb-4">
                Frequently Asked <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500">
                  Questions
                </span> ❓
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
                Everything you need to know about our daily tiffin mess, meal skipping, instant orders, and refunds.
              </p>

              {/* Interactive Help & Live Support Card */}
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 border border-amber-100 shadow-xl shadow-amber-950/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-amber-100/60 to-transparent rounded-bl-full pointer-events-none" />
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-amber-50 border border-amber-200/70 flex items-center justify-center text-amber-600 font-bold">
                      💬
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Need personal help?</h4>
                      <p className="text-[11px] text-slate-500">Support desk is active</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/80 shadow-2xs">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
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
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
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
                  className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white border border-slate-200/90 focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 outline-none text-sm text-slate-900 placeholder:text-slate-400 shadow-xs transition-all"
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
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-102'
                          : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-orange-50/70 border border-slate-200/80 shadow-2xs'
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
                      className="px-4 py-2 rounded-full bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors cursor-pointer"
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
                        className={`rounded-2xl sm:rounded-3xl transition-all duration-300 overflow-hidden ${
                          isOpen
                            ? 'bg-white border-2 border-amber-400 shadow-xl shadow-amber-500/10 ring-4 ring-amber-100/50'
                            : 'bg-white/95 hover:bg-white border border-slate-200/80 hover:border-amber-300 shadow-2xs hover:shadow-md'
                        }`}
                      >
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : faq.id)}
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