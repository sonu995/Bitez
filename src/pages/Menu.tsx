import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  Clock,
  Plus,
  Minus,
  Search,
  Sparkles,
  Flame,
  CheckCircle2,
  Tag,
  SlidersHorizontal,
  Leaf,
  X,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Award,
  Zap,
  Info,
  Check,
  Percent,
  RotateCcw,
  ChefHat,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { dishesAPI } from '../services/api';
import MealLoadingScreen from '../components/MealLoadingScreen';

// Dish interface definition
interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  isVeg: boolean;
  isAvailable?: boolean;
  rating: number;
  reviews: number;
  tag?: string;
  prepTime: string;
  calories: number;
  protein: string;
  spiceLevel: 'Mild' | 'Medium' | 'Spicy';
  serves: string;
  ingredients: string[];
}

const Menu: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart, items: cartItems, updateQuantity, totalAmount, totalItems } = useCart();

  // Filters & State
  const categoryFromUrl = searchParams.get('category');
  const [activeCategory, setActiveCategory] = useState<string>(categoryFromUrl || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'nonveg'>('all');
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'price_low' | 'price_high' | 'quick'>('popular');
  const [activeModalItem, setActiveModalItem] = useState<MenuItem | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleSelectCategory = (catId: string) => {
    setActiveCategory(catId);
    if (catId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  // Sync category param with URL if present (with alias normalization)
  useEffect(() => {
    if (categoryFromUrl) {
      const aliasMap: Record<string, string> = {
        'south_indian': 'south-indian',
        'chowmein': 'chinese',
        'combos': 'thali',
        'fries': 'momos',
        'mess': 'thali',
        'healthy_bowls': 'healthy'
      };
      setActiveCategory(aliasMap[categoryFromUrl] || categoryFromUrl);
    }
  }, [categoryFromUrl]);

  // Handle promo code copy
  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    showToast(`Code "${code}" copied to clipboard! 🎉`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Toast trigger
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  // Restaurant details
  const restaurant = {
    id: 'bitez-express',
    name: 'Bitez Express Kitchen',
    subtitle: 'Authentic Homestyle Meals, Daily Tiffins & Handcrafted Street Bites',
    cuisines: 'North Indian • Home-Style Thalis • Biryanis • Snacks • Healthy Bowls',
    rating: 4.8,
    reviewsCount: '1,840+',
    deliveryTime: '20–30 mins',
    fssai: 'FSSAI Lic. 1042300000000',
    location: 'Sector 4, City Centre, Bokaro',
    bannerImg: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1200'
  };

  // Categories list matching user design with 3D food illustration assets
  const categories = [
    { id: 'all', name: 'All Dishes', icon: '✨', image: '/categories/all.png' },
    { id: 'breakfast', name: 'Morning Breakfast', icon: '🌅', image: '/categories/thali.png' },
    { id: 'thali', name: 'Thalis & Combos', icon: '🍱', image: '/categories/thali.png' },
    { id: 'biryani', name: 'Biryani & Rice', icon: '🥘', image: '/categories/biryani.png' },
    { id: 'curries', name: 'Curries & Breads', icon: '🍲', image: '/categories/curries.png' },
    { id: 'burgers', name: 'Burgers', icon: '🍔', image: '/categories/burgers.png' },
    { id: 'rolls', name: 'Kathi Rolls', icon: '🌯', image: '/categories/rolls.png' },
    { id: 'momos', name: 'Momos & Dimsums', icon: '🥟', image: '/categories/momos.png' },
    { id: 'fries', name: 'Fries & Sides', icon: '🍟', image: '/categories/fries.png' },
    { id: 'chinese', name: 'Chinese & Chowmein', icon: '🍜', image: '/categories/chinese.png' },
    { id: 'south-indian', name: 'South Indian', icon: '🫔', image: '/categories/south-indian.png' },
    { id: 'healthy', name: 'Fitness & Healthy', icon: '🥗', image: '/categories/healthy.png' },
    { id: 'desserts', name: 'Desserts & Sweets', icon: '🍨', image: '/categories/desserts.png' },
    { id: 'beverages', name: 'Shakes & Coolers', icon: '🥤', image: '/categories/beverages.png' },
    { id: 'pizza', name: 'Pizza & Bakes', icon: '🍕', image: '/categories/pizza.png' }
  ];

  // Real Live Menu Items state fetched dynamically from Backend API
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real dishes from backend API
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    dishesAPI.getAll()
      .then((data: any) => {
        if (isMounted && data?.dishes) {
          const mapped = data.dishes.map((d: any) => ({
            ...d,
            id: d.id || d._id,
            isAvailable: d.isAvailable !== false,
            originalPrice: d.originalPrice || Math.round(d.price * 1.25),
            reviews: d.reviews || 120,
            prepTime: d.prepTime || '20 mins',
            calories: d.calories || 450,
            protein: d.protein || '18g',
            spiceLevel: d.spiceLevel || 'Mild',
            serves: d.serves || '1 Person',
            ingredients: Array.isArray(d.ingredients) && d.ingredients.length > 0 ? d.ingredients : ['Fresh Spices', 'Home Style Gravy']
          }));
          setMenuItems(mapped);
        }
      })
      .catch((err: any) => {
        console.error('Error fetching dishes:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

    // Quick filter definitions
  const quickFilters = [
    { id: 'all', label: 'All Items' },
    { id: 'inStock', label: '🟢 Available Now' },
    { id: 'bestseller', label: '🔥 Bestsellers' },
    { id: 'under99', label: '⚡ Under ₹99' },
    { id: 'rating45', label: '⭐ 4.5+ Rating' },
    { id: 'protein', label: '💪 High Protein' },
    { id: 'spicy', label: '🌶️ Spicy Treats' }
  ];

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return menuItems
      .filter((item) => {
        // Category check
        const matchesCategory =
          activeCategory === 'all' ||
          item.category === activeCategory ||
          (activeCategory === 'fries' && item.category === 'momos') ||
          (activeCategory === 'momos' && item.category === 'fries');

        // Search check
        const matchesSearch =
          searchQuery.trim() === '' ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.ingredients.some((ing) => ing.toLowerCase().includes(searchQuery.toLowerCase()));

        // Dietary check
        const matchesDietary =
          dietaryFilter === 'all' ||
          (dietaryFilter === 'veg' && item.isVeg) ||
          (dietaryFilter === 'nonveg' && !item.isVeg);

        // Quick filter pills check
        let matchesQuick = true;
        if (selectedQuickFilter === 'inStock') {
          matchesQuick = item.isAvailable !== false;
        } else if (selectedQuickFilter === 'bestseller') {
          matchesQuick = Boolean(item.tag?.toLowerCase().includes('bestseller') || item.rating >= 4.8);
        } else if (selectedQuickFilter === 'under99') {
          matchesQuick = item.price <= 99;
        } else if (selectedQuickFilter === 'rating45') {
          matchesQuick = item.rating >= 4.5;
        } else if (selectedQuickFilter === 'protein') {
          matchesQuick = parseInt(item.protein) >= 20;
        } else if (selectedQuickFilter === 'spicy') {
          matchesQuick = item.spiceLevel === 'Spicy';
        }

        return matchesCategory && matchesSearch && matchesDietary && matchesQuick;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'price_low') return a.price - b.price;
        if (sortBy === 'price_high') return b.price - a.price;
        if (sortBy === 'quick') {
          const timeA = parseInt(a.prepTime);
          const timeB = parseInt(b.prepTime);
          return timeA - timeB;
        }
        // default popular
        return b.reviews - a.reviews;
      });
  }, [menuItems, activeCategory, searchQuery, dietaryFilter, selectedQuickFilter, sortBy]);

  // Helper for item quantity in cart
  const getItemQuantity = (id: string) => {
    const found = cartItems.find((i) => i.id === id);
    return found ? found.quantity : 0;
  };

  // Add to cart with visual feedback
  const handleAdd = (item: MenuItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      restaurant: restaurant.name,
      isVeg: item.isVeg
    });
    showToast(`Added ${item.name} to cart! 😋`);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setActiveCategory('all');
    setSearchQuery('');
    setDietaryFilter('all');
    setSelectedQuickFilter('all');
    setSortBy('popular');
  };

  // Free delivery calculation
  const freeDeliveryThreshold = 200;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - totalAmount);

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-fade-in bg-gradient-to-r from-orange-600 to-amber-600 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 text-sm font-semibold border border-orange-400/40">
          <Sparkles className="w-4 h-4 text-amber-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Notice / Ticker - Radiant Orange Theme */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 text-white py-2 px-4 text-center text-xs sm:text-sm font-semibold tracking-wide shadow-xs flex items-center justify-center gap-2 flex-wrap">
        <span className="bg-white text-orange-600 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider shadow-xs">
          🔥 Super Saver
        </span>
        <span>
          Use code <strong className="underline underline-offset-2 text-amber-200">SAVE20</strong> for 20% OFF | Free Instant Delivery above ₹200!
        </span>
      </div>

      {/* Restaurant Hero Atmosphere Card - Warm Sunset Orange Brand Theme */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-amber-600 text-white shadow-2xl shadow-orange-500/25 border border-orange-400/30">
          {/* Background image with blend */}
          <div className="absolute inset-0">
            <img
              src={restaurant.bannerImg}
              alt="Restaurant Cuisine"
              className="w-full h-full object-cover opacity-15 mix-blend-luminosity scale-105 transition-transform duration-1000 hover:scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-orange-700/85 via-orange-600/80 to-amber-600/85" />
          </div>

          {/* Warm Ambient Glow Orb */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative p-4 sm:p-10 z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
              
              {/* Left Details */}
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-white/20 text-white border border-white/30 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold mb-2.5 sm:mb-3.5 backdrop-blur-md shadow-xs">
                  <ChefHat className="w-3.5 h-3.5 text-amber-200" />
                  <span>Master Chef Kitchen</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
                  <span className="text-amber-100">Accepting Orders</span>
                </div>

                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-2 drop-shadow-sm">
                  {restaurant.name}
                </h1>
                
                <p className="text-orange-100 text-xs sm:text-base mb-3.5 sm:mb-4.5 leading-relaxed max-w-xl">
                  {restaurant.subtitle}
                </p>

                {/* Key stats row */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm font-semibold">
                  <div className="flex items-center gap-1.5 bg-white text-orange-600 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl shadow-md font-bold">
                    <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-orange-500 text-orange-500" />
                    <span>{restaurant.rating}</span>
                    <span className="text-slate-500 text-[10px] sm:text-xs font-normal">({restaurant.reviewsCount})</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl border border-white/30 text-white text-xs">
                    <Clock className="w-3.5 h-3.5 text-amber-200" />
                    <span>{restaurant.deliveryTime}</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl border border-white/30 text-white text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-200" />
                    <span>FSSAI Certified</span>
                  </div>
                </div>
              </div>

              {/* Right: Active Coupon Pills */}
              <div className="lg:w-80 flex flex-col gap-3">
                <div className="bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl p-3.5 sm:p-4.5 shadow-xl text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-200 flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-amber-200" /> Best Deal Available
                    </span>
                    <span className="text-[10px] sm:text-[11px] bg-white text-orange-600 font-black px-2 py-0.5 rounded-full shadow-sm">
                      SAVE 20%
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-black/20 border border-white/20 rounded-xl px-3 py-1.5 sm:px-3.5 sm:py-2 shadow-inner">
                    <span className="font-mono font-black tracking-widest text-amber-300 text-sm sm:text-base">SAVE20</span>
                    <button
                      onClick={() => handleCopyCode('SAVE20')}
                      className="text-xs bg-white hover:bg-orange-50 text-orange-600 font-extrabold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCode === 'SAVE20' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <span>Copy Code</span>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-orange-100 mt-2 leading-snug">
                    Apply at checkout for 20% off on all orders above ₹149!
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Category Showcase Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-4 sm:mt-6">
        <div className="relative bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 border border-slate-200 shadow-xs overflow-hidden">
          {/* Section Header with Desktop Carousel Controls */}
          <div className="flex items-center justify-between mb-3 sm:mb-6 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                <h2 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Inspiration for your order
                </h2>
              </div>
              <p className="text-[11px] sm:text-sm text-slate-500 mt-0.5 font-medium">
                Tap any category to explore authentic dishes
              </p>
            </div>

            {/* Scroll Navigation Chevrons */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollCategories('left')}
                className="w-9 h-9 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-600 hover:text-orange-600 hover:border-orange-300 hover:shadow-md transition-all active:scale-95 cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollCategories('right')}
                className="w-9 h-9 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-600 hover:text-orange-600 hover:border-orange-300 hover:shadow-md transition-all active:scale-95 cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Horizontal Category Strip */}
          <div className="relative">
            {/* Soft Edge Fade Fringes */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 sm:w-6 bg-gradient-to-r from-white to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-4 sm:w-6 bg-gradient-to-l from-white to-transparent z-10" />

            <div
              ref={categoryScrollRef}
              className="flex items-start gap-3 sm:gap-6 md:gap-7 overflow-x-auto scroll-smooth py-2.5 px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className="group flex flex-col items-center flex-shrink-0 cursor-pointer transition-all duration-200 outline-none focus:outline-none focus-visible:outline-none select-none"
                    style={{ minWidth: '74px', maxWidth: '96px' }}
                  >
                    {/* Circle Card with Soft Shadow */}
                    <div
                      className={`w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-full bg-white flex items-center justify-center transition-all duration-300 transform group-hover:-translate-y-1.5 ${
                        isActive
                          ? 'ring-3 ring-orange-500 ring-offset-2 ring-offset-white shadow-[0_12px_28px_rgba(234,88,12,0.25)] bg-orange-50 scale-105'
                          : 'shadow-[0_8px_20px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.04)] border border-slate-100 group-hover:shadow-[0_16px_30px_rgba(0,0,0,0.12)]'
                      }`}
                    >
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-9 h-9 sm:w-12 sm:h-12 md:w-13 md:h-13 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-xs pointer-events-none"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'block';
                        }}
                      />
                      <span className="hidden text-3xl sm:text-4xl pointer-events-none">
                        {cat.icon}
                      </span>
                    </div>

                    {/* Category Label Underneath */}
                    <div className="mt-2 text-center w-full">
                      <span
                        className={`block text-[11px] sm:text-sm tracking-tight transition-colors duration-200 leading-tight ${
                          isActive
                            ? 'font-bold text-orange-600'
                            : 'font-semibold text-slate-700 group-hover:text-slate-900'
                        }`}
                      >
                        {cat.name}
                      </span>
                      {isActive && (
                        <div className="w-4 sm:w-5 h-1 bg-orange-500 rounded-full mx-auto mt-1" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Category & Search Navigation Section */}
      <div className="sticky top-16 md:top-20 z-30 bg-white/95 backdrop-blur-md border-y border-slate-200/80 shadow-xs mt-4 sm:mt-6 transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          
          {/* Top row: Search input + Veg/NonVeg Switch + Sort */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="menu-search-input"
                type="text"
                placeholder="Search dishes (e.g. Biryani, Paneer)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-400 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Middle: Veg / Non-Veg segmented pill */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 sm:p-1 rounded-xl w-full md:w-auto justify-center">
              <button
                onClick={() => setDietaryFilter('all')}
                className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                  dietaryFilter === 'all'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-orange-600'
                }`}
              >
                All Dishes
              </button>
              <button
                onClick={() => setDietaryFilter('veg')}
                className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  dietaryFilter === 'veg'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-emerald-600'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-300 border border-white shrink-0" />
                <span>Veg Only</span>
              </button>
              <button
                onClick={() => setDietaryFilter('nonveg')}
                className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  dietaryFilter === 'nonveg'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-orange-600'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-200 border border-white shrink-0" />
                <span>Non-Veg</span>
              </button>
            </div>

            {/* Sort & View Mode Controls */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 focus:outline-hidden focus:border-orange-500 cursor-pointer"
                >
                  <option value="popular">🔥 Most Popular</option>
                  <option value="rating">⭐ Highest Rated</option>
                  <option value="price_low">💰 Price: Low to High</option>
                  <option value="price_high">💎 Price: High to Low</option>
                  <option value="quick">⚡ Fastest Prep</option>
                </select>
              </div>

              {/* View Switcher: Grid vs List */}
              <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-200/60 shadow-2xs">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-slate-900 shadow-xs scale-105'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Grid View (Compact)"
                >
                  <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white text-slate-900 shadow-xs scale-105'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="List View (Detailed)"
                >
                  <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Quick Filter Chips & Status Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
          
          {/* Quick pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Quick:</span>
            {quickFilters.map((q) => (
              <button
                key={q.id}
                onClick={() => setSelectedQuickFilter(q.id)}
                className={`text-xs px-3 py-1.5 rounded-full font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  selectedQuickFilter === q.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Results count & reset */}
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
            <span>
              Showing <strong className="text-slate-900">{filteredItems.length}</strong> items
            </span>

            {(activeCategory !== 'all' || searchQuery || dietaryFilter !== 'all' || selectedQuickFilter !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 hover:underline font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Food Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-7">
        {loading ? (
          <MealLoadingScreen
            fullScreen={false}
            message="Cooking Fresh Menu Dishes..."
            subMessage="Fetching live kitchen items, combos and daily chef specials"
          />
        ) : filteredItems.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              🔍
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No matching dishes found</h3>
            <p className="text-slate-500 text-sm mb-6">
              We couldn't find anything matching your search criteria. Try clearing some filters or searching for something else!
            </p>
            <button
              onClick={handleResetFilters}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-6 py-2.5 rounded-full shadow-md transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* RESPONSIVE GRID VIEW (2 cols mobile, 3 cols tablet, 4 cols desktop) */
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5 lg:gap-6">
            {filteredItems.map((item) => {
              const qty = getItemQuantity(item.id);
              return (
                <div
                  key={item.id}
                  className="group bg-white rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden border border-slate-200 hover:border-orange-500 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full"
                >
                    {/* Top Image & Badges */}
                    <div
                      className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 cursor-pointer"
                      onClick={() => setActiveModalItem(item)}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                          item.isAvailable === false ? 'grayscale-[45%] opacity-85' : ''
                        }`}
                        loading="lazy"
                      />

                      {/* Sold Out Overlay if unavailable */}
                      {item.isAvailable === false && (
                        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none z-10">
                          <span className="bg-rose-600 text-white text-[10px] sm:text-xs font-black uppercase px-2.5 py-1 rounded-full shadow-lg border border-white/30 tracking-wider">
                            🔴 Sold Out
                          </span>
                        </div>
                      )}

                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* Tag badge (Bestseller, Chef Special, etc.) */}
                      {item.tag && (
                        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-[9px] sm:text-[11px] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-md flex items-center gap-1 border border-white/20">
                          {item.tag}
                        </div>
                      )}

                      {/* Veg / Non-Veg Indian FSSAI symbol */}
                      <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 bg-white/95 backdrop-blur-md p-0.5 sm:p-1 rounded-sm sm:rounded-md shadow-xs">
                        <div
                          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-xs border-[1.5px] sm:border-2 flex items-center justify-center ${
                            item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                              item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Prep time badge bottom-left */}
                      <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-md text-slate-800 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded shadow-xs border border-orange-200/80 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-500" />
                        <span>{item.prepTime}</span>
                      </div>

                      {/* Quick view hint on desktop */}
                      <div className="absolute bottom-2 right-2 hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                        Quick View 👁️
                      </div>
                    </div>

                    {/* Details Section */}
                    <div className="p-2.5 sm:p-3.5 md:p-4 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Name & Rating */}
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <h3
                            onClick={() => setActiveModalItem(item)}
                            className="font-bold text-slate-900 text-xs sm:text-sm md:text-base leading-tight group-hover:text-orange-600 transition-colors line-clamp-1 cursor-pointer"
                            title={item.name}
                          >
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-0.5 bg-orange-50 px-1 py-0.5 rounded text-orange-700 text-[10px] sm:text-xs font-bold flex-shrink-0 border border-orange-100">
                            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-orange-500 text-orange-500" />
                            <span>{item.rating}</span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-slate-500 text-[11px] sm:text-xs line-clamp-1 sm:line-clamp-2 mb-2 leading-tight sm:leading-relaxed">
                          {item.description}
                        </p>

                        {/* Nutritional snippet */}
                        <div className="flex items-center gap-1 text-[9px] sm:text-[10px] md:text-[11px] text-slate-500 font-medium mb-2.5">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded-sm">🔥 {item.calories} kcal</span>
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded-sm hidden xs:inline-block">💪 {item.protein}</span>
                        </div>
                      </div>

                      {/* Price and Add button bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto gap-1">
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm sm:text-base md:text-lg font-black text-slate-900">₹{item.price}</span>
                            {item.originalPrice > item.price && (
                              <span className="text-[10px] sm:text-xs text-slate-400 line-through">₹{item.originalPrice}</span>
                            )}
                          </div>
                          {item.originalPrice > item.price && (
                            <span className="text-[9px] sm:text-[10px] text-orange-600 font-extrabold uppercase">
                              {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                            </span>
                          )}
                        </div>

                        {/* ADD or Counter Button */}
                        <div>
                          {item.isAvailable === false ? (
                            <span className="inline-block bg-slate-100 text-slate-400 font-bold text-[10px] sm:text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 cursor-not-allowed select-none">
                              Sold Out
                            </span>
                          ) : qty === 0 ? (
                            <button
                              id={`add-btn-${item.id}`}
                              onClick={() => handleAdd(item)}
                              className="bg-orange-500 hover:bg-orange-600 text-white text-[11px] sm:text-xs font-black px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl shadow-xs hover:shadow-md active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3 stroke-[3]" />
                              <span>ADD</span>
                            </button>
                          ) : (
                            <div className="flex items-center bg-orange-50 border border-orange-200 rounded-lg sm:rounded-xl px-1.5 py-0.5 sm:px-2 sm:py-1 gap-1 sm:gap-1.5 shadow-xs">
                              <button
                                id={`minus-btn-${item.id}`}
                                onClick={() => updateQuantity(item.id, qty - 1)}
                                className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors"
                              >
                                <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                              </button>
                              <span className="text-[11px] sm:text-xs font-black text-slate-900 w-3 sm:w-4 text-center">{qty}</span>
                              <button
                                id={`plus-btn-${item.id}`}
                                onClick={() => updateQuantity(item.id, qty + 1)}
                                className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors"
                              >
                                <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* RESPONSIVE LIST VIEW (Horizontal cards - Swiggy/Zomato style) */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filteredItems.map((item) => {
              const qty = getItemQuantity(item.id);
              return (
                <div
                  key={item.id}
                  className="group bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 hover:border-orange-500 shadow-2xs hover:shadow-lg transition-all flex gap-3 sm:gap-4 justify-between items-center"
                >
                  {/* Left Side Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {/* Veg / Non-Veg Icon */}
                      <div
                        className={`w-3.5 h-3.5 rounded-xs border-2 bg-white flex items-center justify-center flex-shrink-0 ${
                          item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                          }`}
                        />
                      </div>

                      {item.tag && (
                        <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-200/70">
                          {item.tag}
                        </span>
                      )}
                    </div>

                    <h3
                      onClick={() => setActiveModalItem(item)}
                      className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-orange-600 transition-colors line-clamp-1 cursor-pointer"
                      title={item.name}
                    >
                      {item.name}
                    </h3>

                    <div className="flex items-center gap-2 my-1">
                      <span className="text-base font-black text-slate-900">₹{item.price}</span>
                      {item.originalPrice > item.price && (
                        <span className="text-xs text-slate-400 line-through">₹{item.originalPrice}</span>
                      )}
                      <div className="flex items-center gap-0.5 bg-orange-50 px-1.5 py-0.5 rounded text-orange-700 text-[11px] font-bold ml-1 border border-orange-100">
                        <Star className="w-3 h-3 fill-orange-500 text-orange-500" />
                        <span>{item.rating}</span>
                      </div>
                    </div>

                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-2">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-400 font-medium">
                      <span>⏱️ {item.prepTime}</span>
                      <span>•</span>
                      <span>🔥 {item.calories} kcal</span>
                    </div>
                  </div>

                  {/* Right Side Image & Floating ADD Button */}
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer ${
                        item.isAvailable === false ? 'grayscale-[45%] opacity-85' : ''
                      }`}
                      onClick={() => setActiveModalItem(item)}
                      loading="lazy"
                    />

                    {/* Sold out overlay for list item */}
                    {item.isAvailable === false && (
                      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none z-10">
                        <span className="bg-rose-600 text-white text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg border border-white/30 tracking-wider">
                          Sold Out
                        </span>
                      </div>
                    )}

                    {/* Floating ADD or Stepper Button */}
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 shadow-md z-20">
                      {item.isAvailable === false ? (
                        <span className="bg-slate-900/90 text-white font-extrabold text-[10px] sm:text-xs px-2.5 py-1 rounded-lg shadow-sm whitespace-nowrap cursor-not-allowed select-none">
                          Sold Out
                        </span>
                      ) : qty === 0 ? (
                        <button
                          id={`add-btn-list-${item.id}`}
                          onClick={() => handleAdd(item)}
                          className="bg-white hover:bg-orange-50 text-orange-600 font-black text-xs px-3.5 py-1 rounded-lg border border-slate-200 shadow-sm transition-all hover:scale-105 flex items-center gap-1 whitespace-nowrap cursor-pointer"
                        >
                          <Plus className="w-3 h-3 stroke-[3]" />
                          <span>ADD</span>
                        </button>
                      ) : (
                        <div className="flex items-center bg-white border border-orange-200 rounded-lg px-1.5 py-0.5 gap-1.5 shadow-md">
                          <button
                            id={`minus-btn-list-${item.id}`}
                            onClick={() => updateQuantity(item.id, qty - 1)}
                            className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors"
                          >
                            <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                          </button>
                          <span className="text-xs font-black text-slate-900 w-3 sm:w-4 text-center">{qty}</span>
                          <button
                            id={`plus-btn-list-${item.id}`}
                            onClick={() => updateQuantity(item.id, qty + 1)}
                            className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors"
                          >
                            <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dish Quick View Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-slide-up my-auto">
            
            {/* Modal Image Header */}
            <div className="relative aspect-16/9 bg-orange-100">
              <img
                src={activeModalItem.image}
                alt={activeModalItem.name}
                className={`w-full h-full object-cover ${activeModalItem.isAvailable === false ? 'grayscale-[35%]' : ''}`}
              />
              <button
                onClick={() => setActiveModalItem(null)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-orange-600/80 hover:bg-orange-600 text-white p-1.5 sm:p-2 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-2.5 left-3 sm:bottom-3 sm:left-4 flex items-center gap-2">
                <span className="bg-orange-500 text-white text-[11px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 fill-white" /> {activeModalItem.rating} ({activeModalItem.reviews} reviews)
                </span>
                <span className="bg-orange-950/70 backdrop-blur-md text-white text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 rounded-full">
                  ⏱️ {activeModalItem.prepTime}
                </span>
              </div>
            </div>

            {/* Sold Out Banner in Modal */}
            {activeModalItem.isAvailable === false && (
              <div className="bg-rose-50 border-l-4 border-rose-500 p-2.5 sm:p-3 mx-4 sm:mx-6 mt-4 rounded-r-lg flex items-center justify-between text-rose-700 text-xs sm:text-sm font-bold">
                <span className="flex items-center gap-1.5">
                  <span>⚠️</span> Currently Sold Out for Today
                </span>
                <span className="text-[10px] sm:text-xs uppercase bg-rose-200/80 text-rose-800 px-2 py-0.5 rounded font-extrabold">
                  Unavailable
                </span>
              </div>
            )}

            {/* Modal Content */}
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">{activeModalItem.name}</h2>
                  <p className="text-[11px] sm:text-xs text-orange-600 font-bold uppercase tracking-wider mt-0.5">
                    {activeModalItem.serves} • Spice: {activeModalItem.spiceLevel}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xl sm:text-2xl font-black text-slate-900">₹{activeModalItem.price}</div>
                  {activeModalItem.originalPrice > activeModalItem.price && (
                    <div className="text-[11px] sm:text-xs text-slate-400 line-through">₹{activeModalItem.originalPrice}</div>
                  )}
                </div>
              </div>

              <p className="text-slate-600 text-xs sm:text-sm mb-4 leading-relaxed">
                {activeModalItem.description}
              </p>

              {/* Nutrition breakdown cards */}
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-4 text-center">
                <div className="bg-slate-50 p-1.5 sm:p-2 rounded-xl border border-slate-200">
                  <div className="text-[9px] sm:text-[10px] text-slate-500 font-semibold uppercase">Calories</div>
                  <div className="text-xs sm:text-sm font-black text-slate-900">{activeModalItem.calories} kcal</div>
                </div>
                <div className="bg-slate-50 p-1.5 sm:p-2 rounded-xl border border-slate-200">
                  <div className="text-[9px] sm:text-[10px] text-slate-500 font-semibold uppercase">Protein</div>
                  <div className="text-xs sm:text-sm font-black text-slate-900">{activeModalItem.protein}</div>
                </div>
                <div className="bg-slate-50 p-1.5 sm:p-2 rounded-xl border border-slate-200">
                  <div className="text-[9px] sm:text-[10px] text-slate-500 font-semibold uppercase">Diet</div>
                  <div className="text-xs sm:text-sm font-black text-slate-900">{activeModalItem.isVeg ? 'Veg' : 'Non-Veg'}</div>
                </div>
                <div className="bg-slate-50 p-1.5 sm:p-2 rounded-xl border border-slate-200">
                  <div className="text-[9px] sm:text-[10px] text-slate-500 font-semibold uppercase">Spice</div>
                  <div className="text-xs sm:text-sm font-black text-slate-900">{activeModalItem.spiceLevel}</div>
                </div>
              </div>

              {/* Ingredients */}
              <div className="mb-5">
                <h4 className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Key Ingredients</h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeModalItem.ingredients.map((ing, i) => (
                    <span key={i} className="text-[11px] sm:text-xs bg-slate-100 text-slate-700 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg font-medium">
                      ✓ {ing}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-2 sm:gap-3">
                {activeModalItem.isAvailable === false ? (
                  <button
                    disabled
                    className="flex-1 bg-slate-200 text-slate-400 font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm cursor-not-allowed select-none"
                  >
                    <ShoppingBag className="w-4 h-4 opacity-50" />
                    <span>Sold Out (Currently Unavailable)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleAdd(activeModalItem);
                      setActiveModalItem(null);
                    }}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 text-xs sm:text-sm transition-all hover:-translate-y-0.5 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart • ₹{activeModalItem.price}</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveModalItem(null)}
                  className="px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl sm:rounded-2xl text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Customer Trust & Quality Assurance Banner - Warm Orange & Cream Theme */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
        <div className="bg-gradient-to-br from-orange-50 via-amber-50/70 to-orange-100/60 rounded-2xl sm:rounded-3xl p-6 sm:p-10 border-2 border-orange-200/80 text-slate-800 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-orange-700 bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
              Bitez Promise
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              Cooked Fresh with Mother's Touch &amp; Hygiene
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Every dish is freshly cooked on your order, packed in leak-proof insulated containers to arrive piping hot.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 text-center">
            <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-orange-100 shadow-2xs hover:border-orange-300 transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 text-lg sm:text-xl">
                🧼
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">FSSAI Certified</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1">100% sanitized cloud kitchen.</p>
            </div>

            <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-orange-100 shadow-2xs hover:border-orange-300 transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 text-lg sm:text-xl">
                ⚡
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Piping Hot Delivery</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Insulated thermal boxes keep food hot.</p>
            </div>

            <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-orange-100 shadow-2xs hover:border-orange-300 transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 text-lg sm:text-xl">
                🌱
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Pure Segregation</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Dedicated utensils for veg food.</p>
            </div>

            <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-orange-100 shadow-2xs hover:border-orange-300 transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 text-lg sm:text-xl">
                🔄
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Instant Replacement</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1">100% money-back satisfaction.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Quick Cart Bar - Sunset Orange Brand Theme (Lifted to bottom-20 on mobile so it stays above MobileBottomNav) */}
      {totalItems > 0 && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-xl animate-slide-up">
          <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 backdrop-blur-xl border border-orange-400/50 text-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-2xl shadow-orange-500/35 flex items-center justify-between gap-2 sm:gap-4">
            
            {/* Left cart stats */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative w-9 h-9 sm:w-11 sm:h-11 bg-white text-orange-600 rounded-lg sm:rounded-xl flex items-center justify-center font-black flex-shrink-0 shadow-sm">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="absolute -top-1 -right-1 bg-amber-400 text-orange-950 text-[10px] sm:text-[11px] font-black w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-orange-600">
                  {totalItems}
                </span>
              </div>
              <div className="min-w-0">
                <div className="text-[11px] sm:text-xs text-orange-100 font-medium truncate">
                  {totalItems} {totalItems === 1 ? 'dish' : 'dishes'} added
                </div>
                <div className="text-base sm:text-lg font-black text-white">
                  ₹{totalAmount}
                </div>
              </div>
            </div>

            {/* Delivery threshold message (hidden on mobile, visible on desktop) */}
            <div className="hidden md:block text-xs text-orange-100">
              {remainingForFreeDelivery > 0 ? (
                <span>Add <strong className="text-amber-200">₹{remainingForFreeDelivery}</strong> for Free Delivery 🚚</span>
              ) : (
                <span className="text-amber-200 font-bold">🎉 FREE Delivery!</span>
              )}
            </div>

            {/* Proceed to Cart Button */}
            <Link
              to="/cart"
              id="view-cart-floating-btn"
              className="bg-white hover:bg-orange-50 text-orange-600 font-black text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl shadow-lg shadow-orange-700/20 flex items-center gap-1.5 sm:gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer flex-shrink-0"
            >
              <span>View Cart</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </Link>

          </div>
        </div>
      )}

    </div>
  );
};

export default Menu;