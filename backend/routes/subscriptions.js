const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// @route  GET /api/subscriptions  — all subscriptions for admin
// @access Admin
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const subs = await Subscription.find()
      .populate('userId', 'name email phone')
      .populate('planId', 'name monthlyPrice')
      .sort({ createdAt: -1 });

    // Stats
    const total = subs.length;
    const active = subs.filter(s => s.status === 'active').length;
    const expired = subs.filter(s => s.status === 'expired').length;
    const revenue = subs.reduce((sum, s) => sum + s.amountPaid, 0);

    res.json({ success: true, subscriptions: subs, stats: { total, active, expired, revenue } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  GET /api/subscriptions/me  — current user's active subscription
// @access Private
router.get('/me', protect, async (req, res) => {
  try {
    const sub = await Subscription.findOne({ userId: req.user._id, status: 'active' })
      .populate('planId');
    res.json({ success: true, subscription: sub || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  POST /api/subscriptions  — subscribe to a plan
// @access Private
router.post('/', protect, async (req, res) => {
  try {
    const { planId, billingCycle } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    // Check existing active subscription
    const existing = await Subscription.findOne({ userId: req.user._id, status: 'active' });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already have an active subscription' });
    }

    // Calculate amount and duration
    let amountPaid = plan.monthlyPrice;
    let durationDays = 30;

    if (billingCycle === 'semester') {
      amountPaid = Math.round(plan.monthlyPrice * 0.85 * 6); // 6 months × 15% off
      durationDays = 180;
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    // Meals per month = mealsPerDay × 30 days
    const remainingMeals = plan.mealsPerDay * (billingCycle === 'semester' ? 180 : 30);

    const sub = await Subscription.create({
      userId: req.user._id,
      planId,
      billingCycle,
      endDate,
      amountPaid,
      remainingMeals
    });

    // Update user's active subscription & increment plan count
    await User.findByIdAndUpdate(req.user._id, { activeSubscription: sub._id });
    await Plan.findByIdAndUpdate(planId, { $inc: { activeSubscribers: 1 } });

    const populated = await sub.populate('planId');
    res.status(201).json({ success: true, subscription: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  PUT /api/subscriptions/:id/pause
// @access Private
router.put('/:id/pause', protect, async (req, res) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, userId: req.user._id });
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

    sub.status = sub.status === 'paused' ? 'active' : 'paused';
    await sub.save();
    res.json({ success: true, subscription: sub });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  PUT /api/subscriptions/:id/cancel
// @access Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, userId: req.user._id });
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

    sub.status = 'cancelled';
    await sub.save();

    // Update plan subscriber count
    await Plan.findByIdAndUpdate(sub.planId, { $inc: { activeSubscribers: -1 } });
    await User.findByIdAndUpdate(req.user._id, { activeSubscription: null });

    res.json({ success: true, message: 'Subscription cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  PUT /api/subscriptions/:id/skip-meal  — skip a meal, credit wallet
// @access Private
router.put('/:id/skip-meal', protect, async (req, res) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, userId: req.user._id }).populate('planId');
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

    if (sub.remainingMeals <= 0) {
      return res.status(400).json({ success: false, message: 'No meals remaining to skip' });
    }

    // Credit per meal = monthly price / (mealsPerDay * 30)
    const creditPerMeal = Math.round(sub.planId.monthlyPrice / (sub.planId.mealsPerDay * 30));

    sub.remainingMeals -= 1;
    sub.skippedMeals += 1;
    sub.walletCredits += creditPerMeal;
    await sub.save();

    // Add to user wallet
    await User.findByIdAndUpdate(req.user._id, { $inc: { walletBalance: creditPerMeal } });

    res.json({ success: true, creditAdded: creditPerMeal, subscription: sub });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
