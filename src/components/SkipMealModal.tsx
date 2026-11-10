import React, { useState, useEffect } from 'react';
import {
  X,
  Sun,
  Moon,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Wallet,
  Sparkles,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { subscriptionsAPI } from '../services/api';

interface SkipMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: any;
  userWalletBalance?: number;
  onSuccess: (message: string, credit: number) => void;
}

export default function SkipMealModal({
  isOpen,
  onClose,
  subscription,
  userWalletBalance = 0,
  onSuccess
}: SkipMealModalProps) {
  // Helper to get formatted IST date and time
  const getTodayIST = () => {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const ist = new Date(utc + istOffset);
    const year = ist.getFullYear();
    const month = String(ist.getMonth() + 1).padStart(2, '0');
    const day = String(ist.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const totalMinutes = ist.getHours() * 60 + ist.getMinutes();
    return { dateStr, totalMinutes, hours: ist.getHours(), minutes: ist.getMinutes() };
  };

  const { dateStr: todayStr, totalMinutes: currentMins } = getTodayIST();

  // Tomorrow calculation
  const getFutureDateStr = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const tomorrowStr = getFutureDateStr(1);
  const dayAfterStr = getFutureDateStr(2);

  const [mealTimings, setMealTimings] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      subscriptionsAPI.getCutoffStatus?.().then((res: any) => {
        if (res?.success && res.timings) {
          setMealTimings(res.timings);
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  // Dynamic Cutoff timings configured by Admin
  const BREAKFAST_CUTOFF_MINS = mealTimings?.breakfast?.skipCutoffMinutes ?? (7 * 60);
  const LUNCH_CUTOFF_MINS = mealTimings?.lunch?.skipCutoffMinutes ?? (10 * 60 + 30);
  const DINNER_CUTOFF_MINS = mealTimings?.dinner?.skipCutoffMinutes ?? (17 * 60 + 30);

  const isTodayBreakfastCutoffPassed = mealTimings?.breakfast?.enabled === false || currentMins > BREAKFAST_CUTOFF_MINS;
  const isTodayLunchCutoffPassed = mealTimings?.lunch?.enabled === false || currentMins > LUNCH_CUTOFF_MINS;
  const isTodayDinnerCutoffPassed = mealTimings?.dinner?.enabled === false || currentMins > DINNER_CUTOFF_MINS;

  // Check if a specific meal on a date is already skipped in subscription history
  const isMealSkipped = (date: string, meal: 'breakfast' | 'lunch' | 'dinner') => {
    if (!Array.isArray(subscription?.skipHistory)) return false;
    return subscription.skipHistory.some((s: any) => {
      const sMeal = (s.mealType || s.meal || '').toLowerCase();
      return s.date === date && sMeal.includes(meal);
    });
  };

  const isMealCutoff = (date: string, meal: 'breakfast' | 'lunch' | 'dinner') => {
    if (date !== todayStr) return false;
    return meal === 'breakfast' ? isTodayBreakfastCutoffPassed : meal === 'lunch' ? isTodayLunchCutoffPassed : isTodayDinnerCutoffPassed;
  };

  const isMealAvailable = (date: string, meal: 'breakfast' | 'lunch' | 'dinner') => {
    return !isMealCutoff(date, meal) && !isMealSkipped(date, meal);
  };

  // Initial smart selection:
  // If today has any meal available -> today; else tomorrow
  const getInitialDate = () => {
    if (isMealAvailable(todayStr, 'breakfast') || isMealAvailable(todayStr, 'lunch') || isMealAvailable(todayStr, 'dinner')) {
      return todayStr;
    }
    return tomorrowStr;
  };

  const getInitialMeal = (targetDate: string): 'breakfast' | 'lunch' | 'dinner' => {
    if (isMealAvailable(targetDate, 'breakfast')) return 'breakfast';
    if (isMealAvailable(targetDate, 'lunch')) return 'lunch';
    if (isMealAvailable(targetDate, 'dinner')) return 'dinner';
    return 'breakfast';
  };

  const [selectedDate, setSelectedDate] = useState<string>(getInitialDate());
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner'>(getInitialMeal(getInitialDate()));
  const [reason, setReason] = useState<string>('Eating out with friends');
  const [customReason, setCustomReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen || !subscription) return null;

  // Proportional refund calculation
  const monthlyPrice = subscription?.planId?.monthlyPrice || subscription?.amountPaid || 2499;
  const mealsPerDay = subscription?.planId?.mealsPerDay || 2;
  const refundPerMeal = Math.max(50, Math.round(monthlyPrice / (mealsPerDay * 30)));

  // Live status for the selected date
  const isSelectedDateToday = selectedDate === todayStr;
  const breakfastCutoff = isMealCutoff(selectedDate, 'breakfast');
  const breakfastSkipped = isMealSkipped(selectedDate, 'breakfast');
  const breakfastDisabled = breakfastCutoff || breakfastSkipped;

  const lunchCutoff = isMealCutoff(selectedDate, 'lunch');
  const lunchSkipped = isMealSkipped(selectedDate, 'lunch');
  const lunchDisabled = lunchCutoff || lunchSkipped;

  const dinnerCutoff = isMealCutoff(selectedDate, 'dinner');
  const dinnerSkipped = isMealSkipped(selectedDate, 'dinner');
  const dinnerDisabled = dinnerCutoff || dinnerSkipped;

  const bothDisabled = breakfastDisabled && lunchDisabled && dinnerDisabled;
  const currentSelectionDisabled = selectedMeal === 'breakfast' ? breakfastDisabled : selectedMeal === 'lunch' ? lunchDisabled : dinnerDisabled;
  const alreadySkipped = selectedMeal === 'breakfast' ? breakfastSkipped : selectedMeal === 'lunch' ? lunchSkipped : dinnerSkipped;

  // When date changes, adjust meal selection if current choice is disabled
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setErrorMsg('');
    if (!isMealAvailable(newDate, selectedMeal)) {
      if (isMealAvailable(newDate, 'breakfast')) {
        setSelectedMeal('breakfast');
      } else if (isMealAvailable(newDate, 'lunch')) {
        setSelectedMeal('lunch');
      } else if (isMealAvailable(newDate, 'dinner')) {
        setSelectedMeal('dinner');
      }
    }
  };

  const handleSelectMeal = (meal: 'breakfast' | 'lunch' | 'dinner') => {
    const isCutoff = isMealCutoff(selectedDate, meal);
    const isSkipped = isMealSkipped(selectedDate, meal);
    if (isCutoff) {
      const timeStr = meal === 'breakfast' ? (mealTimings?.breakfast?.skipCutoffTimeStr || '07:00 AM') : meal === 'lunch' ? (mealTimings?.lunch?.skipCutoffTimeStr || '10:30 AM') : (mealTimings?.dinner?.skipCutoffTimeStr || '05:30 PM');
      setErrorMsg(`Cutoff passed for Today's ${meal === 'breakfast' ? 'Breakfast' : meal === 'lunch' ? 'Lunch' : 'Dinner'} (${timeStr}). Please choose another meal or schedule for tomorrow!`);
      return;
    }
    if (isSkipped) {
      setErrorMsg(`You have already submitted a skip request for ${meal === 'breakfast' ? 'Breakfast' : meal === 'lunch' ? 'Lunch' : 'Dinner'} on ${selectedDate}.`);
      return;
    }
    setSelectedMeal(meal);
    setErrorMsg('');
  };

  // Remaining minutes display for today
  const getRemainingTimeText = (meal: 'breakfast' | 'lunch' | 'dinner') => {
    const isSkipped = isMealSkipped(selectedDate, meal);
    if (isSkipped) {
      return 'Already scheduled for skip & refund';
    }
    if (!isSelectedDateToday) return 'Available for this date';
    const targetMins = meal === 'breakfast' ? BREAKFAST_CUTOFF_MINS : meal === 'lunch' ? LUNCH_CUTOFF_MINS : DINNER_CUTOFF_MINS;
    const timeStr = meal === 'breakfast' ? (mealTimings?.breakfast?.skipCutoffTimeStr || '07:00 AM') : meal === 'lunch' ? (mealTimings?.lunch?.skipCutoffTimeStr || '10:30 AM') : (mealTimings?.dinner?.skipCutoffTimeStr || '05:30 PM');
    if (currentMins > targetMins) {
      return `Cutoff passed (${timeStr} deadline)`;
    }
    const diff = targetMins - currentMins;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return `Closes in ${h > 0 ? `${h}h ` : ''}${m}m (Cutoff: ${timeStr})`;
  };

  const QUICK_REASONS = [
    'Eating out with friends / Zomato',
    'Going home for the weekend',
    'Fast / Vrat (Navratri/Tuesday)',
    'Late classes & exam prep',
    'Traveling outside campus',
    'Other reason'
  ];

  const handleSubmit = async () => {
    setErrorMsg('');
    if (selectedMeal === 'breakfast' && breakfastCutoff) {
      setErrorMsg("Cutoff passed for Today's Breakfast! Must be requested before 07:00 AM.");
      return;
    }
    if (selectedMeal === 'lunch' && lunchCutoff) {
      setErrorMsg("Cutoff passed for Today's Lunch! Must be requested at least 2 hours before 12:30 PM delivery (before 10:30 AM).");
      return;
    }
    if (selectedMeal === 'dinner' && dinnerCutoff) {
      setErrorMsg("Cutoff passed for Today's Dinner! Must be requested at least 2 hours before 07:30 PM delivery (before 05:30 PM).");
      return;
    }
    if (alreadySkipped) {
      setErrorMsg(`You have already skipped ${selectedMeal === 'breakfast' ? 'Breakfast' : selectedMeal === 'lunch' ? 'Lunch' : 'Dinner'} for ${selectedDate}.`);
      return;
    }

    const subId = subscription._id || subscription.id;
    if (!subId) {
      setErrorMsg('Subscription not found.');
      return;
    }

    setLoading(true);
    try {
      const finalReason = reason === 'Other reason' && customReason.trim() ? customReason.trim() : reason;
      const res = await subscriptionsAPI.skipMeal(subId, {
        mealType: selectedMeal,
        date: selectedDate,
        reason: finalReason
      });

      if (res.success) {
        onSuccess(res.message || 'Meal skipped successfully!', res.creditAdded || refundPerMeal);
        onClose();
      } else {
        setErrorMsg(res.message || 'Failed to skip meal');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to skip meal. Please check cutoff policy.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/15 hover:bg-black/30 flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-100">
            <Sparkles size={14} />
            <span>Smart Mess Meal Management</span>
          </div>
          <h2 className="text-xl font-black mt-1">Request Meal Skip</h2>
          <p className="text-xs text-orange-100 mt-1">
            Choose specifically Lunch or Dinner • Skipped meal is added directly to your Meals Remaining balance
          </p>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-slate-800 flex-1">

          {/* ⏱️ Strict 2-Hour Advance Policy Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-extrabold block mb-1">⏱️ Advance Cutoff Policy:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-amber-800">
                <li>
                  <strong>🌅 Breakfast (08:00 AM delivery):</strong> Cutoff is <strong>07:00 AM</strong>
                </li>
                <li>
                  <strong>☀️ Lunch (12:30 PM delivery):</strong> Cutoff is <strong>10:30 AM</strong>
                </li>
                <li>
                  <strong>🌙 Dinner (07:30 PM delivery):</strong> Cutoff is <strong>05:30 PM</strong>
                </li>
                <li>Future dates can always be skipped anytime in advance!</li>
              </ul>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs font-medium">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Date Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Calendar size={14} className="text-orange-500" />
              <span>1. Select Date:</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDateChange(todayStr)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                  selectedDate === todayStr
                    ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                Today
                <span className="block text-[10px] font-normal opacity-85 mt-0.5">
                  {todayStr.slice(5)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDateChange(tomorrowStr)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                  selectedDate === tomorrowStr
                    ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                Tomorrow
                <span className="block text-[10px] font-normal opacity-85 mt-0.5">
                  {tomorrowStr.slice(5)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDateChange(dayAfterStr)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                  selectedDate === dayAfterStr
                    ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                Day After
                <span className="block text-[10px] font-normal opacity-85 mt-0.5">
                  {dayAfterStr.slice(5)}
                </span>
              </button>
            </div>

            {/* Custom Date Input */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Or pick custom:</span>
              <input
                type="date"
                min={todayStr}
                value={selectedDate}
                onChange={e => handleDateChange(e.target.value)}
                className="text-xs py-1 px-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-medium focus:ring-1 focus:ring-orange-400 outline-none"
              />
            </div>
          </div>

          {/* 2. Choose Specifically Breakfast, Lunch or Dinner */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-orange-500" />
                <span>2. Choose Meal to Skip:</span>
              </span>
              <span className="text-[11px] font-normal text-slate-400">Strictly 1 meal per skip</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* 🌅 Breakfast Card */}
              <div
                onClick={() => handleSelectMeal('breakfast')}
                className={`relative p-3 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                  breakfastSkipped
                    ? 'border-amber-300 bg-amber-50/70 shadow-xs cursor-pointer'
                    : breakfastCutoff
                    ? 'border-slate-200 bg-slate-100/70 opacity-60 cursor-not-allowed'
                    : selectedMeal === 'breakfast'
                    ? 'border-orange-500 bg-orange-50/70 shadow-md cursor-pointer'
                    : 'border-slate-200 hover:border-orange-300 bg-white cursor-pointer'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                      🌅
                    </div>
                    {breakfastSkipped ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        ⚠️ Skipped
                      </span>
                    ) : breakfastCutoff ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                        🚫 Cutoff Passed
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                        ✅ Available
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">🌅 {mealTimings?.breakfast?.label || 'Breakfast'}</h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">{mealTimings?.breakfast?.deliveryTimeStr || '08:00 AM – 09:30 AM'}</p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100/80 text-[10px]">
                  <span className={`font-semibold ${breakfastSkipped ? 'text-amber-800' : breakfastCutoff ? 'text-rose-600' : 'text-orange-700'}`}>
                    {breakfastSkipped ? 'Skip request submitted' : getRemainingTimeText('breakfast')}
                  </span>
                </div>
              </div>

              {/* ☀️ Lunch Card */}
              <div
                onClick={() => handleSelectMeal('lunch')}
                className={`relative p-3 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                  lunchSkipped
                    ? 'border-amber-300 bg-amber-50/70 shadow-xs cursor-pointer'
                    : lunchCutoff
                    ? 'border-slate-200 bg-slate-100/70 opacity-60 cursor-not-allowed'
                    : selectedMeal === 'lunch'
                    ? 'border-orange-500 bg-orange-50/70 shadow-md cursor-pointer'
                    : 'border-slate-200 hover:border-orange-300 bg-white cursor-pointer'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                      <Sun size={18} />
                    </div>
                    {lunchSkipped ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        ⚠️ Skipped
                      </span>
                    ) : lunchCutoff ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                        🚫 Cutoff Passed
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                        ✅ Available
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">☀️ {mealTimings?.lunch?.label || 'Lunch Thali'}</h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">{mealTimings?.lunch?.deliveryTimeStr || '12:30 PM – 02:00 PM'}</p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100/80 text-[10px]">
                  <span className={`font-semibold ${lunchSkipped ? 'text-amber-800' : lunchCutoff ? 'text-rose-600' : 'text-amber-700'}`}>
                    {lunchSkipped ? 'Skip request submitted' : getRemainingTimeText('lunch')}
                  </span>
                </div>
              </div>

              {/* 🌙 Dinner Card */}
              <div
                onClick={() => handleSelectMeal('dinner')}
                className={`relative p-3 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                  dinnerSkipped
                    ? 'border-amber-300 bg-amber-50/70 shadow-xs cursor-pointer'
                    : dinnerCutoff
                    ? 'border-slate-200 bg-slate-100/70 opacity-60 cursor-not-allowed'
                    : selectedMeal === 'dinner'
                    ? 'border-orange-500 bg-orange-50/70 shadow-md cursor-pointer'
                    : 'border-slate-200 hover:border-orange-300 bg-white cursor-pointer'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                      <Moon size={18} />
                    </div>
                    {dinnerSkipped ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        ⚠️ Skipped
                      </span>
                    ) : dinnerCutoff ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                        🚫 Cutoff Passed
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                        ✅ Available
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">🌙 {mealTimings?.dinner?.label || 'Dinner Feast'}</h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">{mealTimings?.dinner?.deliveryTimeStr || '07:30 PM – 09:15 PM'}</p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100/80 text-[10px]">
                  <span className={`font-semibold ${dinnerSkipped ? 'text-amber-800' : dinnerCutoff ? 'text-rose-600' : 'text-indigo-700'}`}>
                    {dinnerSkipped ? 'Skip request submitted' : getRemainingTimeText('dinner')}
                  </span>
                </div>
              </div>
            </div>

            {/* Banner if both meals on this date are unavailable */}
            {bothDisabled && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-start gap-2.5 font-medium">
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">All meals on {selectedDate === todayStr ? 'Today' : selectedDate} are unavailable or already skipped!</span>
                  <span>Please choose <strong>Tomorrow ({tomorrowStr})</strong> or pick a future date above to schedule a skip.</span>
                </div>
              </div>
            )}
          </div>

          {/* 3. Reason for Skipping */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              3. Reason for Skipping (Helps Kitchen Forecast):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_REASONS.map(r => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setReason(r)}
                  className={`text-[11px] px-2.5 py-1.5 rounded-xl border transition cursor-pointer ${
                    reason === r
                      ? 'bg-orange-100 border-orange-400 text-orange-800 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {reason === 'Other reason' && (
              <input
                type="text"
                placeholder="Type your reason..."
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
                className="mt-2 w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:border-orange-500"
              />
            )}
          </div>

          {/* 4. Meals Remaining Rollover Preview Box */}
          <div className="p-4 bg-emerald-50/90 border-2 border-emerald-300 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">
                  🍽️
                </div>
                <div>
                  <span className="text-xs font-black text-emerald-950 block">Meal Rollover to Remaining Meals</span>
                  <span className="text-[10px] text-emerald-700 font-medium">Meal quota preserved (No wallet cash added)</span>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-800 bg-white px-3 py-1 rounded-xl border border-emerald-300 shadow-xs">
                +1 Meal Added
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-700 border-t border-emerald-200/80 pt-2.5">
              <div className="flex justify-between items-center bg-white/80 p-2 rounded-xl border border-emerald-100">
                <span className="font-bold text-slate-800">Remaining Meals Balance:</span>
                <span className="font-black text-emerald-700 text-sm">
                  {subscription.remainingMeals || 0} ➔ {(subscription.remainingMeals || 0) + 1} Meals (+1 Saved)
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 px-1">
                <span>Total Skipped Meals Counter:</span>
                <span className="font-semibold text-slate-700">{(subscription.skippedMeals || 0)} ➔ {(subscription.skippedMeals || 0) + 1}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 px-1">
                <span>Student Wallet Balance:</span>
                <span className="font-semibold text-slate-700">₹{userWalletBalance} (Unchanged)</span>
              </div>
            </div>
          </div>

          {/* Already skipped warning */}
          {alreadySkipped && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-800 text-xs flex items-center gap-2 font-medium">
              <AlertCircle size={16} className="text-amber-600 shrink-0" />
              <span>You have already scheduled a skip for {selectedMeal.toUpperCase()} on this date.</span>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            Keep My Meal
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || currentSelectionDisabled}
            className={`flex-1 py-2.5 px-4 text-xs font-black rounded-xl shadow-md transition flex items-center justify-center gap-2 ${
              currentSelectionDisabled
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed opacity-90 border border-slate-300'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white cursor-pointer'
            }`}
          >
            {loading ? (
              <span>Sending Request to Admin...</span>
            ) : currentSelectionDisabled ? (
              <span>
                {selectedMeal === 'breakfast'
                  ? (breakfastSkipped ? '⚠️ Breakfast Already Skipped' : '🚫 Breakfast Cutoff Passed')
                  : selectedMeal === 'lunch'
                  ? (lunchSkipped ? '⚠️ Lunch Already Skipped' : '🚫 Lunch Cutoff Passed')
                  : (dinnerSkipped ? '⚠️ Dinner Already Skipped' : '🚫 Dinner Cutoff Passed')}
              </span>
            ) : (
              <>
                <span>Send Skip Request ({selectedMeal === 'breakfast' ? '🌅 Breakfast' : selectedMeal === 'lunch' ? '☀️ Lunch' : '🌙 Dinner'}) • +1 Meal Added</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
