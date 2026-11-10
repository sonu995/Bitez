import React, { useState, useEffect } from 'react';
import { Utensils, Sparkles, Clock, ShieldCheck, MapPin } from 'lucide-react';

interface MealLoadingScreenProps {
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
  compact?: boolean;
}

export const MealLoadingScreen: React.FC<MealLoadingScreenProps> = ({
  message = 'Preparing Your Fresh Lunch Box...',
  subMessage = 'Daily hostel tiffin delivery • Packed with warmth & hygiene',
  fullScreen = true,
  compact = false,
}) => {
  const [loadingStep, setLoadingStep] = useState(0);

  const steps = [
    { title: 'Packing Fresh Lunch Box 🍱', desc: 'Fresh butter rotis, sabji, dal & rice packed inside insulated tiffin' },
    { title: 'Assigning Delivery Runner 🛵', desc: 'Rider dispatched to deliver directly to your hostel room' },
    { title: 'Live Kitchen Connection ⚡', desc: 'Syncing today\'s menu, meal quota & delivery schedule' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % steps.length);
    }, 2200);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div
      className={`flex flex-col items-center justify-center text-center select-none ${
        fullScreen
          ? 'min-h-screen w-full bg-[#FAF9F6] p-4 sm:p-6'
          : compact
          ? 'py-8 px-4 w-full'
          : 'py-12 sm:py-16 px-4 w-full bg-white/70 rounded-3xl border border-orange-100'
      }`}
    >
      {/* ── CENTRAL ANIMATED LUNCH BOX & DELIVERY VISUAL ── */}
      <div className="relative mb-6 sm:mb-8 flex items-center justify-center">
        {/* Ambient Gradient Glow Rings */}
        <div className="absolute w-44 h-44 sm:w-56 sm:h-56 bg-gradient-to-tr from-orange-500/20 via-amber-400/20 to-orange-600/10 rounded-full blur-2xl animate-pulse-slow pointer-events-none" />
        <div className="absolute w-36 h-36 sm:w-44 sm:h-44 bg-orange-400/15 rounded-full animate-ping opacity-25 pointer-events-none" />

        {/* Main Circular Food Delivery Podium */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-gradient-to-b from-white via-orange-50/60 to-amber-50/80 p-2.5 sm:p-3 shadow-xl border-2 border-orange-200/90 flex items-center justify-center overflow-hidden group">
          {/* Subtle Background Radial Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:12px_12px] opacity-15" />

          {/* Central Lunch Box & Food Delivery Image */}
          <div className="relative z-10 flex flex-col items-center justify-center animate-bounce-gentle">
            <div className="relative">
              {/* Lunch Box / Thali Image */}
              <img
                src="/categories/thali.png"
                alt="Lunch Box Tiffin"
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-lg transform transition-transform hover:scale-105"
                onError={(e) => {
                  // Fallback to high-quality Indian lunch box photo
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=compress&cs=tinysrgb&w=300';
                }}
              />

              {/* Rising Steam Animations */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-80 pointer-events-none">
                <span className="text-orange-500 text-xs sm:text-sm animate-float">♨️</span>
                <span className="text-amber-500 text-sm sm:text-base animate-float-delay -mt-1">♨️</span>
                <span className="text-orange-600 text-xs sm:text-sm animate-float-slow">♨️</span>
              </div>
            </div>
          </div>

          {/* Out for Delivery Scooter Badge (Riding over the Lunch Box corner) */}
          <div className="absolute -bottom-1 -right-1 z-20 bg-gradient-to-r from-orange-500 to-amber-500 text-white p-1.5 sm:p-2 rounded-2xl shadow-lg border-2 border-white flex items-center gap-1 animate-float-reverse">
            <span className="text-base sm:text-lg leading-none">🛵</span>
          </div>

          {/* Fresh Tiffin Quality Badge */}
          <div className="absolute -top-1 -left-1 z-20 bg-white/95 backdrop-blur-xs text-orange-600 p-1 sm:p-1.5 rounded-2xl shadow-md border border-orange-200 flex items-center gap-0.5">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 fill-amber-400" />
          </div>
        </div>

        {/* Floating Mini Pill 1: Hot Lunch Box */}
        <div className="absolute -left-6 sm:-left-12 top-4 bg-white/95 backdrop-blur-xs border border-orange-200/90 shadow-md px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black text-slate-800 flex items-center gap-1.5 animate-float hidden xs:flex">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>🍱 Hot Tiffin</span>
        </div>

        {/* Floating Mini Pill 2: Doorstep Hostel Delivery */}
        <div className="absolute -right-6 sm:-right-12 bottom-6 bg-white/95 backdrop-blur-xs border border-amber-200/90 shadow-md px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black text-slate-800 flex items-center gap-1.5 animate-float-delay hidden xs:flex">
          <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
          <span>Hostel Room</span>
        </div>
      </div>

      {/* ── HEADINGS & DYNAMIC STATUS ── */}
      <div className="max-w-md mx-auto space-y-1.5 px-2">
        <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
          {message}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
          {subMessage}
        </p>

        {/* Rotating Live Step Pill */}
        <div className="pt-2">
          <div className="inline-flex items-center gap-2 bg-orange-50/90 border border-orange-200/80 px-3.5 py-1.5 rounded-full shadow-2xs">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping shrink-0" />
            <span className="text-xs font-black text-orange-800 tracking-wide">
              {steps[loadingStep].title}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto truncate font-medium">
            {steps[loadingStep].desc}
          </p>
        </div>
      </div>

      {/* ── ANIMATED DELIVERY ROAD & PROGRESS BAR ── */}
      <div className="mt-5 sm:mt-6 w-full max-w-xs px-4">
        {/* Moving Scooter Track */}
        <div className="relative w-full mb-1">
          <div
            className="absolute -top-3.5 text-base transition-all duration-700 ease-out pointer-events-none"
            style={{
              left: `${((loadingStep + 1) / steps.length) * 80}%`,
              transform: 'translateX(-50%)',
            }}
          >
            🛵
          </div>
        </div>

        {/* The Track Line */}
        <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden shadow-inner p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 transition-all duration-700 ease-out shadow-sm animate-shimmer"
            style={{ width: `${((loadingStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Bottom Trust Icons */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mt-3 px-1">
          <span className="flex items-center gap-1">
            <Utensils className="w-3 h-3 text-orange-500" /> 100% Homestyle
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-500" /> On-Time Tiffin
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" /> FSSAI Certified
          </span>
        </div>
      </div>
    </div>
  );
};

export default MealLoadingScreen;
