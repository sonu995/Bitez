const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const User = require('../models/User');
const Order = require('../models/Order');
const { getModel } = require('../config/adapter');
const { protect, adminOnly } = require('../middleware/auth');
const { getOrCreateMealTimings } = require('./mealTimingsHelper');

// @route  GET /api/subscriptions  — all subscriptions for admin
// @access Admin / Staff
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const subs = await Subscription.find()
      .populate('userId', 'name email phone walletBalance deliveryAddress')
      .populate('planId', 'name monthlyPrice mealsPerDay description features')
      .sort({ createdAt: -1 });

    // Stats
    const total = subs.length;
    const active = subs.filter(s => s.status === 'active').length;
    const paused = subs.filter(s => s.status === 'paused').length;
    const expired = subs.filter(s => s.status === 'expired').length;
    const revenue = subs.reduce((sum, s) => sum + (s.amountPaid || 0), 0);

    res.json({ success: true, subscriptions: subs, stats: { total, active, paused, expired, revenue } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  GET /api/subscriptions/me  — current user's active/paused subscription
// @access Private
router.get('/me', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    let sub = await Subscription.findOne({ userId, status: 'active' }).populate('planId');

    if (!sub && req.user.activeSubscription) {
      sub = await Subscription.findById(req.user.activeSubscription).populate('planId');
    }

    if (!sub) {
      sub = await Subscription.findOne({ userId, status: 'paused' }).populate('planId');
    }

    // Enforce automatic expiry if endDate has elapsed or meal balance reached 0
    if (sub && sub.status === 'active') {
      const isDateExpired = sub.endDate && new Date(sub.endDate).getTime() < Date.now();
      const isQuotaEmpty = typeof sub.remainingMeals === 'number' && sub.remainingMeals <= 0;
      if (isDateExpired || isQuotaEmpty) {
        sub.status = 'expired';
        if (typeof sub.save === 'function') await sub.save();
      }
    }

    res.json({ success: true, subscription: sub || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Helper: get current date & time in Indian Standard Time (IST, UTC+5:30)
function getISTDateTime() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
  const istDate = new Date(utc + istOffset);
  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  return { now: istDate, dateStr, hours, minutes, totalMinutes };
}

// @route  GET /api/subscriptions/cutoff-status
// @desc   Check live cutoff eligibility for lunch & dinner (dynamic mess cutoff timings)
// @access Public / Private
router.get('/cutoff-status', async (req, res) => {
  try {
    const timings = await getOrCreateMealTimings();
    const { dateStr, hours, minutes, totalMinutes } = getISTDateTime();

    const breakfastCutoffMins = timings.breakfast?.skipCutoffMinutes ?? (7 * 60);
    const lunchCutoffMins = timings.lunch?.skipCutoffMinutes ?? (10 * 60 + 30);
    const dinnerCutoffMins = timings.dinner?.skipCutoffMinutes ?? (17 * 60 + 30);

    const breakfastAvailableToday = Boolean(timings.breakfast?.enabled !== false && totalMinutes <= breakfastCutoffMins);
    const lunchAvailableToday = Boolean(timings.lunch?.enabled !== false && totalMinutes <= lunchCutoffMins);
    const dinnerAvailableToday = Boolean(timings.dinner?.enabled !== false && totalMinutes <= dinnerCutoffMins);

    const breakfastRemainingMins = Math.max(0, breakfastCutoffMins - totalMinutes);
    const lunchRemainingMins = Math.max(0, lunchCutoffMins - totalMinutes);
    const dinnerRemainingMins = Math.max(0, dinnerCutoffMins - totalMinutes);

    res.json({
      success: true,
      currentServerTimeIST: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
      todayDate: dateStr,
      timings,
      policy: {
        cutoffHours: 2,
        breakfast: {
          deliveryTime: timings.breakfast?.deliveryTimeStr || '08:00 AM',
          cutoffTime: timings.breakfast?.skipCutoffTimeStr || '07:00 AM',
          enabled: timings.breakfast?.enabled !== false,
          availableToday: breakfastAvailableToday,
          minutesLeftToday: breakfastRemainingMins,
          message: timings.breakfast?.enabled === false
            ? 'Breakfast service is currently disabled.'
            : breakfastAvailableToday
              ? `Available for Today (${Math.floor(breakfastRemainingMins / 60)}h ${breakfastRemainingMins % 60}m left)`
              : `Cutoff passed for Today (${timings.breakfast?.skipCutoffTimeStr || '07:00 AM'} deadline elapsed). Available for tomorrow onwards.`
        },
        lunch: {
          deliveryTime: timings.lunch?.deliveryTimeStr || '12:30 PM',
          cutoffTime: timings.lunch?.skipCutoffTimeStr || '10:30 AM',
          enabled: timings.lunch?.enabled !== false,
          availableToday: lunchAvailableToday,
          minutesLeftToday: lunchRemainingMins,
          message: timings.lunch?.enabled === false
            ? 'Lunch service is currently disabled.'
            : lunchAvailableToday
              ? `Available for Today (${Math.floor(lunchRemainingMins / 60)}h ${lunchRemainingMins % 60}m left)`
              : `Cutoff passed for Today (${timings.lunch?.skipCutoffTimeStr || '10:30 AM'} deadline elapsed). Available for tomorrow onwards.`
        },
        dinner: {
          deliveryTime: timings.dinner?.deliveryTimeStr || '07:30 PM',
          cutoffTime: timings.dinner?.skipCutoffTimeStr || '05:30 PM',
          enabled: timings.dinner?.enabled !== false,
          availableToday: dinnerAvailableToday,
          minutesLeftToday: dinnerRemainingMins,
          message: timings.dinner?.enabled === false
            ? 'Dinner service is currently disabled.'
            : dinnerAvailableToday
              ? `Available for Today (${Math.floor(dinnerRemainingMins / 60)}h ${dinnerRemainingMins % 60}m left)`
              : `Cutoff passed for Today (${timings.dinner?.skipCutoffTimeStr || '05:30 PM'} deadline elapsed). Available for tomorrow onwards.`
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  GET /api/subscriptions/:id — individual subscription full details
// @access Private (Owner or Admin)
router.get('/:id', protect, async (req, res) => {
  try {
    let sub = await Subscription.findById(req.params.id)
      .populate('userId', 'name email phone walletBalance deliveryAddress')
      .populate('planId');

    if (!sub) {
      sub = await Subscription.findOne({ id: req.params.id })
        .populate('userId', 'name email phone walletBalance deliveryAddress')
        .populate('planId');
    }

    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

    const ownerId = String(sub.userId?._id || sub.userId?.id || sub.userId || '');
    const requesterId = String(req.user._id || req.user.id || '');
    if (ownerId !== requesterId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this subscription' });
    }

    res.json({ success: true, subscription: sub });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  GET /api/subscriptions/:id/orders — subscriber orders and delivery history
// @access Private (Owner or Admin)
router.get('/:id/orders', protect, async (req, res) => {
  try {
    const paramId = req.params.id;
    let sub = await Subscription.findById(paramId).populate('userId').populate('planId');
    if (!sub) sub = await Subscription.findOne({ id: paramId }).populate('userId').populate('planId');

    let user = null;
    if (!sub) {
      user = await User.findById(paramId);
      if (!user) user = await User.findOne({ id: paramId });
      if (user) {
        sub = await Subscription.findOne({ userId: user._id || user.id }).populate('userId').populate('planId');
      }
    } else {
      user = sub.userId;
    }

    const targetUserId = user ? String(user._id || user.id) : (sub?.userId ? String(sub.userId._id || sub.userId.id || sub.userId) : null);
    const userName = (user?.name || sub?.userId?.name || '').trim();
    const userPhone = (user?.phone || sub?.userId?.phone || '').trim();

    const allOrders = await Order.find().sort({ createdAt: -1 });
    const matchedOrders = allOrders.filter(o => {
      const oUid = String(o.userId || '');
      if (targetUserId && oUid === targetUserId) return true;
      if (userName && o.customerName && o.customerName.toLowerCase() === userName.toLowerCase()) return true;
      if (userPhone && o.customerPhone && (o.customerPhone.includes(userPhone) || userPhone.includes(o.customerPhone))) return true;
      return false;
    });

    const DispatchRoster = getModel('dispatchRoster');
    const allDispatches = await DispatchRoster.find();
    const matchedDispatches = allDispatches.filter(d => {
      if (userName && d.student && d.student.toLowerCase().includes(userName.toLowerCase())) return true;
      if (sub?.room && d.hostel && d.hostel.includes(sub.room)) return true;
      return false;
    });

    const SkipRequest = getModel('skipRequests');
    const allSkips = await SkipRequest.find();
    const matchedSkips = allSkips.filter(s => {
      if (targetUserId && String(s.studentId || '') === targetUserId) return true;
      if (userName && s.student && s.student.toLowerCase().includes(userName.toLowerCase())) return true;
      return false;
    });

    const allSubs = await Subscription.find().populate('planId').sort({ createdAt: -1 });
    const subscriptionHistory = allSubs.filter(s => {
      const sUid = typeof s.userId === 'object' ? String(s.userId?._id || s.userId?.id || '') : String(s.userId || '');
      return targetUserId && sUid === targetUserId;
    });

    res.json({
      success: true,
      subscriber: sub,
      user,
      stats: {
        totalOrders: matchedOrders.length,
        totalSpent: matchedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
        dispatchesCount: matchedDispatches.length,
        skipsCount: matchedSkips.length
      },
      orders: matchedOrders,
      dispatches: matchedDispatches,
      skips: matchedSkips,
      subscriptionHistory
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  POST /api/subscriptions/manual — admin manually subscribes a student
// @access Admin
router.post('/manual', protect, adminOnly, async (req, res) => {
  try {
    const {
      studentName,
      studentEmail,
      studentPhone,
      hostel,
      room,
      zoneCode,
      planId,
      billingCycle,
      amountPaid,
      paymentMethod,
      startDate,
      mealsCount,
      dietPreference
    } = req.body;

    let user = await User.findOne({ email: studentEmail });
    if (!user) {
      user = await User.create({
        name: studentName || 'Student Member',
        email: studentEmail || `student_${Date.now()}@campus.edu`,
        phone: studentPhone || '',
        password: 'password123',
        role: 'customer',
        walletBalance: 0
      });
    }

    const plan = await Plan.findById(planId);
    let durationDays = billingCycle === 'semester' ? 180 : billingCycle === 'weekly' ? 7 : 30;
    const start = new Date(startDate || Date.now());
    const end = new Date(start);
    end.setDate(end.getDate() + durationDays);

    const calculatedMeals = Number(mealsCount) || ((plan?.mealsPerDay || 2) * durationDays);

    const sub = await Subscription.create({
      userId: user._id || user.id,
      planId: plan ? (plan._id || plan.id) : null,
      billingCycle: billingCycle || 'monthly',
      startDate: start,
      endDate: end,
      amountPaid: Number(amountPaid) || (plan?.monthlyPrice || 3999),
      remainingMeals: calculatedMeals,
      totalMeals: calculatedMeals,
      status: 'active',
      paymentMethod: paymentMethod || 'UPI / Online',
      dietPreference: dietPreference || 'Standard Homestyle',
      hostelAddress: `${hostel || 'Tagore Hostel'}, Room ${room || '204'} (${zoneCode || 'NC-01'})`
    });

    await User.findByIdAndUpdate(user._id || user.id, { activeSubscription: sub._id || sub.id });
    if (plan) {
      await Plan.findByIdAndUpdate(plan._id || plan.id, { $inc: { activeSubscribers: 1 } });
    }

    const populated = await Subscription.findById(sub._id || sub.id)
      .populate('userId', 'name email phone')
      .populate('planId', 'name monthlyPrice mealsPerDay');

    res.status(201).json({ success: true, subscription: populated || sub });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  POST /api/subscriptions  — subscribe to a plan (student checkout)
// @access Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      planId,
      billingCycle,
      hostelAddress,
      room,
      zoneCode,
      dietPreference,
      paymentMethod,
      forceReplace
    } = req.body;

    const userId = req.user._id || req.user.id;

    // Resolve plan by ID or by name
    let plan = null;
    if (planId) {
      plan = await Plan.findById(planId);
      if (!plan) {
        const allPlans = await Plan.find();
        plan = allPlans.find(p =>
          String(p._id) === String(planId) ||
          String(p.id) === String(planId) ||
          p.name.toLowerCase().includes(String(planId).toLowerCase()) ||
          String(planId).toLowerCase().includes(p.name.toLowerCase())
        );
      }
    }
    if (!plan) {
      const allPlans = await Plan.find();
      plan = allPlans.find(p => p.name === 'Standard') || allPlans[0];
    }

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    // Check existing active subscription
    const existing = await Subscription.findOne({ userId, status: 'active' });
    if (existing) {
      if (forceReplace) {
        existing.status = 'replaced';
        await existing.save();
        if (existing.planId) {
          await Plan.findByIdAndUpdate(existing.planId, { $inc: { activeSubscribers: -1 } });
        }
      } else {
        return res.status(400).json({
          success: false,
          hasActiveSubscription: true,
          existingSubscriptionId: existing._id || existing.id,
          message: 'You already have an active subscription! Please select Upgrade/Switch to change your plan.'
        });
      }
    }

    // Calculate amount and duration
    let durationDays = billingCycle === 'semester' ? 180 : 30;
    let amountPaid = plan.monthlyPrice;

    if (billingCycle === 'semester') {
      amountPaid = Math.round(plan.monthlyPrice * 0.85 * 6); // 6 months × 15% discount
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays);

    const mealsPerDay = plan.mealsPerDay || 2;
    const totalMeals = mealsPerDay * durationDays;

    const fullHostel = hostelAddress
      ? `${hostelAddress}${room ? `, Room ${room}` : ''}${zoneCode ? ` (${zoneCode})` : ''}`
      : (req.user.deliveryAddress || 'Tagore Hostel, Room 204 (NC-01)');

    const sub = await Subscription.create({
      userId,
      planId: plan._id || plan.id,
      billingCycle: billingCycle || 'monthly',
      startDate,
      endDate,
      amountPaid,
      remainingMeals: totalMeals,
      totalMeals: totalMeals,
      status: 'active',
      paymentMethod: paymentMethod || 'Bitez Wallet / Online',
      dietPreference: dietPreference || 'Standard Homestyle',
      hostelAddress: fullHostel,
      room: room || '',
      zoneCode: zoneCode || 'NC-01'
    });

    // Update user's active subscription & increment plan count
    await User.findByIdAndUpdate(userId, { activeSubscription: sub._id || sub.id });
    await Plan.findByIdAndUpdate(plan._id || plan.id, { $inc: { activeSubscribers: 1 } });

    // Sync into Dispatch Roster so Admin Daily Dispatch sees student right away
    try {
      const DispatchRoster = getModel('dispatchRoster');
      if (DispatchRoster) {
        const newDispatchId = `TIF-${Math.floor(100 + Math.random() * 900)}`;
        const zoneNameMap = {
          'NC-01': 'North Campus',
          'SC-02': 'South Campus',
          'MN-03': 'Mukherjee Nagar',
          'GT-04': 'GTB Nagar'
        };
        await DispatchRoster.create({
          id: newDispatchId,
          _id: newDispatchId,
          student: req.user.name || 'Student Member',
          hostel: fullHostel,
          zoneCode: zoneCode || 'NC-01',
          zoneName: zoneNameMap[zoneCode] || 'North Campus',
          route: zoneCode === 'SC-02' ? 'Girls Complex' : zoneCode === 'MN-03' ? 'Mukherjee Nagar' : 'North Campus',
          rider: 'Unassigned',
          plan: `${plan.name} (${mealsPerDay} Meals)`,
          slot: 'Lunch & Dinner',
          status: 'dispatched',
          extras: dietPreference || 'Homestyle',
          deliveredAt: 'Scheduled'
        });
      }
    } catch (dispatchErr) {
      console.warn('Dispatch roster sync warning:', dispatchErr.message);
    }

    const populated = await Subscription.findById(sub._id || sub.id)
      .populate('userId', 'name email phone')
      .populate('planId');

    res.status(201).json({ success: true, subscription: populated || sub });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  PUT /api/subscriptions/:id — update preferences (diet, room, delivery address)
// @access Private
router.put('/:id', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    let sub = await Subscription.findById(req.params.id);
    if (!sub) sub = await Subscription.findOne({ _id: req.params.id });
    if (!sub) sub = await Subscription.findOne({ id: req.params.id });

    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

    if (String(sub.userId) !== String(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized for this subscription' });
    }

    const { dietPreference, hostelAddress, room, zoneCode } = req.body;
    if (dietPreference !== undefined) sub.dietPreference = dietPreference;
    if (hostelAddress !== undefined) sub.hostelAddress = hostelAddress;
    if (room !== undefined) sub.room = room;
    if (zoneCode !== undefined) sub.zoneCode = zoneCode;

    await sub.save();

    const populated = await Subscription.findById(sub._id || sub.id).populate('planId');
    res.json({
      success: true,
      message: 'Subscription updated successfully!',
      subscription: populated || sub
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  PUT /api/subscriptions/:id/pause
// @access Private (Owner or Admin)
router.put('/:id/pause', protect, async (req, res) => {
  try {
    let sub = await Subscription.findById(req.params.id);
    if (!sub) sub = await Subscription.findOne({ _id: req.params.id });
    if (!sub) sub = await Subscription.findOne({ id: req.params.id });
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

    const requesterId = String(req.user._id || req.user.id || '');
    if (String(sub.userId) !== requesterId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to pause this subscription' });
    }

    const newStatus = sub.status === 'paused' ? 'active' : 'paused';
    sub.status = newStatus;
    if (newStatus === 'paused') {
      sub.pausedAt = new Date().toISOString();
    } else {
      sub.resumedAt = new Date().toISOString();
    }
    await sub.save();

    // Sync with DispatchRoster so the Kitchen and Admin Daily Dispatch immediately sees paused status!
    try {
      const DispatchRoster = getModel('dispatchRoster');
      if (DispatchRoster) {
        const studentUser = await User.findById(sub.userId) || await User.findOne({ id: sub.userId });
        const studentName = (studentUser?.name || '').toLowerCase();
        if (studentName) {
          const rosterEntries = await DispatchRoster.find();
          const matched = rosterEntries.find(d => d.student && d.student.toLowerCase().includes(studentName));
          if (matched) {
            const entryId = matched._id || matched.id;
            let extras = matched.extras || '';
            const pauseTag = '[PAUSED: PLAN ON HOLD]';
            if (newStatus === 'paused') {
              if (!extras.includes(pauseTag)) {
                extras = extras ? `${extras} • ${pauseTag}` : pauseTag;
              }
              await DispatchRoster.findByIdAndUpdate(entryId, {
                extras,
                status: 'paused',
                deliveryStatus: 'Paused by Student'
              });
            } else {
              extras = extras.replace(pauseTag, '').replace('•  •', '•').replace(/•\s*$/, '').trim();
              await DispatchRoster.findByIdAndUpdate(entryId, {
                extras,
                status: 'dispatched',
                deliveryStatus: 'Scheduled'
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn('Dispatch roster pause sync warning:', err.message);
    }

    res.json({
      success: true,
      message: `Subscription ${newStatus === 'paused' ? 'paused' : 'resumed'} successfully`,
      subscription: sub
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  PUT /api/subscriptions/:id/cancel
// @access Private (Owner or Admin)
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

    const requesterId = String(req.user._id || req.user.id || '');
    if (String(sub.userId) !== requesterId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this subscription' });
    }

    sub.status = 'cancelled';
    await sub.save();

    // Update plan subscriber count
    if (sub.planId) {
      await Plan.findByIdAndUpdate(sub.planId, { $inc: { activeSubscribers: -1 } });
    }
    if (sub.userId) {
      await User.findByIdAndUpdate(sub.userId, { activeSubscription: null });
    }

    res.json({ success: true, message: 'Subscription cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  PUT /api/subscriptions/:id/extend — extend extra meals or extra days
// @access Admin
router.put('/:id/extend', protect, adminOnly, async (req, res) => {
  try {
    const { extraMeals, extraDays } = req.body;
    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

    if (extraMeals) sub.remainingMeals = (sub.remainingMeals || 0) + Number(extraMeals);
    if (extraDays) {
      const end = new Date(sub.endDate || Date.now());
      end.setDate(end.getDate() + Number(extraDays));
      sub.endDate = end;
    }
    await sub.save();
    res.json({ success: true, subscription: sub });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  PUT /api/subscriptions/:id/renew — 1-click renewal
// @access Admin
router.put('/:id/renew', protect, adminOnly, async (req, res) => {
  try {
    const sub = await Subscription.findById(req.params.id).populate('planId');
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

    const durationDays = sub.billingCycle === 'semester' ? 180 : 30;
    const newEnd = new Date();
    newEnd.setDate(newEnd.getDate() + durationDays);

    const mealsToAdd = (sub.planId?.mealsPerDay || 2) * durationDays;
    sub.endDate = newEnd;
    sub.remainingMeals = (sub.remainingMeals || 0) + mealsToAdd;
    sub.status = 'active';
    await sub.save();

    res.json({ success: true, subscription: sub });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// @route  PUT /api/subscriptions/:id/skip-meal — skip lunch or dinner with strict 2-hour cutoff rule
// @access Private
router.put('/:id/skip-meal', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    let sub = await Subscription.findById(req.params.id).populate('planId');
    if (!sub) {
      sub = await Subscription.findOne({ _id: req.params.id }).populate('planId');
    }
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

    if (String(sub.userId) !== String(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized for this subscription' });
    }

    if ((sub.remainingMeals || 0) <= 0) {
      return res.status(400).json({ success: false, message: 'No meals remaining to skip in this subscription.' });
    }

    // 1. Meal type validation: strictly 'breakfast', 'lunch' or 'dinner'
    const rawMeal = (req.body.mealType || 'lunch').toLowerCase().trim();
    if (rawMeal !== 'breakfast' && rawMeal !== 'lunch' && rawMeal !== 'dinner') {
      return res.status(400).json({
        success: false,
        message: 'Invalid meal option! You can only skip "breakfast", "lunch", or "dinner".'
      });
    }
    const mealType = rawMeal;

    // 2. Date validation & 2-Hour cutoff calculation
    const { dateStr: todayStr, totalMinutes } = getISTDateTime();
    const targetDate = req.body.date ? req.body.date.trim() : todayStr;

    // Disallow past dates
    if (targetDate < todayStr) {
      return res.status(400).json({
        success: false,
        message: `Cannot skip meals for past dates (${targetDate}).`
      });
    }

    // Strict Cutoff Enforcement for today
    if (targetDate === todayStr) {
      const timings = await getOrCreateMealTimings();
      const breakfastCutoffMins = timings.breakfast?.skipCutoffMinutes ?? (7 * 60);
      const lunchCutoffMins = timings.lunch?.skipCutoffMinutes ?? (10 * 60 + 30);
      const dinnerCutoffMins = timings.dinner?.skipCutoffMinutes ?? (17 * 60 + 30);

      if (mealType === 'breakfast' && (timings.breakfast?.enabled === false || totalMinutes > breakfastCutoffMins)) {
        return res.status(400).json({
          success: false,
          code: 'CUTOFF_ELAPSED',
          message: timings.breakfast?.enabled === false
            ? 'Breakfast service is currently disabled.'
            : `Cutoff passed for Today's Breakfast! Skips must be made before ${timings.breakfast?.skipCutoffTimeStr || '07:00 AM'}. You can still skip Lunch before ${timings.lunch?.skipCutoffTimeStr || '10:30 AM'} or Dinner before ${timings.dinner?.skipCutoffTimeStr || '05:30 PM'}.`
        });
      }

      if (mealType === 'lunch' && (timings.lunch?.enabled === false || totalMinutes > lunchCutoffMins)) {
        return res.status(400).json({
          success: false,
          code: 'CUTOFF_ELAPSED',
          message: timings.lunch?.enabled === false
            ? 'Lunch service is currently disabled.'
            : `Cutoff passed for Today's Lunch! Skips must be made before ${timings.lunch?.skipCutoffTimeStr || '10:30 AM'}. You can still skip Dinner before ${timings.dinner?.skipCutoffTimeStr || '05:30 PM'} or choose tomorrow.`
        });
      }

      if (mealType === 'dinner' && (timings.dinner?.enabled === false || totalMinutes > dinnerCutoffMins)) {
        return res.status(400).json({
          success: false,
          code: 'CUTOFF_ELAPSED',
          message: timings.dinner?.enabled === false
            ? 'Dinner service is currently disabled.'
            : `Cutoff passed for Today's Dinner! Skips must be made before ${timings.dinner?.skipCutoffTimeStr || '05:30 PM'}. You can schedule a skip for tomorrow.`
        });
      }
    }

    // 3. Duplicate skip check: Has this meal on this date already been requested?
    if (!Array.isArray(sub.skipHistory)) {
      sub.skipHistory = [];
    }
    const alreadyRequested = sub.skipHistory.find(s =>
      s.date === targetDate &&
      s.mealType === mealType &&
      s.status !== 'rejected'
    );
    if (alreadyRequested) {
      return res.status(400).json({
        success: false,
        message: `You already have a ${alreadyRequested.status === 'pending' ? 'pending request' : 'skip'} for ${mealType === 'breakfast' ? 'Breakfast' : mealType === 'lunch' ? 'Lunch' : 'Dinner'} on ${targetDate}.`
      });
    }

    // 4. Calculate meal credit refund
    const monthlyPrice = sub.planId?.monthlyPrice || sub.amountPaid || 2499;
    const mealsPerDay = sub.planId?.mealsPerDay || 2;
    const creditPerMeal = Math.max(50, Math.round(monthlyPrice / (mealsPerDay * 30)));

    // 5. Create pending skip record in subscription history
    const skipId = `SKP-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const mealLabel = mealType === 'breakfast' ? 'Breakfast (08:00 AM)' : mealType === 'lunch' ? 'Lunch (12:30 PM)' : 'Dinner (07:30 PM)';
    const skipReason = req.body.reason ? req.body.reason.trim() : 'Skipped via student dashboard';

    const skipRecord = {
      id: skipId,
      date: targetDate,
      mealType,
      mealSlot: mealLabel,
      reason: skipReason,
      refundAmount: 0,
      mealsAdded: 1,
      status: 'pending',
      refundStatus: 'Pending Admin Approval (+1 Meal to Balance)',
      createdAt: new Date().toISOString()
    };
    sub.skipHistory.unshift(skipRecord);
    await sub.save();

    // 6. Create Pending Skip Request for Admin review in skipRequests collection
    try {
      const SkipRequest = getModel('skipRequests');
      if (SkipRequest) {
        await SkipRequest.create({
          id: skipId,
          student: req.user.name || 'Student Member',
          studentId: String(userId),
          subscriptionId: String(sub._id || sub.id),
          hostel: sub.hostelAddress || 'Campus Hostel',
          meal: mealType === 'breakfast' ? 'Breakfast' : mealType === 'lunch' ? 'Lunch' : 'Dinner',
          mealType,
          mealSlot: mealLabel,
          reason: skipReason,
          credit: 0,
          mealsAdded: 1,
          refundStatus: 'Pending Admin Approval (+1 Meal to Balance)',
          status: 'pending',
          date: targetDate
        });
      }

      // 7. If skipping today's meal, sync kitchen dispatch roster with [SKIP PENDING]
      if (targetDate === todayStr) {
        const DispatchRoster = getModel('dispatchRoster');
        if (DispatchRoster) {
          const studentName = (req.user.name || '').toLowerCase();
          const rosterEntries = await DispatchRoster.find();
          const matchedEntry = rosterEntries.find(d =>
            d.student && d.student.toLowerCase().includes(studentName)
          );
          if (matchedEntry) {
            const entryId = matchedEntry._id || matchedEntry.id;
            const existingExtras = matchedEntry.extras || '';
            const skipTag = `[SKIP PENDING: ${mealType.toUpperCase()}]`;
            if (!existingExtras.includes(skipTag)) {
              await DispatchRoster.findByIdAndUpdate(entryId, {
                extras: existingExtras ? `${existingExtras} • ${skipTag}` : skipTag
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn('Skip request sync warning:', e.message);
    }

    res.json({
      success: true,
      status: 'pending',
      message: `${mealType === 'breakfast' ? '🌅 Breakfast' : mealType === 'lunch' ? '☀️ Lunch' : '🌙 Dinner'} skip request for ${targetDate} sent to Admin! +1 meal will be added to your Meals Remaining balance upon admin approval.`,
      mealsAdded: 1,
      skipRecord,
      subscription: sub
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
