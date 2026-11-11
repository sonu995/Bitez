const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const ExtraItem = require('../models/ExtraItem');
const Dish = require('../models/Dish');
const { getModel } = require('../config/adapter');
const DispatchRoster = getModel('dispatchRoster');
const DeliveryRateSetting = getModel('deliveryRateSettings');
const { protect, adminOnly } = require('../middleware/auth');
const { getOrCreateMealTimings } = require('./mealTimingsHelper');

// @route   GET /api/orders
// @desc    Get all orders (Admin)
// @access  Admin
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    const allSubs = await Subscription.find().populate('planId', 'name monthlyPrice');

    const enrichedOrders = orders.map(ord => {
      const o = typeof ord.toObject === 'function' ? ord.toObject() : { ...ord };
      const sub = allSubs.find(s => {
        const sUid = typeof s.userId === 'object' ? String(s.userId?._id || s.userId?.id || '') : String(s.userId || '');
        if (sUid && String(o.userId) === sUid) return true;
        if (s.userId?.name && o.customerName && s.userId.name.toLowerCase() === o.customerName.toLowerCase()) return true;
        return false;
      });

      if (sub) {
        o.isSubscriber = true;
        o.subscriptionPlan = sub.planId?.name || 'Active Member';
        o.subscriptionId = sub._id || sub.id;
      }

      const isExtra = Boolean(
        o.isExtraOrder === true ||
        o.orderType === 'extra_addon' ||
        o.deliverWithMeal === true ||
        o.deliveryMode === 'with_tiffin'
      );

      if (isExtra) {
        o.isExtraOrder = true;
        o.orderType = 'extra_addon';
      }

      return o;
    });

    res.json({ success: true, count: enrichedOrders.length, orders: enrichedOrders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/orders/my
// @desc    Get logged in user orders
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id || req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/orders/attached-meal-extras
// @desc    Get current user's extra add-ons bundled with upcoming meal (Lunch/Dinner)
// @access  Private
router.get('/attached-meal-extras', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const allOrders = await Order.find({ userId }).sort({ createdAt: -1 });
    
    // Only orders explicitly requested to be packed with meal
    let mealExtras = allOrders.filter(o => 
      o.deliverWithMeal === true &&
      o.status !== 'cancelled' &&
      o.status !== 'refunded'
    );

    // Optional slot filter
    if (req.query.slot) {
      const s = String(req.query.slot).toLowerCase().trim();
      mealExtras = mealExtras.filter(o => 
        (o.attachedMealSlot && o.attachedMealSlot.toLowerCase().includes(s)) ||
        (o.mealSlot && o.mealSlot.toLowerCase().includes(s))
      );
    }

    // Optional date filter
    if (req.query.date) {
      mealExtras = mealExtras.filter(o => {
        const orderDate = o.attachedMealDate || (o.createdAt ? o.createdAt.split('T')[0] : '');
        return orderDate === req.query.date;
      });
    }

    // If current=true requested, filter to active or today's meal extras only
    if (req.query.current === 'true') {
      const today = new Date().toISOString().split('T')[0];
      mealExtras = mealExtras.filter(o => {
        const orderDate = o.attachedMealDate || (o.createdAt ? o.createdAt.split('T')[0] : '');
        const isToday = !orderDate || orderDate === today;
        const isActive = o.status !== 'delivered';
        return isActive || isToday;
      });
    }

    // Sync latest rider info from DispatchRoster if available
    try {
      const rosterEntries = await DispatchRoster.find();
      const userName = (req.user.name || '').toLowerCase();
      mealExtras = mealExtras.map(ord => {
        const o = typeof ord.toObject === 'function' ? ord.toObject() : { ...ord };
        const targetSlot = (o.attachedMealSlot || o.mealSlot || '').toLowerCase();
        const matchedRoster = rosterEntries.find(r => 
          r.student && r.student.toLowerCase() === userName &&
          (!r.slot || r.slot.toLowerCase().includes(targetSlot) || targetSlot.includes(r.slot.toLowerCase()))
        );
        if (matchedRoster && matchedRoster.rider && matchedRoster.rider !== 'Unassigned') {
          o.deliveryPartner = {
            name: matchedRoster.rider,
            phone: matchedRoster.riderPhone || '',
            vehicle: matchedRoster.riderVehicle || ''
          };
          o.riderName = matchedRoster.rider;
        }
        return o;
      });
    } catch (e) {}

    res.json({ success: true, count: mealExtras.length, extras: mealExtras });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/orders/meal-delivery-status
// @desc    Check live cutoff, eligibility and mealId for Lunch and Dinner
router.get('/meal-delivery-status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id || req.user.id);
    const userName = (user?.name || req.user.name || '').toLowerCase().trim();
    const userPhone = (user?.phone || req.user.phone || '').trim();
    const todayStr = new Date().toISOString().split('T')[0];

    const rosterEntries = await DispatchRoster.find();
    const userMeals = (rosterEntries || []).filter(d => {
      const sName = (d.student || d.studentName || '').toLowerCase().trim();
      const sPhone = (d.phone || d.customerPhone || '').trim();
      const nameMatches = sName === userName || (userName && (sName.includes(userName) || userName.includes(sName)));
      const phoneMatches = userPhone && sPhone === userPhone;
      const userMatches = nameMatches || phoneMatches || (d.userId && String(d.userId) === String(user?._id));
      const dDate = d.date || (d.createdAt ? d.createdAt.split('T')[0] : '');
      const isToday = !dDate || dDate === todayStr;
      return userMatches && isToday;
    });

    let activeSub = await Subscription.findOne({
      userId: user?._id || user?.id,
      status: { $in: ['active', 'trial'] }
    }).populate('planId');

    // Enforce subscription expiry / zero-meal exhaustion check
    if (activeSub) {
      const isDateExpired = activeSub.endDate && new Date(activeSub.endDate).getTime() < Date.now();
      const isQuotaEmpty = typeof activeSub.remainingMeals === 'number' && activeSub.remainingMeals <= 0;
      if (isDateExpired || isQuotaEmpty) {
        activeSub.status = 'expired';
        if (typeof activeSub.save === 'function') await activeSub.save();
        activeSub = null;
      }
    }

    const isSubscriber = Boolean(activeSub || user?.isSubscriber || user?.hasSubscription || (userMeals && userMeals.length > 0));

    const istTime = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
    const totalMins = istTime.getUTCHours() * 60 + istTime.getUTCMinutes();
    
    // Live Admin Configured Meal Timings
    const mealTimings = await getOrCreateMealTimings();

    function computeSlotStatus(slotName) {
      const isBreakfast = slotName.toLowerCase() === 'breakfast';
      const isLunch = slotName.toLowerCase() === 'lunch';
      const slotTiming = isBreakfast ? mealTimings.breakfast : isLunch ? mealTimings.lunch : mealTimings.dinner;
      const isSlotEnabled = slotTiming?.enabled ?? true;

      // Find matching meal for this slot in student's today meals
      const meal = userMeals.find(m => {
        const sl = (m.slot || '').toLowerCase();
        if (isBreakfast) return sl.includes('breakfast');
        if (isLunch) return sl.includes('lunch') || (!sl.includes('dinner') && !sl.includes('breakfast'));
        return sl.includes('dinner');
      });

      if (!meal) {
        if (isSubscriber) {
          // Check if subscriber's plan includes this meal slot
          const planMealsPerDay = activeSub?.planId?.mealsPerDay ?? 2;
          const planFeatures = (activeSub?.planId?.features || []).join(' ').toLowerCase();
          const planDesc = (activeSub?.planId?.description || '').toLowerCase();
          const planName = (activeSub?.planId?.name || '').toLowerCase();
          const allPlanText = `${planName} ${planDesc} ${planFeatures}`;

          const planHasBreakfast = planMealsPerDay >= 3 || allPlanText.includes('breakfast') || allPlanText.includes('3 meal') || allPlanText.includes('morning');
          const planHasLunch = planMealsPerDay >= 1;
          const planHasDinner = planMealsPerDay >= 2;
          const isSlotInPlan = isBreakfast ? planHasBreakfast : isLunch ? planHasLunch : planHasDinner;

          if (!isSlotInPlan) {
            return {
              hasValidMeal: false,
              mealId: null,
              canAddExtra: false,
              status: 'no_meal',
              isOutForDelivery: false,
              isDelivered: false,
              isLocked: false,
              rider: null,
              message: `Your active plan (${activeSub?.planId?.name || '2 Meals'}) includes Lunch & Dinner. Breakfast is not part of this plan.`
            };
          }

          if (!isSlotEnabled) {
            return {
              hasValidMeal: true,
              mealId: `SUB-${slotName.toUpperCase()}-${todayStr}`,
              canAddExtra: false,
              status: 'locked',
              isOutForDelivery: false,
              isDelivered: false,
              isLocked: true,
              rider: null,
              message: `${slotName} delivery service is paused today by admin.`
            };
          }

          return {
            hasValidMeal: true,
            mealId: `SUB-${slotName.toUpperCase()}-${todayStr}`,
            canAddExtra: true,
            status: 'preparing',
            isOutForDelivery: false,
            isDelivered: false,
            isLocked: false,
            rider: null,
            message: `${slotName} is preparing — extra food will be packed with this meal until rider is Out for Delivery.`
          };
        }

        return {
          hasValidMeal: false,
          mealId: null,
          canAddExtra: false,
          status: 'no_meal',
          isOutForDelivery: false,
          isDelivered: false,
          isLocked: false,
          rider: null,
          message: !isSlotEnabled
            ? `${slotName} delivery service is paused today.`
            : `No active ${slotName} mess meal found for today. Extra food can only be ordered with an active mess meal.`
        };
      }

      const st = (meal.status || meal.statusStep || meal.deliveryStatus || 'preparing').toLowerCase();
      const isDelivered = st === 'delivered';
      const isOutForDelivery = ['out-for-delivery', 'out_for_delivery', 'dispatched', 'on-the-way', 'picked-up', 'reached-gate'].includes(st);
      const isMealLocked = Boolean(meal.isLocked || meal.locked);

      let canAddExtra = false;
      let message = '';

      if (isDelivered) {
        canAddExtra = false;
        message = 'Meal has been delivered. Extra food ordering window is closed.';
      } else if (isOutForDelivery) {
        canAddExtra = false;
        message = 'Meal is Out for Delivery. Extra food ordering is closed.';
      } else if (!isSlotEnabled) {
        canAddExtra = false;
        message = `${slotName} delivery is paused today by admin.`;
      } else if (isMealLocked) {
        canAddExtra = false;
        message = 'Meal has been locked by the kitchen.';
      } else {
        canAddExtra = true;
        message = `${slotName} is preparing — eligible to pack extra items with this meal (closes when Out for Delivery).`;
      }

      return {
        hasValidMeal: true,
        mealId: meal.id || meal._id,
        canAddExtra,
        status: isDelivered ? 'delivered' : isOutForDelivery ? 'out_for_delivery' : isMealLocked ? 'locked' : st,
        isOutForDelivery,
        isDelivered,
        isLocked: isMealLocked || isOutForDelivery || isDelivered,
        rider: meal.rider && meal.rider !== 'Unassigned' ? meal.rider : null,
        message
      };
    }

    const meals = {
      breakfast: computeSlotStatus('Breakfast'),
      lunch: computeSlotStatus('Lunch'),
      dinner: computeSlotStatus('Dinner')
    };

    res.json({
      success: true,
      policy: 'Extra Food With Meal Only Policy',
      isSubscriber,
      timings: mealTimings,
      meals
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order details & tracking
// @access  Public (or protected)
router.get('/:id', async (req, res) => {
  try {
    const param = req.params.id;
    // Search by mongo _id OR custom orderId (e.g. ORD12345)
    let order = await Order.findOne({ orderId: param });
    if (!order) {
      order = await Order.findById(param);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/orders
// @desc    Create new order (with strict Extra Food With Meal Only Policy)
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      items,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      customerName,
      customerPhone,
      isExtraOrder,
      orderType,
      notes,
      mealSlot,
      mealId
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Cart items are required' });
    }

    const user = await User.findById(req.user._id || req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 0. Check Stock & Availability on all ordered items (Dishes & Extra Items)
    let allDishes = [];
    try {
      allDishes = await Dish.find();
    } catch (e) {}

    // 1. Detect if order is an Extra Food / Add-on order
    let allExtraCatalog = [];
    try {
      allExtraCatalog = await ExtraItem.find();
    } catch (e) {}

    for (const orderedItem of items) {
      const cleanId = String(orderedItem.id || orderedItem._id || '').replace(/^extra-/, '');
      const cleanName = (orderedItem.name || '').toLowerCase().replace(/ \(extra side\)$/i, '').trim();
      const matchedDish = (allDishes || []).find(d => String(d._id || d.id) === cleanId || (d.name || '').toLowerCase().trim() === cleanName);
      const matchedExtra = (allExtraCatalog || []).find(ex => String(ex._id || ex.id) === cleanId || (ex.name || '').toLowerCase().trim() === cleanName);

      if (matchedDish) {
        if (matchedDish.isAvailable === false || (typeof matchedDish.stockQty === 'number' && matchedDish.stockQty <= 0)) {
          return res.status(400).json({
            success: false,
            code: 'ITEM_OUT_OF_STOCK',
            message: `Sorry, "${matchedDish.name}" is currently out of stock.`
          });
        }
        if (typeof matchedDish.stockQty === 'number' && matchedDish.stockQty < (Number(orderedItem.quantity) || 1)) {
          return res.status(400).json({
            success: false,
            code: 'INSUFFICIENT_STOCK',
            message: `Only ${matchedDish.stockQty} portion(s) of "${matchedDish.name}" left in stock.`
          });
        }
      }
      if (matchedExtra) {
        if (matchedExtra.isActive === false || matchedExtra.isAvailable === false || (typeof matchedExtra.stockQty === 'number' && matchedExtra.stockQty <= 0)) {
          return res.status(400).json({
            success: false,
            code: 'ITEM_OUT_OF_STOCK',
            message: `Sorry, "${matchedExtra.name}" is currently out of stock today.`
          });
        }
      }
    }
    const extraItemNames = new Set((allExtraCatalog || []).map(e => (e.name || '').toLowerCase().trim()));
    const extraItemIds = new Set((allExtraCatalog || []).map(e => String(e._id || e.id)));

    const hasExtraItems = Array.isArray(items) && items.some(it => {
      if (it.isExtra === true || it.category === 'extras') return true;
      const itId = String(it.id || it._id || '').replace(/^extra-/, '');
      if (extraItemIds.has(itId)) return true;
      const itName = (it.name || '').toLowerCase().replace(/ \(extra side\)$/i, '').trim();
      if (extraItemNames.has(itName)) return true;
      return itName.startsWith('extra ') || itName.includes('extra-') || itName.includes('add-on');
    });

    const isExtraFoodOrder = Boolean(
      isExtraOrder === true ||
      orderType === 'extra_addon' ||
      req.body.deliverWithMeal === true ||
      req.body.deliveryMode === 'with_tiffin' ||
      hasExtraItems
    );

    // ─────────────────────────────────────────────────────────────
    // 🛡️ EXTRA FOOD WITH MEAL ONLY POLICY ENFORCEMENT
    // ─────────────────────────────────────────────────────────────
    let targetMeal = null;

    if (isExtraFoodOrder) {
      // 1. Extra Food Order requires mealId
      const passedMealId = (mealId || req.body.mealId || '').trim();
      if (!passedMealId) {
        return res.status(400).json({
          success: false,
          code: 'MEAL_ID_REQUIRED',
          policy: 'Extra Food With Meal Only Policy',
          message: 'mealId is required for extra food orders. Extra items can only be purchased together with an active mess meal.'
        });
      }

      // 3. Standalone Extra Food order is strictly disallowed
      if (req.body.deliverWithMeal === false || req.body.deliveryMode === 'direct_runner' || req.body.deliverySlot === 'Instant' || mealSlot === 'Instant') {
        return res.status(400).json({
          success: false,
          code: 'STANDALONE_NOT_ALLOWED',
          policy: 'Extra Food With Meal Only Policy',
          message: 'Standalone extra food orders are not allowed. Extra food must be delivered packed inside your scheduled mess meal.'
        });
      }

      // 2. User must possess a valid Mess Meal today
      const todayStr = new Date().toISOString().split('T')[0];
      const userName = (customerName || user.name || '').toLowerCase().trim();
      const userPhone = (customerPhone || user.phone || '').trim();

      const rosterEntries = await DispatchRoster.find();
      const userMealsToday = (rosterEntries || []).filter(d => {
        const sName = (d.student || d.studentName || '').toLowerCase().trim();
        const sPhone = (d.phone || d.customerPhone || '').trim();
        const nameMatches = sName === userName || (userName && (sName.includes(userName) || userName.includes(sName)));
        const phoneMatches = userPhone && sPhone === userPhone;
        const userMatches = nameMatches || phoneMatches || (d.userId && String(d.userId) === String(user._id));
        const dDate = d.date || (d.createdAt ? d.createdAt.split('T')[0] : '');
        const isToday = !dDate || dDate === todayStr;
        return userMatches && isToday;
      });

      targetMeal = userMealsToday.find(d =>
        String(d.id || d._id) === String(passedMealId) ||
        String(d.orderId) === String(passedMealId) ||
        String(d.boxId) === String(passedMealId)
      );

      if (!targetMeal) {
        let activeSub = await Subscription.findOne({
          userId: user._id || user.id,
          status: { $in: ['active', 'trial'] }
        }).populate('planId');

        // Block if subscription is expired or exhausted
        if (activeSub) {
          const isDateExpired = activeSub.endDate && new Date(activeSub.endDate).getTime() < Date.now();
          const isQuotaEmpty = typeof activeSub.remainingMeals === 'number' && activeSub.remainingMeals <= 0;
          if (isDateExpired || isQuotaEmpty) {
            activeSub.status = 'expired';
            if (typeof activeSub.save === 'function') await activeSub.save();
            return res.status(403).json({
              success: false,
              code: 'SUBSCRIPTION_EXPIRED',
              policy: 'Extra Food With Meal Only Policy',
              message: 'Your mess subscription has expired or has 0 meals remaining. Please renew your plan to order extra food with meal.'
            });
          }
        }

        const isSubscriber = Boolean(activeSub || user.isSubscriber || user.hasSubscription);

        if (isSubscriber) {
          const mealTimings = await getOrCreateMealTimings();
          const rawReqSlot = (req.body.attachedMealSlot || mealSlot || 'Lunch').toLowerCase();
          const isBreakfast = rawReqSlot.includes('breakfast');
          const isLunch = rawReqSlot.includes('lunch') || (!rawReqSlot.includes('dinner') && !rawReqSlot.includes('breakfast'));
          const slotTiming = isBreakfast ? mealTimings.breakfast : isLunch ? mealTimings.lunch : mealTimings.dinner;
          const isSlotEnabled = slotTiming?.enabled ?? true;

          if (!isSlotEnabled) {
            return res.status(400).json({
              success: false,
              code: 'MEAL_ORDER_LOCKED',
              policy: 'Extra Food With Meal Only Policy',
              message: `${isBreakfast ? 'Breakfast' : isLunch ? 'Lunch' : 'Dinner'} delivery is currently paused today by admin.`
            });
          }

          // Check if subscriber's plan includes this meal slot
          const planMealsPerDay = activeSub?.planId?.mealsPerDay ?? 2;
          const planFeatures = (activeSub?.planId?.features || []).join(' ').toLowerCase();
          const planDesc = (activeSub?.planId?.description || '').toLowerCase();
          const planName = (activeSub?.planId?.name || '').toLowerCase();
          const allPlanText = `${planName} ${planDesc} ${planFeatures}`;

          const planHasBreakfast = planMealsPerDay >= 3 || allPlanText.includes('breakfast') || allPlanText.includes('3 meal') || allPlanText.includes('morning');
          const planHasLunch = planMealsPerDay >= 1;
          const planHasDinner = planMealsPerDay >= 2;
          const isSlotInPlan = isBreakfast ? planHasBreakfast : isLunch ? planHasLunch : planHasDinner;

          if (!isSlotInPlan) {
            return res.status(400).json({
              success: false,
              code: 'PLAN_SLOT_INELIGIBLE',
              policy: 'Extra Food With Meal Only Policy',
              message: `Your active subscription (${activeSub?.planId?.name || 'Current Plan'}) does not include ${isBreakfast ? 'Breakfast' : isLunch ? 'Lunch' : 'Dinner'}. Extra food can only be packed with meals included in your plan.`
            });
          }

          // Auto-create active roster entry for subscriber for today (closing strictly happens when Out for Delivery)
          const slotDisplay = isBreakfast ? 'Breakfast' : isLunch ? 'Lunch' : 'Dinner';
          const newMealId = `MEAL-${slotDisplay.toUpperCase()}-${Date.now().toString().slice(-6)}`;
          targetMeal = await DispatchRoster.create({
            id: newMealId,
            orderId: newMealId,
            boxId: `BOX-${Date.now().toString().slice(-4)}`,
            student: user.name || customerName || 'Subscriber',
            phone: user.phone || customerPhone || '',
            slot: slotDisplay,
            zone: user.hostel || user.address || 'Campus',
            address: user.roomNo ? `${user.hostel || 'Hostel'} - Room ${user.roomNo}` : (user.address || 'Campus'),
            status: 'preparing',
            rider: 'Unassigned',
            userId: user._id,
            date: todayStr
          });
        } else {
          return res.status(403).json({
            success: false,
            code: 'NO_VALID_MESS_MEAL',
            policy: 'Extra Food With Meal Only Policy',
            message: 'No active mess meal found for today. Extra food can only be purchased together with an active mess meal.'
          });
        }
      }

      // 4. Meal Status OUT_FOR_DELIVERY or DELIVERED rejects request
      const rawMealStatus = (targetMeal.status || targetMeal.statusStep || targetMeal.deliveryStatus || '').toLowerCase();
      const isDelivered = rawMealStatus === 'delivered';
      const isOutForDelivery = ['out-for-delivery', 'out_for_delivery', 'dispatched', 'on-the-way', 'picked-up', 'reached-gate'].includes(rawMealStatus);

      // 7. Extra Food cannot be added after Meal is Delivered
      if (isDelivered) {
        return res.status(400).json({
          success: false,
          code: 'MEAL_ALREADY_DELIVERED',
          policy: 'Extra Food With Meal Only Policy',
          message: 'This meal has already been delivered. Extra food cannot be added after delivery. Please wait for your next eligible meal.'
        });
      }

      // 4. Out for delivery rejection
      if (isOutForDelivery) {
        return res.status(400).json({
          success: false,
          code: 'MEAL_OUT_FOR_DELIVERY',
          policy: 'Extra Food With Meal Only Policy',
          message: 'This meal is out for delivery. Extra food cannot be added once the meal is dispatched.'
        });
      }

      // 5. Meal Locked rejection
      const isMealLocked = Boolean(targetMeal.isLocked === true || targetMeal.locked === true);
      const mealTimings = await getOrCreateMealTimings();
      const targetSlot = (req.body.attachedMealSlot || targetMeal.slot || mealSlot || 'Lunch').toLowerCase();
      const isBreakfast = targetSlot.includes('breakfast');
      const isLunch = targetSlot.includes('lunch') || (!targetSlot.includes('dinner') && !targetSlot.includes('breakfast'));
      const slotTiming = isBreakfast ? mealTimings.breakfast : isLunch ? mealTimings.lunch : mealTimings.dinner;
      const isSlotEnabled = slotTiming?.enabled ?? true;

      if (!isSlotEnabled) {
        return res.status(400).json({
          success: false,
          code: 'MEAL_ORDER_LOCKED',
          policy: 'Extra Food With Meal Only Policy',
          message: `${isBreakfast ? 'Breakfast' : isLunch ? 'Lunch' : 'Dinner'} delivery is currently paused today by admin.`
        });
      }

      if (isMealLocked) {
        return res.status(400).json({
          success: false,
          code: 'MEAL_ORDER_LOCKED',
          policy: 'Extra Food With Meal Only Policy',
          message: 'This meal is locked by the kitchen and cannot accept extra items.'
        });
      }
    }

    // Check if user is an active mess subscriber
    let isSub = false;
    let subPlan = '';
    let subId = null;
    try {
      const activeSub = await Subscription.findOne({
        userId: user._id || user.id,
        status: { $in: ['active', 'trial'] }
      }).populate('planId');
      if (activeSub) {
        isSub = true;
        subPlan = activeSub.planId?.name || 'Active Subscriber';
        subId = activeSub._id || activeSub.id;
      }
    } catch (e) {}

    const orderId = 'ORD' + Math.floor(100000 + Math.random() * 900000);

    // Determine payment method and status
    const rawMethod = (paymentMethod || 'Cash on Delivery').toLowerCase();
    let normalizedMethod = 'Cash on Delivery';
    let paymentStatus = 'pending';

    const isWallet = rawMethod.includes('wallet');
    const isUPI = rawMethod.includes('upi') || rawMethod.includes('online') || rawMethod.includes('card');

    if (isWallet) {
      normalizedMethod = 'Campus Wallet';
      if ((user.walletBalance || 0) < totalAmount) {
        return res.status(400).json({
          success: false,
          message: `Insufficient wallet balance (₹${user.walletBalance || 0}). Required ₹${totalAmount}. Please top up your wallet or choose Cash on Delivery.`
        });
      }

      // Deduct from wallet & record immutable transaction ledger entry with real orderId
      const deductAmt = Math.round(totalAmount);
      user.walletBalance = (Number(user.walletBalance) || 0) - deductAmt;
      if (!Array.isArray(user.walletTransactions)) user.walletTransactions = [];
      const ordTxnId = `TXN-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      user.walletTransactions.unshift({
        id: ordTxnId,
        referenceId: orderId,
        type: 'debit',
        amount: deductAmt,
        description: `Food Order #${orderId}`,
        method: 'Campus Wallet',
        status: 'Completed',
        date: new Date().toISOString(),
        balanceAfter: user.walletBalance
      });
      await user.save();
      paymentStatus = 'paid';
    } else if (isUPI) {
      normalizedMethod = 'Online UPI';
      paymentStatus = 'paid';
    } else {
      normalizedMethod = 'Cash on Delivery';
      paymentStatus = 'pending';
    }

    const isDeliverWithMeal = Boolean(isExtraFoodOrder || req.body.deliverWithMeal);
    const finalOrderType = isExtraFoodOrder ? 'extra_addon' : (orderType || 'instant');
    const targetMealSlot = isExtraFoodOrder 
      ? (req.body.attachedMealSlot || (targetMeal?.slot?.toLowerCase().includes('breakfast') ? 'Breakfast' : targetMeal?.slot?.toLowerCase().includes('dinner') ? 'Dinner' : 'Lunch')) 
      : (req.body.attachedMealSlot || (mealSlot && mealSlot !== 'Instant' ? mealSlot : 'Lunch'));
    const targetMealDate = targetMeal?.date || req.body.attachedMealDate || new Date().toISOString().split('T')[0];

    const finalCustomerName = customerName || user.name || 'Student Customer';
    const finalCustomerPhone = customerPhone || user.phone || '';
    const finalDeliveryAddress = deliveryAddress || user.deliveryAddress || '';

    // Extra Food with meal has 0 delivery fee
    let calculatedDeliveryFee = isDeliverWithMeal ? 0 : 35;
    if (!isDeliverWithMeal) {
      try {
        const rateSettings = await DeliveryRateSetting.findOne({ id: 'global_delivery_rates' });
        if (rateSettings) {
          if (
            (rateSettings.instantFreeDeliveryThreshold && totalAmount >= rateSettings.instantFreeDeliveryThreshold) ||
            (rateSettings.freeDeliveryThreshold && totalAmount >= rateSettings.freeDeliveryThreshold)
          ) {
            calculatedDeliveryFee = 0;
          } else {
            let fee = Number(rateSettings.instantBaseDeliveryFee || rateSettings.instantCustomerDeliveryFee || rateSettings.customerDeliveryFee || 35);
            if (rateSettings.instantRainFeeEnabled) fee += Number(rateSettings.instantRainFee || 0);
            if (rateSettings.instantPeakHourEnabled) fee += Number(rateSettings.instantPeakHourFee || 0);
            if (rateSettings.instantNightDeliveryEnabled) fee += Number(rateSettings.instantNightDeliveryFee || 0);
            if (rateSettings.instantSurgeEnabled) {
              if (rateSettings.instantSurgeMode === 'multiplier' && rateSettings.instantSurgeMultiplier > 1) {
                fee = Math.round(fee * Number(rateSettings.instantSurgeMultiplier));
              } else {
                fee += Number(rateSettings.instantSurgeFee || 0);
              }
            }
            calculatedDeliveryFee = Math.max(0, fee);
          }
        }
      } catch (e) {}
    }

    // Create the Order
    const newOrder = await Order.create({
      orderId,
      userId: user._id || user.id,
      customerName: finalCustomerName,
      customerPhone: finalCustomerPhone,
      items,
      totalAmount: Math.round(totalAmount),
      deliveryAddress: finalDeliveryAddress,
      paymentMethod: normalizedMethod,
      paymentStatus,
      status: 'confirmed',
      isExtraOrder: isExtraFoodOrder,
      orderType: finalOrderType,
      isSubscriber: isSub,
      subscriptionPlan: subPlan,
      subscriptionId: subId,
      mealId: targetMeal ? (targetMeal.id || targetMeal._id) : '',
      notes: notes || (isDeliverWithMeal ? `🍱 Extra Food packed with ${targetMealSlot} Meal (Meal #${targetMeal ? targetMeal.id : ''})` : ''),
      mealSlot: isDeliverWithMeal ? targetMealSlot : (mealSlot || 'Instant'),
      deliverWithMeal: isDeliverWithMeal,
      attachedMealSlot: isDeliverWithMeal ? targetMealSlot : '',
      attachedMealDate: isDeliverWithMeal ? targetMealDate : '',
      packingStatus: 'unpacked',
      estimatedMinutes: isDeliverWithMeal ? 0 : 30,
      otp: Math.floor(1000 + Math.random() * 9000).toString(),
      deliveryFee: calculatedDeliveryFee,
      deliveryPartner: {
        name: isDeliverWithMeal ? 'Unassigned (Admin will assign with meal)' : 'Unassigned',
        phone: '',
        vehicle: isDeliverWithMeal ? 'Pending Rider Assignment' : ''
      }
    });

    // 6. Extra Food का payment और quantity उसी Meal Order से linked रहेंगे।
    if (isExtraFoodOrder && targetMeal) {
      try {
        const itemSummary = items.map(it => `${it.quantity || 1}x ${it.name}`).join(', ');
        const tag = `[🌟 PACKED WITH ${targetMealSlot.toUpperCase()}: ${itemSummary}]`;
        const currentExtras = targetMeal.extras || '';
        const updatedExtras = currentExtras.includes(tag) ? currentExtras : (currentExtras ? `${currentExtras} + ${tag}` : `Extra Add-on: ${itemSummary}`);

        targetMeal.extras = updatedExtras;
        targetMeal.hasAttachedExtras = true;
        if (!Array.isArray(targetMeal.attachedExtras)) targetMeal.attachedExtras = [];
        targetMeal.attachedExtras.push({
          orderId,
          mealId: targetMeal.id || targetMeal._id,
          items,
          totalAmount: Math.round(totalAmount),
          paymentMethod: normalizedMethod,
          paymentStatus,
          mealSlot: targetMealSlot,
          status: 'confirmed',
          packed: false,
          orderedAt: new Date().toISOString()
        });

        if (typeof targetMeal.save === 'function') {
          await targetMeal.save();
        } else {
          await DispatchRoster.findByIdAndUpdate(targetMeal._id || targetMeal.id, {
            extras: updatedExtras,
            hasAttachedExtras: true,
            attachedExtras: targetMeal.attachedExtras
          });
        }
      } catch (errRoster) {
        console.warn('Could not link extra order to dispatch roster meal:', errRoster.message);
      }
    }

    const updatedUser = await User.findById(user._id || user.id);

    res.status(201).json({
      success: true,
      order: newOrder,
      walletBalance: updatedUser ? updatedUser.walletBalance : undefined
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Admin
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const valid = ['confirmed', 'preparing', 'on-the-way', 'delivered', 'cancelled'];
    if (status && !valid.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    let order = await Order.findOne({ orderId: req.params.id });
    if (!order) order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    // Auto-mark cash collected when COD order is marked as delivered
    if (status === 'delivered' && order.paymentMethod === 'Cash on Delivery') {
      order.paymentStatus = 'paid';
    }

    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/orders/:id/cancel
// @desc    Cancel order and refund to wallet if prepaid
// @access  Private
router.post('/:id/cancel', protect, async (req, res) => {
  try {
    let order = await Order.findOne({ orderId: req.params.id });
    if (!order) order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const requesterId = String(req.user._id || req.user.id || '');
    if (String(order.userId || '') !== requesterId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({ success: false, message: 'Cannot cancel an already delivered order' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Order is already cancelled' });
    }

    order.status = 'cancelled';
    await order.save();

    // Refund if paid via wallet
    if (order.paymentStatus === 'paid' && (order.paymentMethod === 'Campus Wallet' || order.paymentMethod === 'Wallet')) {
      const refundAmt = Math.round(order.totalAmount);
      const ordUser = await User.findById(order.userId);
      if (ordUser) {
        ordUser.walletBalance = (Number(ordUser.walletBalance) || 0) + refundAmt;
        if (!Array.isArray(ordUser.walletTransactions)) ordUser.walletTransactions = [];
        const refTxnId = `TXN-REF-${Math.floor(100000 + Math.random() * 900000)}`;
        ordUser.walletTransactions.unshift({
          id: refTxnId,
          referenceId: `${order.orderId || order._id}-REFUND`,
          type: 'credit',
          amount: refundAmt,
          description: `Refund for Cancelled Order #${(order.orderId || String(order._id)).slice(-6).toUpperCase()}`,
          method: 'Campus Wallet Refund',
          status: 'Completed',
          date: new Date().toISOString(),
          balanceAfter: ordUser.walletBalance
        });
        await ordUser.save();
      }
      order.paymentStatus = 'refunded';
      await order.save();
    }

    res.json({ success: true, message: 'Order cancelled successfully', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/orders/:id/rider
// @desc    Assign or change delivery partner for order
// @access  Admin
router.put('/:id/rider', protect, adminOnly, async (req, res) => {
  try {
    const { riderName, riderPhone, riderVehicle, riderId } = req.body;
    let order = await Order.findOne({ orderId: req.params.id });
    if (!order) order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.deliveryPartner = {
      name: riderName || 'Unassigned',
      phone: riderPhone || '',
      vehicle: riderVehicle || 'Electric Scooter'
    };
    if (riderId) order.riderId = riderId;

    await order.save();
    res.json({ success: true, message: `Rider ${riderName} assigned to order`, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
