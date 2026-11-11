import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Utensils,
  Sun,
  Moon,
  Coffee,
  CheckCircle2,
  Printer,
  ChevronRight,
  Flame,
  Award,
  RefreshCw,
  Heart
} from 'lucide-react';
import { menuAPI, plansAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import MealLoadingScreen from '../components/MealLoadingScreen';

const DAY_FULL_NAMES: Record<string, string> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday'
};

const MEAL_TIMES = {
  breakfast: {
    label: 'Morning Breakfast',
    time: '8:00 AM – 10:00 AM',
    emoji: '☀️',
    nutrition: '~420 kcal • 14g Protein',
    badge: 'Morning Fuel'
  },
  lunch: {
    label: 'Wholesome Lunch Thali',
    time: '12:30 PM – 2:30 PM',
    emoji: '🌤️',
    nutrition: '~650 kcal • 24g Protein',
    badge: 'Chef Choice'
  },
  dinner: {
    label: 'Comfort Dinner Feast',
    time: '7:30 PM – 9:30 PM',
    emoji: '🌙',
    nutrition: '~580 kcal • 26g Protein',
    badge: 'Homestyle Comfort'
  }
};

export default function WeeklyTimetable() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dayKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const currentDayIndex = new Date().getDay(); // 0 is Sunday
  const todayKey = currentDayIndex === 0 ? 'Sun' : dayKeys[currentDayIndex - 1];

  const [activeDay, setActiveDay] = useState<string>(todayKey);
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const [timetable, setTimetable] = useState<Record<string, { breakfast: string; lunch: string; dinner: string }>>({});
  const [mealTimings, setMealTimings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch full weekly menu & live admin meal timings from backend
    Promise.allSettled([
      menuAPI.getAll(),
      menuAPI.getMealTimings?.() || Promise.resolve(null)
    ])
      .then(([menuRes, timingsRes]: any[]) => {
        if (menuRes.status === 'fulfilled' && menuRes.value?.menu && Object.keys(menuRes.value.menu).length > 0) {
          setTimetable(menuRes.value.menu);
        }
        if (timingsRes.status === 'fulfilled' && timingsRes.value?.timings) {
          setMealTimings(timingsRes.value.timings);
        }
      })
      .catch((err: any) => console.error('Error fetching weekly timetable:', err))
      .finally(() => setLoading(false));
  }, []);

  const dynamicMealTimes = {
    breakfast: {
      ...MEAL_TIMES.breakfast,
      label: mealTimings?.breakfast?.label || MEAL_TIMES.breakfast.label,
      time: mealTimings?.breakfast?.deliveryTimeStr || '08:00 AM – 09:30 AM'
    },
    lunch: {
      ...MEAL_TIMES.lunch,
      label: mealTimings?.lunch?.label || MEAL_TIMES.lunch.label,
      time: mealTimings?.lunch?.deliveryTimeStr || '12:30 PM – 02:00 PM'
    },
    dinner: {
      ...MEAL_TIMES.dinner,
      label: mealTimings?.dinner?.label || MEAL_TIMES.dinner.label,
      time: mealTimings?.dinner?.deliveryTimeStr || '07:30 PM – 09:00 PM'
    }
  };

  const activeMenu = timetable[activeDay] || { breakfast: '', lunch: '', dinner: '' };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 pb-20">
      
      {/* ── HEADER BANNER ───────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-500 via-orange-600 to-amber-600 text-white py-14 sm:py-18 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-black uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>LIVE KITCHEN ROTATING TIMETABLE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4 leading-tight">
            Weekly Mess <span className="underline decoration-amber-300 decoration-wavy decoration-2">Timetable 🍱</span>
          </h1>

          <p className="max-w-2xl mx-auto text-orange-100 text-sm sm:text-lg leading-relaxed mb-6 font-medium">
            100% Fresh, hygienic homestyle meals prepared fresh daily for Breakfast, Lunch &amp; Dinner. 
            Rotates daily so you never get bored of hostel food!
          </p>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('/mess')}
              className="px-6 py-3 bg-white text-orange-600 hover:bg-orange-50 font-black rounded-2xl text-xs sm:text-sm shadow-xl shadow-black/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Subscribe Mess Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-3 bg-white/15 hover:bg-white/25 text-white font-bold rounded-2xl text-xs sm:text-sm border border-white/30 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
              title="Print or save weekly timetable PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print Schedule</span>
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin', { state: { tab: 'menu' } })}
                className="px-5 py-3 bg-slate-900 hover:bg-black text-amber-300 font-black rounded-2xl text-xs sm:text-sm border border-amber-400/50 shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                title="Edit weekly timetable in Admin Panel"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Admin: Edit Timetable</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── TODAY'S LIVE COOKING HIGHLIGHT ────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-orange-100/80 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center text-2xl shrink-0">
              🍳
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">
                  Today ({DAY_FULL_NAMES[todayKey]}) Live Cooking
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                <span className="text-amber-600 font-black">Breakfast:</span> {timetable[todayKey]?.breakfast || 'Stuffed Paratha + Curd + Chai'}
              </p>
              <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5">
                <span className="text-orange-600 font-black">Lunch:</span> {timetable[todayKey]?.lunch || 'Wholesome Special Thali'}
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-700 mt-0.5">
                <span className="text-indigo-600 font-black">Dinner:</span> {timetable[todayKey]?.dinner || 'Warm Comfort Rice & Roti'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setActiveDay(todayKey)}
              className="flex-1 md:flex-initial px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold rounded-xl text-xs transition cursor-pointer border border-orange-200/60"
            >
              View Today's Meals
            </button>
            <button
              onClick={() => navigate('/mess')}
              className="flex-1 md:flex-initial px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer"
            >
              Get Tiffin Pass →
            </button>
          </div>
        </div>
      </section>

      {/* ── CONTROLS: DAY SELECTOR TABS & VIEW TOGGLE ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          
          {/* Day Tabs */}
          <div className="inline-flex bg-slate-200/70 p-1.5 rounded-2xl overflow-x-auto max-w-full scrollbar-hide gap-1 border border-slate-300/40">
            {dayKeys.map(d => {
              const isActive = activeDay === d;
              const isToday = d === todayKey;

              return (
                <button
                  key={d}
                  onClick={() => {
                    setActiveDay(d);
                    setViewMode('single');
                  }}
                  className={`px-4 sm:px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    isActive && viewMode === 'single'
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 scale-105'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  }`}
                >
                  <span>{d}</span>
                  {isToday && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" title="Today" />
                  )}
                  {d === 'Sun' && <span>🎉</span>}
                </button>
              );
            })}
          </div>

          {/* View Mode Switcher */}
          <div className="inline-flex items-center bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 shadow-2xs">
            <button
              onClick={() => setViewMode('single')}
              className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'single' ? 'bg-orange-500 text-white shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Day Detail View
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'all' ? 'bg-orange-500 text-white shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Full 7-Day Grid 📅
            </button>
          </div>
        </div>

        {loading ? (
          <MealLoadingScreen
            fullScreen={false}
            message="Loading Weekly Mess Timetable..."
            subMessage="Fetching live rotating breakfast, lunch and dinner menus from kitchen"
          />
        ) : (
          <>
            {/* ── SINGLE DAY DETAIL VIEW ─────────────────────────── */}
            {viewMode === 'single' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Header info for selected day */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>{DAY_FULL_NAMES[activeDay]} Menu</span>
                  {activeDay === todayKey && (
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                      Today's Live Menu
                    </span>
                  )}
                  {activeDay === 'Sun' && (
                    <span className="text-xs bg-amber-100 text-amber-800 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                      Sunday Special Feast Included
                    </span>
                  )}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Freshly cooked in student-dedicated hygienic cloud kitchen with 100% RO water.
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-400">Pure Homestyle • Pure Veg</span>
              </div>
            </div>

            {/* 3 Meal Cards Grid */}
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {[
                {
                  key: 'breakfast',
                  info: dynamicMealTimes.breakfast,
                  value: activeMenu.breakfast,
                  img: activeDay === 'Sun'
                    ? 'https://images.pexels.com/photos/103124/pexels-photo-103124.jpeg?auto=compress&cs=tinysrgb&w=600'
                    : 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=600'
                },
                {
                  key: 'lunch',
                  info: dynamicMealTimes.lunch,
                  value: activeMenu.lunch,
                  img: activeDay === 'Wed' || activeDay === 'Thu'
                    ? 'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=600'
                    : 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=600'
                },
                {
                  key: 'dinner',
                  info: dynamicMealTimes.dinner,
                  value: activeMenu.dinner,
                  img: activeDay === 'Sun'
                    ? 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=600'
                    : 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=600'
                }
              ].map(meal => (
                <div
                  key={meal.key}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Visual Image Header */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-100 group">
                      <img
                        src={meal.img}
                        alt={meal.info.label}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm flex items-center gap-1.5">
                        <span>{meal.info.emoji}</span>
                        <span>{meal.info.badge}</span>
                      </div>
                      <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-[11px] font-bold shadow-sm flex items-center gap-1">
                        <Clock className="w-3 h-3 text-orange-400" />
                        <span>{meal.info.time}</span>
                      </div>
                    </div>

                    {/* Meal Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-black text-slate-900">
                          {meal.info.label}
                        </h3>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                          Pure Veg
                        </span>
                      </div>

                      {/* Food Item Highlight */}
                      <div className="bg-orange-50/60 border border-orange-100/80 rounded-2xl p-4 my-4">
                        <p className="text-sm sm:text-base font-extrabold text-slate-900 leading-relaxed">
                          {meal.value || 'Fresh chef-curated seasonal meal preparation'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                        <span>Nutrition Profile:</span>
                        <span className="font-bold text-slate-700">{meal.info.nutrition}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <button
                      onClick={() => navigate('/plans', { state: { selectedDay: activeDay } })}
                      className="w-full py-3 bg-slate-100 hover:bg-orange-500 hover:text-white text-slate-700 font-bold rounded-2xl text-xs sm:text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Subscribe with This Menu</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Sunday Special Callout banner */}
            {activeDay === 'Sun' && (
              <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">👑</span>
                  <div>
                    <h4 className="text-lg font-black">Free Sunday Royal Feast Included!</h4>
                    <p className="text-xs sm:text-sm text-amber-100">All monthly pass holders get Dal Bukhara, Royal Paneer/Butter Chicken & Hot Gulab Jamun at zero extra charge.</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/mess')}
                  className="px-5 py-2.5 bg-white text-orange-600 hover:bg-amber-50 font-black rounded-xl text-xs transition shadow-md whitespace-nowrap cursor-pointer"
                >
                  Get Student Pass
                </button>
              </div>
            )}

          </div>
        )}

        {/* ── FULL 7-DAY MASTER GRID VIEW ────────────────────── */}
        {viewMode === 'all' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center max-w-xl mx-auto mb-6">
              <h2 className="text-2xl font-black text-slate-900">Complete 7-Day Rotating Master Schedule</h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Browse meal combinations for Monday through Sunday. Updated directly by head chefs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {dayKeys.map(day => {
                const dayMenu = timetable[day] || { breakfast: 'Wholesome Breakfast', lunch: 'Chef Special Thali', dinner: 'Comfort Dinner' };
                const isToday = day === todayKey;

                return (
                  <div
                    key={day}
                    className={`bg-white rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                      isToday
                        ? 'ring-2 ring-orange-500 shadow-xl border-orange-200'
                        : 'border-slate-200 hover:border-orange-300 shadow-xs hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* Day Header */}
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 font-black text-sm flex items-center justify-center">
                            {day}
                          </span>
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-900">{DAY_FULL_NAMES[day]}</h4>
                            {isToday && (
                              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                                Today
                              </span>
                            )}
                          </div>
                        </div>

                        {day === 'Sun' && <span className="text-lg">🎉</span>}
                      </div>

                      {/* Meals list */}
                      <div className="space-y-3 text-xs">
                        <div>
                          <span className="font-black text-amber-600 uppercase text-[10px] flex items-center gap-1 mb-0.5">
                            <Sun className="w-3 h-3" /> Breakfast
                          </span>
                          <p className="text-slate-800 font-semibold leading-relaxed">
                            {dayMenu.breakfast}
                          </p>
                        </div>

                        <div>
                          <span className="font-black text-orange-600 uppercase text-[10px] flex items-center gap-1 mb-0.5">
                            <Utensils className="w-3 h-3" /> Lunch Thali
                          </span>
                          <p className="text-slate-800 font-semibold leading-relaxed">
                            {dayMenu.lunch}
                          </p>
                        </div>

                        <div>
                          <span className="font-black text-indigo-600 uppercase text-[10px] flex items-center gap-1 mb-0.5">
                            <Moon className="w-3 h-3" /> Dinner
                          </span>
                          <p className="text-slate-800 font-semibold leading-relaxed">
                            {dayMenu.dinner}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveDay(day);
                        setViewMode('single');
                      }}
                      className="mt-4 pt-3 border-t border-slate-100 text-center w-full text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>Inspect {day} Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
          </>
        )}

      </section>

      {/* ── KITCHEN QUALITY & HYGIENE PLEDGE ──────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Our Kitchen Hygiene & Taste Pledge</h3>
            <p className="text-xs sm:text-sm text-slate-500">Standardized recipes with zero compromises on student health.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-100/60">
              <span className="text-3xl mb-2 block">💧</span>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">100% RO Water</h4>
              <p className="text-[11px] text-slate-500 mt-1">Purified cooking & washing water only</p>
            </div>

            <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-100/60">
              <span className="text-3xl mb-2 block">🌿</span>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">Daily Fresh Veggies</h4>
              <p className="text-[11px] text-slate-500 mt-1">Sourced early morning from local mandis</p>
            </div>

            <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-100/60">
              <span className="text-3xl mb-2 block">🚫</span>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">Zero Artificial Colors</h4>
              <p className="text-[11px] text-slate-500 mt-1">No tasting salts (MSG) or palm oils</p>
            </div>

            <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-100/60">
              <span className="text-3xl mb-2 block">🔥</span>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">Hot Insulated Box</h4>
              <p className="text-[11px] text-slate-500 mt-1">Delivered steaming hot to your room</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
