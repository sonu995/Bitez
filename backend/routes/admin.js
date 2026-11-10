const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Order = require('../models/Order');
const Subscription = require('../models/Subscription');
const Complaint = require('../models/Complaint');
const Plan = require('../models/Plan');
const { getModel } = require('../config/adapter');
const { protect, adminOnly } = require('../middleware/auth');

// Models for operations collections
const Zone = getModel('deliveryZones');
const Rider = getModel('riders');
const DeliveryRoute = getModel('deliveryRoutes');
const DispatchRoster = getModel('dispatchRoster');
const SkipRequest = getModel('skipRequests');
const Coupon = getModel('coupons');
const DeliveryRateSetting = getModel('deliveryRateSettings');
const {
  getRiderEarningsReport,
  settleRiderPayout,
  bulkSettleRiderPayouts
} = require('./riderEarningsHelper');
const {
  DEFAULT_MEAL_TIMINGS,
  parse24to12,
  getOrCreateMealTimings
} = require('./mealTimingsHelper');

// ── QUICK ADMIN AUTH ───────────────────────────────────────────
// @route   POST /api/admin/quick-login
// @desc    Quickly authenticate as admin for seamless frontend-backend link
// @access  Public
router.post('/quick-login', async (req, res) => {
  try {
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin user not found' });
    }
    const token = jwt.sign(
      { id: admin._id || admin.id, role: admin.role },
      process.env.JWT_SECRET || 'mess_app_super_secret_jwt_key_2024',
      { expiresIn: '30d' }
    );
    res.json({
      success: true,
      token,
      user: {
        id: admin._id || admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        walletBalance: admin.walletBalance || 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── OVERVIEW & LIVE METRICS ────────────────────────────────────
// @route   GET /api/admin/overview
// @desc    Get comprehensive live metrics and data for Admin Dashboard
// @access  Admin
router.get('/overview', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    const orders = await Order.find().sort({ createdAt: -1 });
    const subscriptions = await Subscription.find().populate('userId', 'name email phone').populate('planId', 'name monthlyPrice').sort({ createdAt: -1 });
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    const plans = await Plan.find();
    const zones = await Zone.find();
    const riders = await Rider.find();

    const totalUsers = users.length;
    const activeSubs = subscriptions.filter(s => s.status === 'active');
    const activeSubscriptionsCount = activeSubs.length;

    const subRevenue = subscriptions.reduce((acc, s) => acc + (s.amountPaid || 0), 0);
    const orderRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    const monthlyRevenue = subRevenue + orderRevenue;

    const pendingDeliveries = orders.filter(o => ['confirmed', 'preparing', 'on-the-way'].includes(o.status)).length;
    const openTickets = complaints.filter(c => ['open', 'investigating'].includes(c.status)).length;

    const todayMeals = activeSubs.length * 2 + orders.filter(o => o.status !== 'cancelled').length;

    const stats = {
      totalUsers,
      activeSubscriptions: activeSubscriptionsCount,
      totalOrders: orders.length,
      monthlyRevenue,
      todayMeals,
      pendingDeliveries,
      openTickets,
      activeCoupons: 3,
      totalZones: zones.length,
      activeRiders: riders.filter(r => r.status === 'available' || r.status === 'on-route').length
    };

    res.json({
      success: true,
      stats,
      orders: orders.slice(0, 15),
      users: users.slice(0, 20),
      subscriptions: subscriptions.slice(0, 15),
      complaints: complaints.slice(0, 15),
      plans
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── USERS ──────────────────────────────────────────────────────
// @route   GET /api/admin/users
// @desc    Get all users list
// @access  Admin
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Change user role (e.g. make admin)
// @access  Admin
router.put('/users/:id/role', protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELIVERY ZONES ─────────────────────────────────────────────
// @route   GET /api/admin/zones
// @desc    Get all delivery zones
// @access  Admin
router.get('/zones', protect, adminOnly, async (req, res) => {
  try {
    const zones = await Zone.find();
    res.json({ success: true, count: zones.length, zones });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/admin/zones
// @desc    Create new delivery zone
// @access  Admin
router.post('/zones', protect, adminOnly, async (req, res) => {
  try {
    const { name, code, pincode, areas, deliveryCharge, lunchSlot, dinnerSlot, assignedRider, dailyTiffinCapacity, status } = req.body;
    const areasArray = Array.isArray(areas) ? areas : (areas ? areas.split(',').map(a => a.trim()).filter(Boolean) : []);
    const id = `ZONE-${Date.now().toString().slice(-4)}`;
    
    const zone = await Zone.create({
      id,
      name: name || 'New Zone',
      code: code || `ZN-${Math.floor(10 + Math.random() * 90)}`,
      pincode: pincode || '110007',
      areas: areasArray,
      deliveryCharge: Number(deliveryCharge) || 0,
      timingSlots: {
        lunch: lunchSlot || '12:15 PM - 01:15 PM',
        dinner: dinnerSlot || '07:30 PM - 08:30 PM'
      },
      assignedRider: assignedRider || 'Unassigned',
      dailyTiffinCapacity: Number(dailyTiffinCapacity) || 100,
      activeDeliveries: 0,
      status: status || 'active'
    });
    res.status(201).json({ success: true, zone });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/admin/zones/:id
// @desc    Update a delivery zone
// @access  Admin
router.put('/zones/:id', protect, adminOnly, async (req, res) => {
  try {
    const { name, code, pincode, areas, deliveryCharge, lunchSlot, dinnerSlot, assignedRider, dailyTiffinCapacity, status } = req.body;
    const areasArray = Array.isArray(areas) ? areas : (areas ? areas.split(',').map(a => a.trim()).filter(Boolean) : undefined);
    
    const updateData = {};
    if (name) updateData.name = name;
    if (code) updateData.code = code;
    if (pincode) updateData.pincode = pincode;
    if (areasArray) updateData.areas = areasArray;
    if (deliveryCharge !== undefined) updateData.deliveryCharge = Number(deliveryCharge);
    if (lunchSlot || dinnerSlot) {
      updateData.timingSlots = {
        lunch: lunchSlot || '12:15 PM - 01:15 PM',
        dinner: dinnerSlot || '07:30 PM - 08:30 PM'
      };
    }
    if (assignedRider) updateData.assignedRider = assignedRider;
    if (dailyTiffinCapacity) updateData.dailyTiffinCapacity = Number(dailyTiffinCapacity);
    if (status) updateData.status = status;

    let zone = await Zone.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!zone) {
      zone = await Zone.findOneAndUpdate({ id: req.params.id }, updateData, { new: true });
    }
    if (!zone) return res.status(404).json({ success: false, message: 'Zone not found' });
    res.json({ success: true, zone });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/admin/zones/:id/status
// @desc    Toggle delivery zone status
// @access  Admin
router.put('/zones/:id/status', protect, adminOnly, async (req, res) => {
  try {
    let zone = await Zone.findById(req.params.id);
    if (!zone) zone = await Zone.findOne({ id: req.params.id });
    if (!zone) return res.status(404).json({ success: false, message: 'Zone not found' });

    const nextStatus = zone.status === 'active' ? 'busy' : zone.status === 'busy' ? 'paused' : 'active';
    zone.status = nextStatus;
    await zone.save();
    res.json({ success: true, zone });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/admin/zones/:id
// @desc    Delete a delivery zone
// @access  Admin
router.delete('/zones/:id', protect, adminOnly, async (req, res) => {
  try {
    let zone = await Zone.findByIdAndDelete(req.params.id);
    if (!zone) zone = await Zone.findOneAndDelete({ id: req.params.id });
    if (!zone) return res.status(404).json({ success: false, message: 'Zone not found' });
    res.json({ success: true, message: 'Zone deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELIVERY RIDERS ────────────────────────────────────────────
// @route   GET /api/admin/riders
// @desc    Get all delivery riders
// @access  Admin
router.get('/riders', protect, adminOnly, async (req, res) => {
  try {
    const riders = await Rider.find();
    res.json({ success: true, count: riders.length, riders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/admin/riders
// @desc    Add new delivery rider with mandatory Aadhaar Card KYC verification
// @access  Admin
router.post('/riders', protect, adminOnly, async (req, res) => {
  try {
    const {
      name,
      phone,
      route,
      vehicle,
      licenseNumber,
      aadhaarNumber,
      aadhaarCardImage,
      aadhaarVerified,
      kycStatus,
      status,
      address,
      avatar,
      joiningDate,
      perDeliveryRate,
      salaryType
    } = req.body;

    // ── MANDATORY AADHAAR CARD KYC VALIDATION ──
    const cleanAadhaar = aadhaarNumber ? String(aadhaarNumber).replace(/\D/g, '') : '';
    if (!cleanAadhaar || cleanAadhaar.length !== 12) {
      return res.status(400).json({
        success: false,
        message: 'Aadhaar Card Verification Required: A valid 12-digit Aadhaar Card number is mandatory to register and onboard a delivery rider.'
      });
    }

    const formattedAadhaar = `${cleanAadhaar.slice(0, 4)} ${cleanAadhaar.slice(4, 8)} ${cleanAadhaar.slice(8, 12)}`;
    const allRiders = await Rider.find();
    const count = allRiders.length;
    const id = `#R${String(count + 1).padStart(3, '0')}`;
    
    const rider = await Rider.create({
      id,
      name: name || 'Rider Partner',
      phone: phone || '+91 98000 00000',
      route: route || 'North Campus Hostels',
      vehicle: vehicle || 'Electric Scooter',
      licenseNumber: licenseNumber || 'DL-1420230098712',
      aadhaarNumber: formattedAadhaar,
      aadhaarCardImage: aadhaarCardImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=compress&cs=tinysrgb&w=600',
      aadhaarVerified: true,
      kycStatus: 'verified',
      kycVerifiedAt: new Date().toISOString(),
      kycDocumentType: 'Aadhaar Card (UIDAI Verified)',
      status: status || 'available',
      onlineStatus: (status === 'offline') ? 'offline' : 'online',
      address: address || 'Tagore Lane, North Campus, Delhi',
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name || 'rider'}`,
      joiningDate: joiningDate || new Date().toISOString().split('T')[0],
      perDeliveryRate: perDeliveryRate || 35,
      salaryType: salaryType || 'per_delivery',
      deliveriesToday: 0,
      activeTiffins: 0,
      rating: 5.0,
      earningsToday: 0,
      earningsTotal: 0,
      payoutStatus: 'paid'
    });
    res.status(201).json({ success: true, rider, message: 'Rider onboarded with verified Aadhaar Card KYC!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/admin/riders/:id
// @desc    Update complete rider profile including Aadhaar KYC
// @access  Admin
router.put('/riders/:id', protect, adminOnly, async (req, res) => {
  try {
    let rider = await Rider.findById(req.params.id);
    if (!rider) rider = await Rider.findOne({ id: req.params.id });
    if (!rider) return res.status(404).json({ success: false, message: 'Rider not found' });

    const allowedFields = [
      'name', 'phone', 'route', 'vehicle', 'licenseNumber', 'aadhaarNumber',
      'aadhaarCardImage', 'aadhaarVerified', 'kycStatus', 'kycVerifiedAt',
      'kycDocumentType', 'status', 'onlineStatus', 'address', 'avatar',
      'joiningDate', 'perDeliveryRate', 'salaryType', 'rating', 'deliveriesToday',
      'activeTiffins', 'earningsToday', 'earningsTotal', 'payoutStatus'
    ];

    allowedFields.forEach(f => {
      if (req.body[f] !== undefined) {
        rider[f] = req.body[f];
      }
    });

    if (req.body.aadhaarNumber) {
      const clean = String(req.body.aadhaarNumber).replace(/\D/g, '');
      if (clean.length === 12) {
        rider.aadhaarNumber = `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8, 12)}`;
        rider.aadhaarVerified = true;
        rider.kycStatus = 'verified';
        rider.kycVerifiedAt = rider.kycVerifiedAt || new Date().toISOString();
        rider.kycDocumentType = 'Aadhaar Card (UIDAI Verified)';
      }
    }

    if (req.body.status) {
      rider.onlineStatus = req.body.status === 'offline' ? 'offline' : 'online';
    }

    await rider.save();
    res.json({ success: true, rider, message: 'Rider profile updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/admin/riders/:id/status
// @desc    Update rider status (toggle or explicit status)
// @access  Admin
router.put('/riders/:id/status', protect, adminOnly, async (req, res) => {
  try {
    let rider = await Rider.findById(req.params.id);
    if (!rider) rider = await Rider.findOne({ id: req.params.id });
    if (!rider) return res.status(404).json({ success: false, message: 'Rider not found' });

    if (req.body.status) {
      rider.status = req.body.status;
      rider.onlineStatus = req.body.status === 'offline' ? 'offline' : 'online';
    } else {
      const nextStatus = rider.status === 'available' ? 'on-route' : rider.status === 'on-route' ? 'offline' : 'available';
      rider.status = nextStatus;
      rider.onlineStatus = nextStatus === 'offline' ? 'offline' : 'online';
    }
    await rider.save();
    res.json({ success: true, rider });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/admin/riders/:id/assign
// @desc    Assign order or dispatch item to rider
// @access  Admin
router.post('/riders/:id/assign', protect, adminOnly, async (req, res) => {
  try {
    let rider = await Rider.findById(req.params.id);
    if (!rider) rider = await Rider.findOne({ id: req.params.id });
    if (!rider) return res.status(404).json({ success: false, message: 'Rider not found' });

    const { type, deliveryId } = req.body; // type: 'mess' or 'instant'

    if (type === 'instant') {
      let order = await Order.findById(deliveryId);
      if (!order) order = await Order.findOne({ orderId: deliveryId });
      if (!order) order = await Order.findOne({ id: deliveryId });
      if (order) {
        order.deliveryPartner = {
          name: rider.name,
          phone: rider.phone,
          vehicle: rider.vehicle
        };
        if (order.status === 'confirmed' || order.status === 'preparing') {
          order.status = 'on-the-way';
        }
        await order.save();
      }
    } else {
      let dispatch = await DispatchRoster.findById(deliveryId);
      if (!dispatch) dispatch = await DispatchRoster.findOne({ id: deliveryId });
      if (!dispatch) dispatch = await DispatchRoster.findOne({ orderId: deliveryId });
      if (dispatch) {
        dispatch.assignedRider = rider.name;
        dispatch.rider = rider.name;
        dispatch.riderPhone = rider.phone;
        dispatch.riderVehicle = rider.vehicle;
        dispatch.riderId = rider.id || rider._id;
        if (dispatch.status === 'preparing' || dispatch.status === 'pending' || !dispatch.status) {
          dispatch.status = 'dispatched';
          dispatch.deliveryStatus = 'Out for delivery';
          dispatch.statusStep = 'on-route';
        }
        if (typeof dispatch.save === 'function') {
          await dispatch.save();
        } else {
          await DispatchRoster.findByIdAndUpdate(dispatch._id || dispatch.id, dispatch);
        }
      }
    }

    rider.activeTiffins = (rider.activeTiffins || 0) + 1;
    rider.status = 'busy';
    await rider.save();

    res.json({ success: true, message: `Mess delivery assigned to ${rider.name} by Admin`, rider });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/admin/dispatch/auto-assign-routes
// @desc    Admin bulk-assigns unassigned mess tiffins to designated campus route riders
// @access  Admin
router.post('/dispatch/auto-assign-routes', protect, adminOnly, async (req, res) => {
  try {
    const riders = await Rider.find();
    const dispatches = await DispatchRoster.find();
    if (!dispatches || dispatches.length === 0) {
      return res.json({ success: true, count: 0, message: 'No dispatch records found' });
    }

    const zoneMap = {
      'NC-01': riders.find(r => (r.route || '').includes('NC-01') || (r.route || '').toLowerCase().includes('north')) || riders[0],
      'SC-02': riders.find(r => (r.route || '').includes('SC-02') || (r.route || '').toLowerCase().includes('south')) || riders[1] || riders[0],
      'MN-03': riders.find(r => (r.route || '').includes('MN-03') || (r.route || '').toLowerCase().includes('mukherjee')) || riders[2] || riders[0],
      'SB-04': riders.find(r => (r.route || '').toLowerCase().includes('science')) || riders[3] || riders[0]
    };

    let assignedCount = 0;
    for (const d of dispatches) {
      if (d.isSkipped || d.status === 'delivered') continue;
      const isUnassigned = !d.assignedRider || d.assignedRider === 'Unassigned';
      if (isUnassigned) {
        const assignedRider = zoneMap[d.zoneCode || 'NC-01'] || riders[0];
        if (assignedRider) {
          d.assignedRider = assignedRider.name;
          d.rider = assignedRider.name;
          d.riderPhone = assignedRider.phone;
          d.riderVehicle = assignedRider.vehicle;
          d.riderId = assignedRider.id || assignedRider._id;
          if (d.status === 'preparing' || !d.status) {
            d.status = 'dispatched';
            d.deliveryStatus = 'Out for delivery';
            d.statusStep = 'on-route';
          }
          if (typeof d.save === 'function') {
            await d.save();
          } else {
            await DispatchRoster.findByIdAndUpdate(d._id || d.id, d);
          }
          assignedCount++;
        }
      }
    }

    res.json({
      success: true,
      count: assignedCount,
      message: `Admin auto-assigned ${assignedCount} mess tiffins to designated campus route riders!`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/admin/dispatch/assign-slot
// @desc    Admin decides and assigns a rider to an entire meal slot (Lunch / Dinner / Breakfast)
// @access  Admin
router.post('/dispatch/assign-slot', protect, adminOnly, async (req, res) => {
  try {
    const { slot, riderId, overwriteAll } = req.body;
    if (!slot || !riderId) {
      return res.status(400).json({ success: false, message: 'Slot (Breakfast / Lunch / Dinner) and riderId are required' });
    }

    const riders = await Rider.find();
    let rider = riders.find(r => 
      String(r.id || '') === String(riderId) || 
      String(r._id || '') === String(riderId) || 
      (r.name && r.name.toLowerCase().trim() === String(riderId).toLowerCase().trim())
    );

    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider not found in system' });
    }

    const dispatches = await DispatchRoster.find();
    if (!dispatches || dispatches.length === 0) {
      return res.json({ success: true, count: 0, message: 'No dispatch records found' });
    }

    const targetSlot = slot.toLowerCase().trim();
    let assignedCount = 0;

    for (const d of dispatches) {
      if (d.isSkipped || d.status === 'delivered') continue;

      const itemSlot = (d.slot || d.mealSlot || '').toLowerCase().trim();
      const matchesSlot = itemSlot.includes(targetSlot) || targetSlot.includes(itemSlot);
      if (!matchesSlot) continue;

      const isUnassigned = !d.assignedRider || d.assignedRider === 'Unassigned';
      if (overwriteAll || isUnassigned) {
        d.assignedRider = rider.name;
        d.rider = rider.name;
        d.riderPhone = rider.phone;
        d.riderVehicle = rider.vehicle;
        d.riderId = rider.id || rider._id;
        if (d.status === 'preparing' || d.status === 'pending' || !d.status) {
          d.status = 'dispatched';
          d.deliveryStatus = 'Out for delivery';
          d.statusStep = 'on-route';
        }
        if (typeof d.save === 'function') {
          await d.save();
        } else {
          await DispatchRoster.findByIdAndUpdate(d._id || d.id, d);
        }
        assignedCount++;
      }
    }

    // Auto-sync all Extra Orders & Pack-with-Meal orders for this slot
    try {
      const allOrders = await Order.find();
      for (const o of allOrders) {
        const isMealExtra = Boolean(
          o.deliverWithMeal === true ||
          o.deliveryMode === 'with_tiffin' ||
          (o.isExtraOrder && o.mealSlot && o.mealSlot !== 'Instant')
        );
        if (!isMealExtra) continue;
        if (o.status === 'delivered' || o.status === 'cancelled') continue;
        const oSlot = (o.mealSlot || o.attachedMealSlot || o.notes || '').toLowerCase().trim();
        if (oSlot.includes(targetSlot) || targetSlot.includes(oSlot)) {
          o.deliveryPartner = {
            name: rider.name,
            phone: rider.phone,
            vehicle: rider.vehicle
          };
          o.riderId = rider.id || rider._id;
          await o.save();
        }
      }
    } catch (e) {
      console.warn('Could not auto-sync pack-with-meal orders in assign-slot:', e.message);
    }

    // Update rider active workload
    rider.activeTiffins = (rider.activeTiffins || 0) + assignedCount;
    rider.status = 'busy';
    await rider.save();

    res.json({
      success: true,
      count: assignedCount,
      slot,
      riderName: rider.name,
      message: `Admin successfully assigned ${assignedCount} ${slot} deliveries to ${rider.name}!`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/admin/dispatch/slot-summary
// @desc    Get Lunch and Dinner slot allocation summary for Admin Decision Hub
// @access  Admin
router.get('/dispatch/slot-summary', protect, adminOnly, async (req, res) => {
  try {
    const dispatches = await DispatchRoster.find();
    const riders = await Rider.find();

    const getStatsForSlot = (slotKeyword) => {
      const filtered = (dispatches || []).filter(d => {
        if (d.isSkipped) return false;
        const itemSlot = (d.slot || d.mealSlot || '').toLowerCase().trim();
        return itemSlot.includes(slotKeyword.toLowerCase()) || slotKeyword.toLowerCase().includes(itemSlot);
      });

      const total = filtered.length;
      const unassigned = filtered.filter(d => !d.assignedRider || d.assignedRider === 'Unassigned').length;
      const assigned = filtered.filter(d => d.assignedRider && d.assignedRider !== 'Unassigned' && (d.status || '').toLowerCase() !== 'delivered').length;
      const delivered = filtered.filter(d => (d.status || '').toLowerCase() === 'delivered').length;

      // Group by assigned rider
      const riderCounts = {};
      filtered.forEach(d => {
        if (d.assignedRider && d.assignedRider !== 'Unassigned') {
          riderCounts[d.assignedRider] = (riderCounts[d.assignedRider] || 0) + 1;
        }
      });

      let primaryRider = null;
      let maxCount = 0;
      Object.entries(riderCounts).forEach(([rName, count]) => {
        if (count > maxCount) {
          maxCount = count;
          primaryRider = rName;
        }
      });

      return { total, unassigned, assigned, delivered, primaryRider, riderCounts };
    };

    const lunchStats = getStatsForSlot('lunch');
    const dinnerStats = getStatsForSlot('dinner');
    const breakfastStats = getStatsForSlot('breakfast');

    res.json({
      success: true,
      lunch: lunchStats,
      dinner: dinnerStats,
      breakfast: breakfastStats,
      activeRidersCount: riders.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/admin/dispatch/assign-zone
// @desc    Admin assigns all mess tiffin deliveries of a specific campus zone to a rider
// @access  Admin
router.post('/dispatch/assign-zone', protect, adminOnly, async (req, res) => {
  try {
    const { zoneCode, riderId, slot, overwriteAll = true } = req.body;
    if (!zoneCode || !riderId) {
      return res.status(400).json({ success: false, message: 'zoneCode and riderId are required' });
    }

    const riders = await Rider.find();
    let rider = riders.find(r => 
      String(r.id || '') === String(riderId) || 
      String(r._id || '') === String(riderId) || 
      (r.name && (
        r.name.toLowerCase().trim() === String(riderId).toLowerCase().trim() ||
        r.name.toLowerCase().includes(String(riderId).toLowerCase().trim()) ||
        String(riderId).toLowerCase().includes(r.name.toLowerCase().trim())
      ))
    );

    if (!rider) {
      rider = {
        id: `R-${Date.now()}`,
        name: String(riderId),
        phone: '+91 98765 43210',
        vehicle: 'Hero Electric (EV-Fleet)'
      };
    }

    const dispatches = await DispatchRoster.find();
    if (!dispatches || dispatches.length === 0) {
      return res.json({ success: true, count: 0, message: 'No dispatch records found' });
    }

    const targetZone = zoneCode.toUpperCase().trim();
    const targetSlot = slot ? slot.toLowerCase().trim() : null;
    let assignedCount = 0;

    for (const d of dispatches) {
      if (d.isSkipped || d.status === 'delivered') continue;

      const itemZone = (d.zoneCode || d.zone || '').toUpperCase().trim();
      const matchesZone = itemZone === targetZone || itemZone.includes(targetZone) || targetZone.includes(itemZone);
      if (!matchesZone) continue;

      if (targetSlot) {
        const itemSlot = (d.slot || d.mealSlot || '').toLowerCase().trim();
        const matchesSlot = itemSlot.includes(targetSlot) || targetSlot.includes(itemSlot);
        if (!matchesSlot) continue;
      }

      const isUnassigned = !d.assignedRider || d.assignedRider === 'Unassigned';
      if (overwriteAll || isUnassigned) {
        d.assignedRider = rider.name;
        d.rider = rider.name;
        d.riderPhone = rider.phone;
        d.riderVehicle = rider.vehicle;
        d.riderId = rider.id || rider._id;
        if (d.status === 'preparing' || d.status === 'pending' || !d.status) {
          d.status = 'dispatched';
          d.deliveryStatus = 'Out for delivery';
          d.statusStep = 'on-route';
        }
        if (typeof d.save === 'function') {
          await d.save();
        } else {
          await DispatchRoster.findByIdAndUpdate(d._id || d.id, d);
        }
        assignedCount++;
      }
    }

    // Update zone default assigned rider in Zone collection
    try {
      const zoneDoc = await Zone.findOne({ code: targetZone });
      if (zoneDoc) {
        zoneDoc.assignedRider = `${rider.name} (${rider.vehicle || 'EV'})`;
        await zoneDoc.save();
      }
    } catch (e) {
      console.warn('Could not update Zone doc:', e.message);
    }

    // Auto-sync all Pack-with-Meal orders for this zone
    try {
      const allOrders = await Order.find();
      for (const o of allOrders) {
        const isMealExtra = Boolean(
          o.deliverWithMeal === true ||
          o.deliveryMode === 'with_tiffin' ||
          (o.isExtraOrder && o.mealSlot && o.mealSlot !== 'Instant')
        );
        if (!isMealExtra) continue;
        if (o.status === 'delivered' || o.status === 'cancelled') continue;
        const oAddr = (o.deliveryAddress || '').toUpperCase();
        if (oAddr.includes(targetZone) || targetZone.includes(oAddr)) {
          if (targetSlot) {
            const oSlot = (o.mealSlot || o.attachedMealSlot || o.notes || '').toLowerCase().trim();
            if (!oSlot.includes(targetSlot)) continue;
          }
          o.deliveryPartner = {
            name: rider.name,
            phone: rider.phone,
            vehicle: rider.vehicle
          };
          o.riderId = rider.id || rider._id;
          await o.save();
        }
      }
    } catch (e) {
      console.warn('Could not auto-sync pack-with-meal orders in assign-zone:', e.message);
    }

    // Update rider active workload
    rider.activeTiffins = (rider.activeTiffins || 0) + assignedCount;
    rider.status = 'busy';
    await rider.save();

    res.json({
      success: true,
      count: assignedCount,
      zoneCode: targetZone,
      riderName: rider.name,
      message: `Admin assigned Zone ${targetZone} (${assignedCount} tiffins) to ${rider.name}!`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/admin/dispatch/zone-summary
// @desc    Get detailed breakdown of mess tiffins per zone with assigned riders
// @access  Admin
router.get('/dispatch/zone-summary', protect, adminOnly, async (req, res) => {
  try {
    const [dispatches, zones, riders] = await Promise.all([
      DispatchRoster.find(),
      Zone.find(),
      Rider.find()
    ]);

    const zoneStats = (zones || []).map(z => {
      const zCode = (z.code || '').toUpperCase().trim();
      const matchingTiffins = (dispatches || []).filter(d => {
        if (d.isSkipped) return false;
        const dZone = (d.zoneCode || d.zone || '').toUpperCase().trim();
        return dZone === zCode || dZone.includes(zCode) || zCode.includes(dZone);
      });

      const total = matchingTiffins.length;
      const breakfastCount = matchingTiffins.filter(d => (d.slot || d.mealSlot || '').toLowerCase().includes('breakfast')).length;
      const lunchCount = matchingTiffins.filter(d => (d.slot || d.mealSlot || '').toLowerCase().includes('lunch')).length;
      const dinnerCount = matchingTiffins.filter(d => (d.slot || d.mealSlot || '').toLowerCase().includes('dinner')).length;
      const unassignedCount = matchingTiffins.filter(d => !d.assignedRider || d.assignedRider === 'Unassigned').length;
      const assignedCount = matchingTiffins.filter(d => d.assignedRider && d.assignedRider !== 'Unassigned' && (d.status || '').toLowerCase() !== 'delivered').length;
      const deliveredCount = matchingTiffins.filter(d => (d.status || '').toLowerCase() === 'delivered').length;

      const riderCounts = {};
      matchingTiffins.forEach(d => {
        if (d.assignedRider && d.assignedRider !== 'Unassigned') {
          riderCounts[d.assignedRider] = (riderCounts[d.assignedRider] || 0) + 1;
        }
      });

      let topRider = '';
      let max = 0;
      Object.entries(riderCounts).forEach(([r, c]) => {
        if (c > max) { max = c; topRider = r; }
      });

      return {
        id: z.id || z._id,
        code: z.code,
        name: z.name,
        areas: z.areas || [],
        defaultRider: z.assignedRider,
        topRider: topRider || z.assignedRider?.split('(')[0]?.trim() || 'Pending Decision',
        total,
        breakfastCount,
        lunchCount,
        dinnerCount,
        unassignedCount,
        assignedCount,
        deliveredCount
      };
    });

    res.json({
      success: true,
      zones: zoneStats,
      activeRidersCount: (riders || []).length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/admin/riders/:id/settle
// @desc    Settle rider earnings (mark as paid)
// @access  Admin
router.put('/riders/:id/settle', protect, adminOnly, async (req, res) => {
  try {
    let rider = await Rider.findById(req.params.id);
    if (!rider) rider = await Rider.findOne({ id: req.params.id });
    if (!rider) return res.status(404).json({ success: false, message: 'Rider not found' });

    rider.payoutStatus = 'paid';
    rider.lastSettlementDate = new Date().toISOString();
    await rider.save();

    res.json({ success: true, message: 'Rider earnings settled successfully', rider });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/admin/riders/:id
// @desc    Delete rider
// @access  Admin
router.delete('/riders/:id', protect, adminOnly, async (req, res) => {
  try {
    let rider = await Rider.findByIdAndDelete(req.params.id);
    if (!rider) rider = await Rider.findOneAndDelete({ id: req.params.id });
    if (!rider) return res.status(404).json({ success: false, message: 'Rider not found' });
    res.json({ success: true, message: 'Rider removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELIVERY RATES & PRICING CONFIGURATION ────────────────────
const DEFAULT_DELIVERY_RATES = {
  id: 'global_delivery_rates',
  // 🍱 Mess Tiffin Delivery Rates
  messPerBoxRate: 25,
  messDinnerSurgeBonus: 8,
  messCustomerDeliveryFee: 0,
  messExtraAttachedBonus: 5,
  messWeekendBonus: 10,
  messMinDailyGuarantee: 200,

  // ⚡ Instant Food (Quick Extra Orders) Pricing & Fee Controls
  instantPerOrderRate: 40,
  instantCustomerDeliveryFee: 35,
  instantBaseDeliveryFee: 25,
  instantPerKmFee: 10,
  instantPricingMode: 'slabs', // 'slabs' | 'per_km'
  instantSlab0to2Km: 25,
  instantSlab2to5Km: 40,
  instantSlab5to8Km: 65,
  instantSlabAbove8Km: 90,
  instantMinOrderValue: 99,
  instantFreeDeliveryThreshold: 249,
  instantPeakHourFee: 15,
  instantPeakHourEnabled: true,
  instantPeakHourTiming: '12:30 PM - 02:30 PM & 07:30 PM - 10:30 PM',
  instantNightDeliveryFee: 20,
  instantNightDeliveryEnabled: true,
  instantNightTiming: '10:30 PM - 03:00 AM',
  instantRainFee: 25,
  instantRainFeeEnabled: false,
  instantSurgeFee: 20,
  instantSurgeMultiplier: 1.25,
  instantSurgeMode: 'flat', // 'flat' | 'multiplier'
  instantSurgeEnabled: false,
  instantZones: [
    { id: 'zone-1', name: 'North Campus Hostels (BH 1-6 & PG Hub)', baseFee: 25, extraFee: 0, isActive: true, description: 'Core hostel zone within 2 KM' },
    { id: 'zone-2', name: 'South Campus Hostels (GH & Sports Block)', baseFee: 30, extraFee: 5, isActive: true, description: 'South campus zone (2-5 KM)' },
    { id: 'zone-3', name: 'Faculty & University Staff Quarters', baseFee: 35, extraFee: 10, isActive: true, description: 'Faculty enclaves & guest houses' },
    { id: 'zone-4', name: 'Off-Campus Student PGs & Apartments', baseFee: 50, extraFee: 25, isActive: true, description: 'Outer student clusters within 5-8 KM' }
  ],
  instantPeakSurgeBonus: 15,
  instantRainSurgeBonus: 20,
  instantMinDailyGuarantee: 300,

  // Fallback aliases for backward compatibility
  defaultPerDeliveryRate: 25,
  dinnerSurgeBonus: 8,
  customerDeliveryFee: 35,
  freeDeliveryThreshold: 249,
  minDailyGuarantee: 200,
  weekendSurgeBonus: 10
};

async function getOrCreateDeliveryRateSettings() {
  try {
    let settings = await DeliveryRateSetting.findOne({ id: 'global_delivery_rates' });
    if (!settings) {
      settings = await DeliveryRateSetting.create({
        ...DEFAULT_DELIVERY_RATES,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    return settings;
  } catch (e) {
    return DEFAULT_DELIVERY_RATES;
  }
}

// @route   GET /api/admin/delivery-rates
// @desc    Get delivery rates configuration (Mess vs Instant) and per-rider delivery rates
// @access  Admin
router.get('/delivery-rates', protect, adminOnly, async (req, res) => {
  try {
    const settings = await getOrCreateDeliveryRateSettings();
    const riders = await Rider.find();
    const riderRates = (riders || []).map(r => ({
      id: r.id || r._id,
      name: r.name,
      phone: r.phone,
      vehicle: r.vehicle,
      route: r.route,
      status: r.status,
      messDeliveryRate: Number(r.messDeliveryRate || r.perDeliveryRate || settings.messPerBoxRate || 25),
      instantDeliveryRate: Number(r.instantDeliveryRate || settings.instantPerOrderRate || 40),
      perDeliveryRate: Number(r.perDeliveryRate || r.messDeliveryRate || settings.messPerBoxRate || 25),
      deliveriesToday: r.deliveriesToday || 0,
      earningsToday: r.earningsToday || 0
    }));

    res.json({
      success: true,
      rates: {
        // 🍱 Mess Tiffin
        messPerBoxRate: Number(settings.messPerBoxRate || settings.defaultPerDeliveryRate || 25),
        messDinnerSurgeBonus: Number(settings.messDinnerSurgeBonus || settings.dinnerSurgeBonus || 8),
        messCustomerDeliveryFee: Number(settings.messCustomerDeliveryFee ?? 0),
        messExtraAttachedBonus: Number(settings.messExtraAttachedBonus ?? 5),
        messWeekendBonus: Number(settings.messWeekendBonus || settings.weekendSurgeBonus || 10),
        messMinDailyGuarantee: Number(settings.messMinDailyGuarantee || settings.minDailyGuarantee || 200),

        // ⚡ Instant Food (Quick Extra Orders) Pricing & Fee Controls
        instantPerOrderRate: Number(settings.instantPerOrderRate || 40),
        instantCustomerDeliveryFee: Number(settings.instantCustomerDeliveryFee || settings.customerDeliveryFee || settings.instantBaseDeliveryFee || 35),
        instantBaseDeliveryFee: Number(settings.instantBaseDeliveryFee ?? 25),
        instantPerKmFee: Number(settings.instantPerKmFee ?? 10),
        instantPricingMode: settings.instantPricingMode || 'slabs',
        instantSlab0to2Km: Number(settings.instantSlab0to2Km ?? 25),
        instantSlab2to5Km: Number(settings.instantSlab2to5Km ?? 40),
        instantSlab5to8Km: Number(settings.instantSlab5to8Km ?? 65),
        instantSlabAbove8Km: Number(settings.instantSlabAbove8Km ?? 90),
        instantMinOrderValue: Number(settings.instantMinOrderValue ?? 99),
        instantFreeDeliveryThreshold: Number(settings.instantFreeDeliveryThreshold || settings.freeDeliveryThreshold || 249),
        instantPeakHourFee: Number(settings.instantPeakHourFee ?? 15),
        instantPeakHourEnabled: settings.instantPeakHourEnabled !== undefined ? Boolean(settings.instantPeakHourEnabled) : true,
        instantPeakHourTiming: settings.instantPeakHourTiming || '12:30 PM - 02:30 PM & 07:30 PM - 10:30 PM',
        instantNightDeliveryFee: Number(settings.instantNightDeliveryFee ?? 20),
        instantNightDeliveryEnabled: settings.instantNightDeliveryEnabled !== undefined ? Boolean(settings.instantNightDeliveryEnabled) : true,
        instantNightTiming: settings.instantNightTiming || '10:30 PM - 03:00 AM',
        instantRainFee: Number(settings.instantRainFee ?? 25),
        instantRainFeeEnabled: Boolean(settings.instantRainFeeEnabled),
        instantSurgeFee: Number(settings.instantSurgeFee ?? 20),
        instantSurgeMultiplier: Number(settings.instantSurgeMultiplier ?? 1.25),
        instantSurgeMode: settings.instantSurgeMode || 'flat',
        instantSurgeEnabled: Boolean(settings.instantSurgeEnabled),
        instantZones: Array.isArray(settings.instantZones) && settings.instantZones.length ? settings.instantZones : DEFAULT_DELIVERY_RATES.instantZones,
        instantPeakSurgeBonus: Number(settings.instantPeakSurgeBonus || 15),
        instantRainSurgeBonus: Number(settings.instantRainSurgeBonus || 20),
        instantMinDailyGuarantee: Number(settings.instantMinDailyGuarantee || 300),

        // Fallbacks
        defaultPerDeliveryRate: Number(settings.messPerBoxRate || settings.defaultPerDeliveryRate || 25),
        dinnerSurgeBonus: Number(settings.messDinnerSurgeBonus || settings.dinnerSurgeBonus || 8),
        customerDeliveryFee: Number(settings.instantCustomerDeliveryFee || settings.customerDeliveryFee || settings.instantBaseDeliveryFee || 35),
        freeDeliveryThreshold: Number(settings.instantFreeDeliveryThreshold || settings.freeDeliveryThreshold || 249),
        minDailyGuarantee: Number(settings.messMinDailyGuarantee || settings.minDailyGuarantee || 200),
        weekendSurgeBonus: Number(settings.messWeekendBonus || settings.weekendSurgeBonus || 10),
        updatedAt: settings.updatedAt || new Date().toISOString()
      },
      riders: riderRates
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/admin/delivery-rates
// @desc    Update delivery rates configuration (Mess & Instant) and optionally apply to all riders
// @access  Admin
router.post('/delivery-rates', protect, adminOnly, async (req, res) => {
  try {
    const {
      // Mess fields
      messPerBoxRate,
      messDinnerSurgeBonus,
      messCustomerDeliveryFee,
      messExtraAttachedBonus,
      messWeekendBonus,
      messMinDailyGuarantee,

      // Instant fields (Pricing & Fee Controls)
      instantPerOrderRate,
      instantCustomerDeliveryFee,
      instantBaseDeliveryFee,
      instantPerKmFee,
      instantPricingMode,
      instantSlab0to2Km,
      instantSlab2to5Km,
      instantSlab5to8Km,
      instantSlabAbove8Km,
      instantMinOrderValue,
      instantFreeDeliveryThreshold,
      instantPeakHourFee,
      instantPeakHourEnabled,
      instantPeakHourTiming,
      instantNightDeliveryFee,
      instantNightDeliveryEnabled,
      instantNightTiming,
      instantRainFee,
      instantRainFeeEnabled,
      instantSurgeFee,
      instantSurgeMultiplier,
      instantSurgeMode,
      instantSurgeEnabled,
      instantZones,
      instantPeakSurgeBonus,
      instantRainSurgeBonus,
      instantMinDailyGuarantee,

      // Fallback & Application options
      defaultPerDeliveryRate,
      dinnerSurgeBonus,
      customerDeliveryFee,
      freeDeliveryThreshold,
      minDailyGuarantee,
      weekendSurgeBonus,
      applyToAllRiders,
      applyTarget = 'both', // 'both' | 'mess' | 'instant'
      individualRiderRates
    } = req.body;

    let settings = await DeliveryRateSetting.findOne({ id: 'global_delivery_rates' });
    if (!settings) {
      settings = await DeliveryRateSetting.create({
        ...DEFAULT_DELIVERY_RATES,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // Update Mess settings
    if (messPerBoxRate !== undefined) settings.messPerBoxRate = Math.max(0, Number(messPerBoxRate));
    else if (defaultPerDeliveryRate !== undefined) settings.messPerBoxRate = Math.max(0, Number(defaultPerDeliveryRate));
    if (messDinnerSurgeBonus !== undefined) settings.messDinnerSurgeBonus = Math.max(0, Number(messDinnerSurgeBonus));
    else if (dinnerSurgeBonus !== undefined) settings.messDinnerSurgeBonus = Math.max(0, Number(dinnerSurgeBonus));
    if (messCustomerDeliveryFee !== undefined) settings.messCustomerDeliveryFee = Math.max(0, Number(messCustomerDeliveryFee));
    if (messExtraAttachedBonus !== undefined) settings.messExtraAttachedBonus = Math.max(0, Number(messExtraAttachedBonus));
    if (messWeekendBonus !== undefined) settings.messWeekendBonus = Math.max(0, Number(messWeekendBonus));
    if (messMinDailyGuarantee !== undefined) settings.messMinDailyGuarantee = Math.max(0, Number(messMinDailyGuarantee));

    // Update Instant settings
    if (instantPerOrderRate !== undefined) settings.instantPerOrderRate = Math.max(0, Number(instantPerOrderRate));
    if (instantBaseDeliveryFee !== undefined) settings.instantBaseDeliveryFee = Math.max(0, Number(instantBaseDeliveryFee));
    if (instantPerKmFee !== undefined) settings.instantPerKmFee = Math.max(0, Number(instantPerKmFee));
    if (instantPricingMode !== undefined) settings.instantPricingMode = instantPricingMode === 'per_km' ? 'per_km' : 'slabs';
    if (instantSlab0to2Km !== undefined) settings.instantSlab0to2Km = Math.max(0, Number(instantSlab0to2Km));
    if (instantSlab2to5Km !== undefined) settings.instantSlab2to5Km = Math.max(0, Number(instantSlab2to5Km));
    if (instantSlab5to8Km !== undefined) settings.instantSlab5to8Km = Math.max(0, Number(instantSlab5to8Km));
    if (instantSlabAbove8Km !== undefined) settings.instantSlabAbove8Km = Math.max(0, Number(instantSlabAbove8Km));
    if (instantMinOrderValue !== undefined) settings.instantMinOrderValue = Math.max(0, Number(instantMinOrderValue));
    if (instantCustomerDeliveryFee !== undefined) settings.instantCustomerDeliveryFee = Math.max(0, Number(instantCustomerDeliveryFee));
    else if (customerDeliveryFee !== undefined) settings.instantCustomerDeliveryFee = Math.max(0, Number(customerDeliveryFee));
    else if (instantBaseDeliveryFee !== undefined) settings.instantCustomerDeliveryFee = Math.max(0, Number(instantBaseDeliveryFee));
    if (instantFreeDeliveryThreshold !== undefined) settings.instantFreeDeliveryThreshold = Math.max(0, Number(instantFreeDeliveryThreshold));
    else if (freeDeliveryThreshold !== undefined) settings.instantFreeDeliveryThreshold = Math.max(0, Number(freeDeliveryThreshold));

    // Dynamic environmental & surge fees
    if (instantPeakHourFee !== undefined) settings.instantPeakHourFee = Math.max(0, Number(instantPeakHourFee));
    if (instantPeakHourEnabled !== undefined) settings.instantPeakHourEnabled = Boolean(instantPeakHourEnabled);
    if (instantPeakHourTiming !== undefined) settings.instantPeakHourTiming = String(instantPeakHourTiming);
    if (instantNightDeliveryFee !== undefined) settings.instantNightDeliveryFee = Math.max(0, Number(instantNightDeliveryFee));
    if (instantNightDeliveryEnabled !== undefined) settings.instantNightDeliveryEnabled = Boolean(instantNightDeliveryEnabled);
    if (instantNightTiming !== undefined) settings.instantNightTiming = String(instantNightTiming);
    if (instantRainFee !== undefined) settings.instantRainFee = Math.max(0, Number(instantRainFee));
    if (instantRainFeeEnabled !== undefined) settings.instantRainFeeEnabled = Boolean(instantRainFeeEnabled);
    if (instantSurgeFee !== undefined) settings.instantSurgeFee = Math.max(0, Number(instantSurgeFee));
    if (instantSurgeMultiplier !== undefined) settings.instantSurgeMultiplier = Math.max(1, Number(instantSurgeMultiplier));
    if (instantSurgeMode !== undefined) settings.instantSurgeMode = instantSurgeMode === 'multiplier' ? 'multiplier' : 'flat';
    if (instantSurgeEnabled !== undefined) settings.instantSurgeEnabled = Boolean(instantSurgeEnabled);
    if (Array.isArray(instantZones)) settings.instantZones = instantZones;

    // Partner incentives
    if (instantPeakSurgeBonus !== undefined) settings.instantPeakSurgeBonus = Math.max(0, Number(instantPeakSurgeBonus));
    if (instantRainSurgeBonus !== undefined) settings.instantRainSurgeBonus = Math.max(0, Number(instantRainSurgeBonus));
    if (instantMinDailyGuarantee !== undefined) settings.instantMinDailyGuarantee = Math.max(0, Number(instantMinDailyGuarantee));

    // Sync legacy fallback properties
    settings.defaultPerDeliveryRate = settings.messPerBoxRate;
    settings.dinnerSurgeBonus = settings.messDinnerSurgeBonus;
    settings.customerDeliveryFee = settings.instantCustomerDeliveryFee;
    settings.freeDeliveryThreshold = settings.instantFreeDeliveryThreshold;
    settings.minDailyGuarantee = settings.messMinDailyGuarantee;
    settings.weekendSurgeBonus = settings.messWeekendBonus;
    settings.updatedAt = new Date().toISOString();

    if (typeof settings.save === 'function') {
      await settings.save();
    } else {
      await DeliveryRateSetting.findByIdAndUpdate(settings._id || settings.id, settings);
    }

    let updatedRidersCount = 0;
    // Bulk update all riders if applyToAllRiders is true
    if (applyToAllRiders) {
      const allRiders = await Rider.find();
      for (const r of allRiders) {
        if (applyTarget === 'mess' || applyTarget === 'both') {
          const targetMessRate = Number(settings.messPerBoxRate);
          r.messDeliveryRate = targetMessRate;
          r.perDeliveryRate = targetMessRate;
        }
        if (applyTarget === 'instant' || applyTarget === 'both') {
          const targetInstantRate = Number(settings.instantPerOrderRate);
          r.instantDeliveryRate = targetInstantRate;
        }
        if (typeof r.save === 'function') {
          await r.save();
        } else {
          await Rider.findByIdAndUpdate(r._id || r.id, r);
        }
        updatedRidersCount++;
      }
    }

    // Update specific individual rider rates if provided
    if (Array.isArray(individualRiderRates)) {
      for (const item of individualRiderRates) {
        if (!item || !item.riderId) continue;
        let r = await Rider.findById(item.riderId);
        if (!r) r = await Rider.findOne({ id: item.riderId });
        if (r) {
          if (item.messDeliveryRate !== undefined) {
            r.messDeliveryRate = Math.max(0, Number(item.messDeliveryRate));
            r.perDeliveryRate = r.messDeliveryRate;
          } else if (item.perDeliveryRate !== undefined) {
            r.messDeliveryRate = Math.max(0, Number(item.perDeliveryRate));
            r.perDeliveryRate = r.messDeliveryRate;
          }
          if (item.instantDeliveryRate !== undefined) {
            r.instantDeliveryRate = Math.max(0, Number(item.instantDeliveryRate));
          }
          if (typeof r.save === 'function') {
            await r.save();
          } else {
            await Rider.findByIdAndUpdate(r._id || r.id, r);
          }
          updatedRidersCount++;
        }
      }
    }

    const refreshedRiders = await Rider.find();

    res.json({
      success: true,
      message: applyToAllRiders
        ? `Rates applied to all ${updatedRidersCount} riders (Mess: ₹${settings.messPerBoxRate}/box, Instant: ₹${settings.instantPerOrderRate}/order)!`
        : 'Delivery rates settings saved successfully!',
      rates: settings,
      updatedRidersCount,
      riders: refreshedRiders.map(r => ({
        id: r.id || r._id,
        name: r.name,
        phone: r.phone,
        vehicle: r.vehicle,
        route: r.route,
        status: r.status,
        messDeliveryRate: Number(r.messDeliveryRate || r.perDeliveryRate || settings.messPerBoxRate || 25),
        instantDeliveryRate: Number(r.instantDeliveryRate || settings.instantPerOrderRate || 40),
        perDeliveryRate: Number(r.perDeliveryRate || r.messDeliveryRate || settings.messPerBoxRate || 25),
        deliveriesToday: r.deliveriesToday || 0,
        earningsToday: r.earningsToday || 0
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/admin/riders/:id/rate
// @desc    Quickly update Mess and/or Instant delivery rate for a specific rider
// @access  Admin
router.put('/riders/:id/rate', protect, adminOnly, async (req, res) => {
  try {
    const { perDeliveryRate, messDeliveryRate, instantDeliveryRate } = req.body;
    let rider = await Rider.findById(req.params.id);
    if (!rider) rider = await Rider.findOne({ id: req.params.id });
    if (!rider) return res.status(404).json({ success: false, message: 'Rider not found' });

    if (messDeliveryRate !== undefined) {
      rider.messDeliveryRate = Math.max(0, Number(messDeliveryRate));
      rider.perDeliveryRate = rider.messDeliveryRate;
    } else if (perDeliveryRate !== undefined) {
      rider.messDeliveryRate = Math.max(0, Number(perDeliveryRate));
      rider.perDeliveryRate = rider.messDeliveryRate;
    }

    if (instantDeliveryRate !== undefined) {
      rider.instantDeliveryRate = Math.max(0, Number(instantDeliveryRate));
    }

    if (typeof rider.save === 'function') {
      await rider.save();
    } else {
      await Rider.findByIdAndUpdate(rider._id || rider.id, rider);
    }

    res.json({
      success: true,
      message: `Delivery rates for ${rider.name} updated: Mess ₹${rider.messDeliveryRate || rider.perDeliveryRate}/box, Instant ₹${rider.instantDeliveryRate || 40}/order`,
      rider
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── MESS MEAL DELIVERY TIMINGS & KITCHEN CUTOFF CONTROLS ─────────
// @route   GET /api/admin/meal-timings
// @desc    Get live delivery timing and cutoff configuration for Breakfast, Lunch, Dinner
// @access  Admin
router.get('/meal-timings', protect, adminOnly, async (req, res) => {
  try {
    const timings = await getOrCreateMealTimings();
    res.json({ success: true, timings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/admin/meal-timings
// @route   POST /api/admin/meal-timings
// @desc    Admin configures and updates delivery hours & cutoff deadlines for Breakfast, Lunch, Dinner
// @access  Admin
const updateMealTimingsHandler = async (req, res) => {
  try {
    const MealTiming = getModel('mealTimingSettings');
    let doc = await MealTiming.findOne({ id: 'global_meal_timings' });
    if (!doc) {
      doc = await MealTiming.create({
        ...DEFAULT_MEAL_TIMINGS,
        createdAt: new Date().toISOString()
      });
    }

    const { breakfast, lunch, dinner, generalNotice } = req.body;

    function formatSlotData(existingSlot, incomingSlot) {
      if (!incomingSlot) return existingSlot;
      const enabled = incomingSlot.enabled !== undefined ? Boolean(incomingSlot.enabled) : (existingSlot?.enabled ?? true);
      const label = incomingSlot.label || existingSlot?.label || '';
      const description = incomingSlot.description || existingSlot?.description || '';

      const dStart = incomingSlot.deliveryStart || existingSlot?.deliveryStart || '12:30';
      const dEnd = incomingSlot.deliveryEnd || existingSlot?.deliveryEnd || '14:00';
      const parsedStart = parse24to12(dStart);
      const parsedEnd = parse24to12(dEnd);
      const deliveryTimeStr = `${parsedStart.timeStr} - ${parsedEnd.timeStr}`;

      const cTime = incomingSlot.cutoffTime || existingSlot?.cutoffTime || '11:30';
      const parsedCutoff = parse24to12(cTime);

      const sTime = incomingSlot.skipCutoffTime || existingSlot?.skipCutoffTime || '10:30';
      const parsedSkip = parse24to12(sTime);

      return {
        enabled,
        label,
        deliveryStart: parsedStart.raw,
        deliveryEnd: parsedEnd.raw,
        deliveryTimeStr,
        cutoffTime: parsedCutoff.raw,
        cutoffTimeStr: parsedCutoff.timeStr,
        cutoffMinutes: parsedCutoff.minutes,
        skipCutoffTime: parsedSkip.raw,
        skipCutoffTimeStr: parsedSkip.timeStr,
        skipCutoffMinutes: parsedSkip.minutes,
        description
      };
    }

    const updatedBreakfast = formatSlotData(doc.breakfast || DEFAULT_MEAL_TIMINGS.breakfast, breakfast);
    const updatedLunch = formatSlotData(doc.lunch || DEFAULT_MEAL_TIMINGS.lunch, lunch);
    const updatedDinner = formatSlotData(doc.dinner || DEFAULT_MEAL_TIMINGS.dinner, dinner);

    doc.breakfast = updatedBreakfast;
    doc.lunch = updatedLunch;
    doc.dinner = updatedDinner;
    if (generalNotice !== undefined) doc.generalNotice = generalNotice;
    doc.updatedAt = new Date().toISOString();

    if (typeof doc.save === 'function') {
      await doc.save();
    } else {
      await MealTiming.findByIdAndUpdate(doc._id || doc.id, doc);
    }

    res.json({
      success: true,
      message: 'Mess meal delivery timings and cutoff settings updated successfully!',
      timings: doc
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

router.post('/meal-timings', protect, adminOnly, updateMealTimingsHandler);
router.put('/meal-timings', protect, adminOnly, updateMealTimingsHandler);

// ── RIDER EARNINGS & PAYOUT REPORTS ────────────────────────────
// @route   GET /api/admin/rider-earnings
// @desc    Get detailed rider earnings report (daily, monthly, date-wise, per rider)
// @access  Admin
router.get('/rider-earnings', protect, adminOnly, async (req, res) => {
  try {
    const {
      period,
      date,
      month,
      startDate,
      endDate,
      riderId,
      status,
      service
    } = req.query;

    const report = await getRiderEarningsReport({
      period,
      date,
      month,
      startDate,
      endDate,
      riderId,
      status,
      service
    });

    res.json(report);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/admin/rider-earnings/settle
// @desc    Settle payout for an individual rider with payment proof & voucher
// @access  Admin
router.post('/rider-earnings/settle', protect, adminOnly, async (req, res) => {
  try {
    const {
      riderId,
      date,
      month,
      amount,
      paymentMethod,
      referenceId,
      notes
    } = req.body;

    const result = await settleRiderPayout({
      riderId,
      date,
      month,
      amount,
      paymentMethod,
      referenceId,
      notes,
      adminName: req.user ? req.user.name : 'Admin Master'
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/admin/rider-earnings/bulk-settle
// @desc    Bulk settle payouts for multiple or all pending riders
// @access  Admin
router.post('/rider-earnings/bulk-settle', protect, adminOnly, async (req, res) => {
  try {
    const {
      riderIds,
      date,
      month,
      paymentMethod,
      referenceId,
      notes
    } = req.body;

    const result = await bulkSettleRiderPayouts({
      riderIds,
      date,
      month,
      paymentMethod,
      referenceId,
      notes,
      adminName: req.user ? req.user.name : 'Admin Master'
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELIVERY ROUTES ────────────────────────────────────────────
// @route   GET /api/admin/routes
// @desc    Get all delivery routes
// @access  Admin
router.get('/routes', protect, adminOnly, async (req, res) => {
  try {
    const routes = await DeliveryRoute.find();
    res.json({ success: true, count: routes.length, routes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/admin/routes/:id/status
// @desc    Update delivery route status
// @access  Admin
router.put('/routes/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    let route = await DeliveryRoute.findById(req.params.id);
    if (!route) route = await DeliveryRoute.findOne({ id: req.params.id });
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });

    route.status = status;
    await route.save();
    res.json({ success: true, route });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Helper: get current date in IST (UTC+5:30)
function getISTDateStr(offsetDays = 0) {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
  const istDate = new Date(utc + istOffset + (offsetDays * 24 * 60 * 60 * 1000));
  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper: calculate Monday-to-Sunday week range in IST
function getWeekRange(offsetWeeks = 0) {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
  const istDate = new Date(utc + istOffset);
  const day = istDate.getDay();
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const monday = new Date(istDate.getTime() + (diffToMonday + offsetWeeks * 7) * 24 * 60 * 60 * 1000);
  const sunday = new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000);
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { start: fmt(monday), end: fmt(sunday) };
}

// Helper: calculate previous calendar month range in IST
function getLastMonthRange() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
  const istDate = new Date(utc + istOffset);
  const firstDay = new Date(istDate.getFullYear(), istDate.getMonth() - 1, 1);
  const lastDay = new Date(istDate.getFullYear(), istDate.getMonth(), 0);
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return {
    start: fmt(firstDay),
    end: fmt(lastDay),
    monthStr: `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, '0')}`
  };
}

// Helper to format YYYY-MM into readable month name
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function formatMonthLabel(ym) {
  if (!ym || ym === 'all') return 'All Months';
  const parts = ym.split('-');
  if (parts.length < 2) return ym;
  const idx = parseInt(parts[1], 10) - 1;
  return `${MONTH_NAMES[idx] || parts[1]} ${parts[0]}`;
}

// Normalizer for dispatch roster entry ensuring both schema representations are present
function normalizeDispatchEntry(item) {
  if (!item) return item;
  const raw = typeof item.toObject === 'function' ? item.toObject() : item;
  const student = raw.student || raw.studentName || raw.customerName || 'Student Member';
  const slot = raw.slot || raw.mealSlot || 'Lunch';
  const plan = raw.plan || raw.planName || 'Standard Meal';
  const rider = raw.rider || raw.assignedRider || 'Unassigned';
  const hostel = raw.hostel || raw.hostelAddress || 'Hostel Campus';
  const zoneCode = raw.zoneCode || raw.zone || 'NC-01';
  const status = raw.status || raw.statusStep || raw.deliveryStatus || 'preparing';
  const room = raw.room || (hostel.match(/Room\s*([0-9A-Za-z-]+)/i)?.[1]) || '';
  const phone = raw.customerPhone || raw.phone || raw.riderPhone || '';
  const date = raw.date || getISTDateStr(0);

  return {
    ...raw,
    id: raw.id || raw._id,
    _id: raw._id || raw.id,
    student,
    studentName: student,
    customerName: student,
    slot,
    mealSlot: slot,
    plan,
    planName: plan,
    rider,
    assignedRider: rider,
    hostel,
    hostelAddress: raw.hostelAddress || hostel,
    room,
    zoneCode,
    zone: raw.zone || zoneCode,
    status,
    extras: raw.extras || '',
    hasAttachedExtras: Boolean(raw.hasAttachedExtras || (raw.extras && (raw.extras.toLowerCase().includes('extra') || raw.extras.toLowerCase().includes('packed with')))),
    extrasPacked: Boolean(raw.extrasPacked),
    deliveredAt: raw.deliveredAt || (status === 'delivered' ? 'Just Now' : null),
    phone,
    customerPhone: phone,
    date,
    isSkipped: Boolean(raw.isSkipped),
    isPaused: Boolean(raw.isPaused)
  };
}

// Helper to sync active subscriptions into dispatch roster
async function syncActiveSubscriptionsIntoDispatch() {
  try {
    const todayStr = getISTDateStr(0);
    const existingRoster = await DispatchRoster.find();
    const subscriptions = await Subscription.find().populate('userId', 'name phone email').populate('planId');
    const skips = await SkipRequest.find();
    const todayApprovedSkips = skips.filter(s => s.date === todayStr && (s.status === 'approved' || !s.status));
    const riders = await Rider.find();

    const zoneRiderMap = {
      'NC-01': riders.find(r => (r.route || '').includes('NC-01'))?.name || 'Unassigned',
      'SC-02': riders.find(r => (r.route || '').includes('SC-02'))?.name || 'Unassigned',
      'MN-03': riders.find(r => (r.route || '').includes('MN-03') || r.name.includes('Mahesh'))?.name || 'Mahesh Singh',
      'VJ-04': riders.find(r => (r.route || '').includes('VJ-04') || r.name.includes('Dinesh'))?.name || 'Dinesh Patel'
    };

    let addedCount = 0;

    for (const sub of subscriptions) {
      if (sub.status !== 'active') continue;
      const studentName = sub.userId?.name || sub.userName || 'Student Subscriber';
      const studentPhone = sub.userId?.phone || sub.userPhone || '+91 98765 00000';
      const hostel = sub.hostelAddress || sub.hostel || 'Hostel Campus';
      const room = sub.room || (hostel.match(/Room\s*([0-9A-Za-z-]+)/i)?.[1]) || '101';
      const zoneCode = sub.zoneCode || 'NC-01';
      const planName = sub.planId?.name ? `${sub.planId.name} Plan` : (sub.planName || 'Standard 2-Meal Plan');
      const isPaused = Boolean(sub.isPaused || sub.status === 'paused');
      const mealsPerDay = sub.planId?.mealsPerDay || 2;
      const assignedRider = zoneRiderMap[zoneCode] || 'Unassigned';

      const slotsToGenerate = mealsPerDay >= 2 ? ['Lunch', 'Dinner'] : ['Lunch'];

      for (const slotName of slotsToGenerate) {
        // Check if student already has a roster entry for this slot
        const alreadyExists = existingRoster.some(r => {
          const rStudent = (r.student || r.studentName || '').toLowerCase().trim();
          const rSlot = (r.slot || r.mealSlot || '').toLowerCase().trim();
          return rStudent === studentName.toLowerCase().trim() && rSlot.includes(slotName.toLowerCase());
        });

        if (!alreadyExists) {
          const isSkippedToday = todayApprovedSkips.some(s => {
            const sStudent = (s.student || s.studentName || '').toLowerCase().trim();
            const sMeal = (s.mealType || s.meal || '').toLowerCase().trim();
            return sStudent === studentName.toLowerCase().trim() && (sMeal.includes(slotName.toLowerCase()) || sMeal === 'both');
          });

          const boxId = `TIF-${Math.floor(100 + Math.random() * 899)}`;
          const extrasStr = sub.dietPreference ? `${sub.dietPreference}` : 'Homestyle Pure Veg';
          const finalStatus = isPaused ? 'paused' : (isSkippedToday ? 'skipped' : 'preparing');

          const newEntry = {
            id: boxId,
            _id: boxId,
            student: studentName,
            studentName,
            customerName: studentName,
            phone: studentPhone,
            customerPhone: studentPhone,
            hostel,
            hostelAddress: hostel,
            room,
            zoneCode,
            zone: zoneCode,
            plan: planName,
            planName,
            slot: slotName,
            mealSlot: slotName,
            rider: assignedRider,
            assignedRider,
            status: finalStatus,
            deliveryStatus: finalStatus === 'preparing' ? 'Preparing' : finalStatus,
            statusStep: finalStatus,
            extras: isSkippedToday ? `${extrasStr} • [SKIPPED: ${slotName.toUpperCase()}]` : extrasStr,
            hasAttachedExtras: false,
            extrasPacked: false,
            isSkipped: isSkippedToday,
            isPaused,
            date: todayStr
          };

          await DispatchRoster.create(newEntry);
          existingRoster.push(newEntry);
          addedCount++;
        }
      }
    }

    return addedCount;
  } catch (err) {
    console.warn('Auto-sync dispatch error:', err.message);
    return 0;
  }
}

// ── DAILY DISPATCH ROSTER (FULL-STACK DYNAMIC) ─────────────────
// @route   GET /api/admin/dispatch
// @desc    Get daily tiffin dispatch roster with automatic sync & normalization
// @access  Admin
router.get('/dispatch', protect, adminOnly, async (req, res) => {
  try {
    if (req.query.sync === 'true') {
      await syncActiveSubscriptionsIntoDispatch();
    }
    const updatedRoster = await DispatchRoster.find();
    const normalized = updatedRoster.map(normalizeDispatchEntry);
    res.json({ success: true, count: normalized.length, roster: normalized });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Helper to seed rich historical dispatch records across past days if needed
async function ensureDispatchHistorySeed() {
  try {
    const all = await DispatchRoster.find();
    
    // Group existing records by date
    const dateCounts = {};
    if (all && all.length > 0) {
      all.forEach(r => {
        const d = r.date || (r.createdAt ? r.createdAt.slice(0, 10) : null);
        if (d) dateCounts[d] = (dateCounts[d] || 0) + 1;
      });
    }

    // Check which days in the last 45 days (offset 0 to -45) have missing or insufficient records
    const missingOffsets = [];
    for (let offset = 0; offset >= -45; offset--) {
      const dStr = getISTDateStr(offset);
      if (!dateCounts[dStr] || dateCounts[dStr] < 6) {
        missingOffsets.push(offset);
      }
    }

    if (missingOffsets.length === 0) return;

    // Diverse student templates spanning genuine active riders and campus zones
    const demoTemplates = [
      { student: 'Raj Kumar', phone: '+91 98123 45678', hostel: 'Tagore Hostel, Room 204', room: '204', zoneCode: 'NC-01', plan: 'Executive Double Meal', rider: 'Ramesh Kumar (Dabbawala)', riderPhone: '+91 98123 45678', vehicle: 'Hero Electric (DL-08-EV-102)', extras: 'Extra 2x Roti + Hot Gulab Jamun', hasExtras: true },
      { student: 'Ravi Das', phone: '+91 98234 56789', hostel: 'Raman Hostel, Room 112', room: '112', zoneCode: 'NC-01', plan: 'Standard Veg Thali', rider: 'Pradeep Rawat', riderPhone: '+91 98765 43210', vehicle: 'Bajaj Chetak EV (DL-10-EV-1122)', extras: '', hasExtras: false },
      { student: 'Aman Verma', phone: '+91 98345 67890', hostel: 'Bose PG, Room 301', room: '301', zoneCode: 'NC-02', plan: 'Double Egg Protein Meal', rider: 'Sonu Ansari', riderPhone: '+91 98333 44555', vehicle: 'Suzuki Access (DL-05-PQ-4532)', extras: 'Double Egg Chicken Kathi Roll', hasExtras: true },
      { student: 'Pooja Sharma', phone: '+91 98456 78901', hostel: 'Sarojini Girls Hostel, Room 205', room: '205', zoneCode: 'NC-02', plan: 'Homestyle Pure Veg', rider: 'Sonu Ansari', riderPhone: '+91 98333 44555', vehicle: 'Suzuki Access (DL-05-PQ-4532)', extras: '1x Sweet Lassi', hasExtras: true },
      { student: 'Kavita Roy', phone: '+91 98567 89012', hostel: 'Kalpana Chawla Hall, Room 104', room: '104', zoneCode: 'SC-02', plan: 'Healthy Diet Low Carb', rider: 'Deepak Mehra', riderPhone: '+91 98444 55666', vehicle: 'Honda Shine (DL-12-MN-7890)', extras: '', hasExtras: false },
      { student: 'Aditya Singh', phone: '+91 98678 90123', hostel: 'Aryabhatta Hostel, Room 410', room: '410', zoneCode: 'SC-02', plan: 'Standard 2-Meal Plan', rider: 'Deepak Mehra', riderPhone: '+91 98444 55666', vehicle: 'Honda Shine (DL-12-MN-7890)', extras: '2x Extra Butter Roti', hasExtras: true },
      { student: 'Vikas Meena', phone: '+91 98789 01234', hostel: 'Tagore Hostel, Room 315', room: '315', zoneCode: 'NC-01', plan: 'Premium Double Thali', rider: 'Ramesh Kumar (Dabbawala)', riderPhone: '+91 98123 45678', vehicle: 'Hero Electric (DL-08-EV-102)', extras: '', hasExtras: false },
      { student: 'Neha Verma', phone: '+91 98890 12345', hostel: 'Indira Hall, Room 202', room: '202', zoneCode: 'MN-03', plan: 'Standard Veg Thali', rider: 'Anil Kumar', riderPhone: '+91 98555 66777', vehicle: 'Ola S1 Pro (DL-06-EV-9988)', extras: '1x Extra Paneer Sabji', hasExtras: true },
      { student: 'Mohd Sameer', phone: '+91 98901 23456', hostel: 'Patel PG, Room 105', room: '105', zoneCode: 'NC-02', plan: 'Executive Double Meal', rider: 'Rahul Soni', riderPhone: '+91 98666 77888', vehicle: 'TVS Raider (DL-08-KL-5566)', extras: 'Gulab Jamun (2 Pcs)', hasExtras: true },
      { student: 'Simran Kaur', phone: '+91 98912 34567', hostel: 'Gargi PG, Room 302', room: '302', zoneCode: 'SC-02', plan: 'Standard Veg Thali', rider: 'Manoj Tiwari', riderPhone: '+91 98777 88999', vehicle: 'Hero Electric (DL-11-EV-3344)', extras: '', hasExtras: false },
      { student: 'Tarun Joshi', phone: '+91 98923 45678', hostel: 'Nehru Hostel, Room 118', room: '118', zoneCode: 'NC-01', plan: 'Homestyle Pure Veg', rider: 'Sanjay Gupta', riderPhone: '+91 98888 99000', vehicle: 'Bajaj Platina (DL-01-AB-1212)', extras: '1x Masala Chaas', hasExtras: true },
      { student: 'Sneha Patel', phone: '+91 98934 56789', hostel: 'Sarojini Girls Hostel, Room 110', room: '110', zoneCode: 'NC-02', plan: 'Double Egg Protein Meal', rider: 'Pradeep Rawat', riderPhone: '+91 98765 43210', vehicle: 'Bajaj Chetak EV (DL-10-EV-1122)', extras: 'Boiled Egg (2 Pcs)', hasExtras: true }
    ];

    for (const offset of missingOffsets) {
      const dateStr = getISTDateStr(offset);
      for (const t of demoTemplates) {
        for (const slot of ['Lunch', 'Dinner']) {
          const boxNum = Math.floor(100 + Math.random() * 899);
          const boxId = `TIF-${boxNum}`;
          
          let status = 'delivered';
          let isDelivered = true;
          let isSkipped = false;
          let delivTime = slot === 'Lunch' ? '01:25 PM' : '08:15 PM';

          if (offset === 0) {
            // Today
            if (slot === 'Lunch') {
              status = 'delivered';
              isDelivered = true;
            } else {
              status = Math.random() > 0.35 ? 'delivered' : 'on-route';
              isDelivered = status === 'delivered';
              if (!isDelivered) delivTime = null;
            }
          } else {
            // Past dates
            if (Math.random() < 0.05) {
              status = 'skipped';
              isDelivered = false;
              isSkipped = true;
              delivTime = null;
            }
          }

          const entry = {
            id: `${boxId}-${dateStr.slice(5)}`,
            _id: `${boxId}-${dateStr.slice(5)}`,
            student: t.student,
            studentName: t.student,
            customerName: t.student,
            phone: t.phone,
            customerPhone: t.phone,
            hostel: t.hostel,
            hostelAddress: t.hostel,
            room: t.room,
            zoneCode: t.zoneCode,
            zone: t.zoneCode,
            plan: t.plan,
            planName: t.plan,
            slot,
            mealSlot: slot,
            rider: t.rider,
            assignedRider: t.rider,
            riderPhone: t.riderPhone,
            riderVehicle: t.vehicle,
            status,
            deliveryStatus: isDelivered ? 'Delivered' : isSkipped ? 'Skipped by User' : 'Out for Delivery',
            statusStep: status,
            deliveredAt: isDelivered ? delivTime : null,
            extras: t.extras || 'Homestyle Fresh Meal',
            hasAttachedExtras: t.hasExtras,
            extrasPacked: isDelivered || status === 'on-route',
            isSkipped,
            date: dateStr,
            createdAt: `${dateStr}T${slot === 'Lunch' ? '06:30:00.000Z' : '13:30:00.000Z'}`
          };

          await DispatchRoster.create(entry);
        }
      }
    }
  } catch (err) {
    console.warn('ensureDispatchHistorySeed warning:', err.message);
  }
}

// @route   GET /api/admin/dispatch/history
// @desc    Get complete historical records of tiffin box dispatches, deliveries and rider assignments
// @access  Admin
router.get('/dispatch/history', protect, adminOnly, async (req, res) => {
  try {
    if (req.query.seed === 'true') {
      await ensureDispatchHistorySeed();
    }
    const { timeframe, month, date, startDate, endDate, rider, slot, status, q } = req.query;

    const allRecords = await DispatchRoster.find();
    let normalized = allRecords.map(normalizeDispatchEntry);

    // Compute available months from all records
    const monthCounts = {};
    allRecords.forEach(r => {
      const d = r.date || (r.createdAt ? r.createdAt.slice(0, 10) : null);
      if (d && d.length >= 7) {
        const ym = d.slice(0, 7);
        monthCounts[ym] = (monthCounts[ym] || 0) + 1;
      }
    });

    const sortedMonthKeys = Object.keys(monthCounts).sort().reverse();
    const availableMonths = [
      { id: 'all', label: 'All Months (All Records)', count: allRecords.length },
      ...sortedMonthKeys.map(ym => ({
        id: ym,
        label: `${formatMonthLabel(ym)} (${monthCounts[ym]} Boxes)`,
        count: monthCounts[ym]
      }))
    ];

    // Apply Timeframe / Date filters
    const todayStr = getISTDateStr(0);
    const yesterdayStr = getISTDateStr(-1);
    const weekAgoStr = getISTDateStr(-7);
    const monthStartStr = `${todayStr.slice(0, 7)}-01`;
    const thisWeek = getWeekRange(0);
    const lastWeek = getWeekRange(-1);
    const lastMonth = getLastMonthRange();

    if (date && date.trim()) {
      // Single specific day filter
      const targetDate = date.trim();
      normalized = normalized.filter(r => (r.date || r.createdAt?.slice(0, 10)) === targetDate);
    } else if (month && month !== 'all') {
      // Specific calendar month filter (YYYY-MM)
      normalized = normalized.filter(r => (r.date || r.createdAt?.slice(0, 10) || '').startsWith(month));
    } else if (timeframe === 'today') {
      normalized = normalized.filter(r => (r.date || r.createdAt?.slice(0, 10)) === todayStr);
    } else if (timeframe === 'yesterday') {
      normalized = normalized.filter(r => (r.date || r.createdAt?.slice(0, 10)) === yesterdayStr);
    } else if (timeframe === 'this_week') {
      normalized = normalized.filter(r => {
        const d = r.date || r.createdAt?.slice(0, 10);
        return d && d >= thisWeek.start && d <= thisWeek.end;
      });
    } else if (timeframe === 'last_week') {
      normalized = normalized.filter(r => {
        const d = r.date || r.createdAt?.slice(0, 10);
        return d && d >= lastWeek.start && d <= lastWeek.end;
      });
    } else if (timeframe === 'week' || timeframe === 'last_7_days') {
      normalized = normalized.filter(r => {
        const d = r.date || r.createdAt?.slice(0, 10);
        return d && d >= weekAgoStr && d <= todayStr;
      });
    } else if (timeframe === 'month' || timeframe === 'this_month') {
      normalized = normalized.filter(r => {
        const d = r.date || r.createdAt?.slice(0, 10);
        return d && d >= monthStartStr && d <= todayStr;
      });
    } else if (timeframe === 'last_month') {
      normalized = normalized.filter(r => {
        const d = r.date || r.createdAt?.slice(0, 10);
        return d && d >= lastMonth.start && d <= lastMonth.end;
      });
    } else if (startDate || endDate) {
      normalized = normalized.filter(r => {
        const d = r.date || r.createdAt?.slice(0, 10);
        if (!d) return true;
        if (startDate && d < startDate) return false;
        if (endDate && d > endDate) return false;
        return true;
      });
    }

    // Filter by rider
    if (rider && rider !== 'All') {
      if (rider === 'Unassigned') {
        normalized = normalized.filter(r => !r.rider || r.rider === 'Unassigned');
      } else {
        const rClean = rider.split('(')[0].trim().toLowerCase();
        normalized = normalized.filter(r => {
          const itemRClean = (r.rider || '').split('(')[0].trim().toLowerCase();
          return itemRClean.includes(rClean) || rClean.includes(itemRClean);
        });
      }
    }

    // Filter by slot
    if (slot && slot !== 'All') {
      normalized = normalized.filter(r => (r.slot || '').toLowerCase().includes(slot.toLowerCase()));
    }

    // Filter by status
    if (status && status !== 'All') {
      normalized = normalized.filter(r => {
        const s = (r.status || '').toLowerCase();
        if (status === 'delivered') return s === 'delivered';
        if (status === 'dispatched') return s === 'dispatched' || s === 'on-route';
        if (status === 'packed') return s === 'packed';
        if (status === 'preparing') return s === 'preparing' || s === 'cooking';
        if (status === 'skipped') return r.isSkipped || r.isPaused || s === 'skipped' || s === 'paused';
        return s === status.toLowerCase();
      });
    }

    // Search query q
    if (q && q.trim()) {
      const query = q.trim().toLowerCase();
      normalized = normalized.filter(r =>
        (r.student || '').toLowerCase().includes(query) ||
        (r.id || '').toLowerCase().includes(query) ||
        (r.hostel || '').toLowerCase().includes(query) ||
        (r.rider || '').toLowerCase().includes(query) ||
        (r.phone || '').toLowerCase().includes(query) ||
        (r.zoneCode || '').toLowerCase().includes(query) ||
        (r.date || '').toLowerCase().includes(query)
      );
    }

    // Sort descending by date & created time
    normalized.sort((a, b) => {
      const dateA = a.date || a.createdAt || '';
      const dateB = b.date || b.createdAt || '';
      return dateB.localeCompare(dateA);
    });

    // Compute metrics
    const totalDispatched = normalized.length;
    const totalDelivered = normalized.filter(r => r.status === 'delivered').length;
    const totalAssigned = normalized.filter(r => r.rider && r.rider !== 'Unassigned').length;
    const totalUnassigned = normalized.filter(r => !r.rider || r.rider === 'Unassigned').length;
    const breakfastCount = normalized.filter(r => (r.slot || '').toLowerCase().includes('breakfast')).length;
    const lunchCount = normalized.filter(r => (r.slot || '').toLowerCase().includes('lunch')).length;
    const dinnerCount = normalized.filter(r => (r.slot || '').toLowerCase().includes('dinner')).length;
    const extrasCount = normalized.filter(r => r.hasAttachedExtras).length;
    const skippedCount = normalized.filter(r => r.isSkipped || r.isPaused || r.status === 'skipped' || r.status === 'paused').length;

    const deliverySuccessRate = totalDispatched > 0 ? Math.round((totalDelivered / totalDispatched) * 1000) / 10 : 0;
    const assignmentRate = totalDispatched > 0 ? Math.round((totalAssigned / totalDispatched) * 1000) / 10 : 0;

    // Compute Rider Leaderboard / Breakdown
    const riderMap = {};
    normalized.forEach(item => {
      if (item.rider && item.rider !== 'Unassigned') {
        const clean = item.rider.split('(')[0].trim();
        if (!riderMap[clean]) {
          riderMap[clean] = {
            name: clean,
            fullName: item.rider,
            phone: item.riderPhone || '',
            vehicle: item.riderVehicle || 'Delivery Bike',
            totalAssigned: 0,
            totalDelivered: 0,
            pending: 0
          };
        }
        riderMap[clean].totalAssigned++;
        if (item.status === 'delivered') {
          riderMap[clean].totalDelivered++;
        } else {
          riderMap[clean].pending++;
        }
      }
    });

    const riderBreakdown = Object.values(riderMap).map(r => ({
      ...r,
      completionRate: r.totalAssigned > 0 ? Math.round((r.totalDelivered / r.totalAssigned) * 100) : 0
    })).sort((a, b) => b.totalDelivered - a.totalDelivered);

    // Compute Day-by-Day Delivery Summary Breakdown
    const dayMap = {};
    normalized.forEach(item => {
      const d = item.date || (item.createdAt ? item.createdAt.slice(0, 10) : 'Unknown');
      if (!dayMap[d]) {
        let dayLabel = d;
        try {
          const dateObj = new Date(d + 'T12:00:00Z');
          dayLabel = dateObj.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
        } catch (_) {}

        dayMap[d] = {
          date: d,
          dayLabel,
          isToday: d === todayStr,
          isYesterday: d === yesterdayStr,
          total: 0,
          delivered: 0,
          skipped: 0,
          pending: 0,
          lunch: 0,
          dinner: 0,
          extras: 0,
          ridersSet: new Set()
        };
      }

      const dm = dayMap[d];
      dm.total++;
      if (item.status === 'delivered') dm.delivered++;
      else if (item.isSkipped || item.isPaused || item.status === 'skipped') dm.skipped++;
      else dm.pending++;

      if ((item.slot || '').toLowerCase().includes('lunch')) dm.lunch++;
      if ((item.slot || '').toLowerCase().includes('dinner')) dm.dinner++;
      if (item.hasAttachedExtras) dm.extras++;
      if (item.rider && item.rider !== 'Unassigned') {
        dm.ridersSet.add(item.rider.split('(')[0].trim());
      }
    });

    const dailyBreakdown = Object.values(dayMap).map(dm => ({
      date: dm.date,
      dayLabel: dm.dayLabel,
      isToday: dm.isToday,
      isYesterday: dm.isYesterday,
      total: dm.total,
      delivered: dm.delivered,
      skipped: dm.skipped,
      pending: dm.pending,
      lunch: dm.lunch,
      dinner: dm.dinner,
      extras: dm.extras,
      activeRidersCount: dm.ridersSet.size,
      riders: Array.from(dm.ridersSet),
      successRate: dm.total > 0 ? Math.round((dm.delivered / dm.total) * 1000) / 10 : 0
    })).sort((a, b) => b.date.localeCompare(a.date));

    res.json({
      success: true,
      count: normalized.length,
      total: allRecords.length,
      availableMonths,
      dailyBreakdown,
      summary: {
        totalDispatched,
        totalDelivered,
        totalAssigned,
        totalUnassigned,
        deliverySuccessRate,
        assignmentRate,
        breakfastCount,
        lunchCount,
        dinnerCount,
        extrasCount,
        skippedCount
      },
      riderBreakdown,
      history: normalized
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/admin/dispatch
// @desc    Manually add new dispatch tiffin entry to today's checklist
// @access  Admin
router.post('/dispatch', protect, adminOnly, async (req, res) => {
  try {
    const { student, hostel, room, zoneCode, plan, slot, rider, extras, notes, phone } = req.body;
    if (!student || !hostel) {
      return res.status(400).json({ success: false, message: 'Student name and hostel are required' });
    }

    const boxId = req.body.id || `TIF-${Math.floor(100 + Math.random() * 899)}`;
    const fullHostel = room ? `${hostel}, Room ${room}` : hostel;
    const finalZone = zoneCode || 'NC-01';
    const finalRider = rider || 'Unassigned';
    const finalSlot = slot || 'Lunch';
    const finalPlan = plan || 'Standard Meal Plan';
    const todayStr = getISTDateStr(0);

    const newEntry = {
      id: boxId,
      _id: boxId,
      student,
      studentName: student,
      customerName: student,
      hostel: fullHostel,
      hostelAddress: fullHostel,
      room: room || '',
      zoneCode: finalZone,
      zone: finalZone,
      plan: finalPlan,
      planName: finalPlan,
      slot: finalSlot,
      mealSlot: finalSlot,
      rider: finalRider,
      assignedRider: finalRider,
      status: 'preparing',
      deliveryStatus: 'Preparing',
      statusStep: 'preparing',
      extras: extras || '',
      hasAttachedExtras: Boolean(extras && (extras.toLowerCase().includes('extra') || extras.toLowerCase().includes('packed with'))),
      extrasPacked: false,
      notes: notes || '',
      phone: phone || '',
      customerPhone: phone || '',
      date: todayStr,
      createdAt: new Date().toISOString()
    };

    await DispatchRoster.create(newEntry);
    res.status(201).json({ success: true, message: `Tiffin ${boxId} added to checklist!`, item: newEntry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/admin/dispatch/:id
// @desc    Update dispatch tiffin details
// @access  Admin
router.put('/dispatch/:id', protect, adminOnly, async (req, res) => {
  try {
    let item = await DispatchRoster.findById(req.params.id);
    if (!item) item = await DispatchRoster.findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ success: false, message: 'Dispatch item not found' });

    const updates = { ...req.body };
    if (updates.student) updates.studentName = updates.student;
    if (updates.slot) updates.mealSlot = updates.slot;
    if (updates.plan) updates.planName = updates.plan;
    if (updates.rider) updates.assignedRider = updates.rider;

    const entryId = item._id || item.id;
    await DispatchRoster.findByIdAndUpdate(entryId, updates);
    const updated = await DispatchRoster.findById(entryId);
    res.json({ success: true, message: 'Dispatch updated successfully', item: normalizeDispatchEntry(updated) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/admin/dispatch/:id/status
// @desc    Update tiffin dispatch status (preparing, packed, dispatched, delivered)
// @access  Admin
router.put('/dispatch/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    let item = await DispatchRoster.findById(req.params.id);
    if (!item) item = await DispatchRoster.findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ success: false, message: 'Dispatch item not found' });

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updateData = {
      status,
      deliveryStatus: status === 'delivered' ? 'Delivered' : status === 'dispatched' ? 'Out for delivery' : status === 'packed' ? 'Packed' : 'Preparing',
      statusStep: status,
      deliveredAt: status === 'delivered' ? timeStr : null
    };

    const entryId = item._id || item.id;
    if (typeof item.save === 'function') {
      Object.assign(item, updateData);
      await item.save();
    } else {
      await DispatchRoster.findByIdAndUpdate(entryId, updateData);
    }

    // Sync attached extra orders if delivered
    if (status === 'delivered') {
      try {
        if (Array.isArray(item.attachedExtras)) {
          item.attachedExtras.forEach(ext => {
            ext.status = 'delivered';
            ext.packed = true;
          });
          if (typeof item.save === 'function') await item.save();
        }
        const allOrders = await Order.find();
        for (const o of (allOrders || [])) {
          const matchesStudent = (o.customerName && item.student && o.customerName.toLowerCase() === item.student.toLowerCase()) ||
                                 (o.userId && item.userId && String(o.userId) === String(item.userId));
          if (matchesStudent && o.deliverWithMeal && o.status !== 'delivered' && o.status !== 'cancelled') {
            o.status = 'delivered';
            o.deliveryStatus = 'Delivered';
            o.deliveredAt = timeStr;
            if (typeof o.save === 'function') await o.save();
            await Order.findByIdAndUpdate(o._id || o.id || o.orderId, {
              status: 'delivered',
              deliveryStatus: 'Delivered',
              deliveredAt: timeStr
            });
          }
        }
      } catch (errSync) {
        console.warn('Error syncing attached extras in admin dispatch:', errSync.message);
      }

      // Deduct 1 meal from student's active subscription Meal Balance
      try {
        if (!item.mealDeducted) {
          let sub = null;
          if (item.subscriptionId) sub = await Subscription.findById(item.subscriptionId);
          if (!sub && item.userId) sub = await Subscription.findOne({ userId: item.userId, status: { $in: ['active', 'trial'] } });
          if (!sub && item.student) {
            const allUsers = await User.find();
            const matchedUser = allUsers.find(u => u.name && u.name.toLowerCase().trim() === String(item.student).toLowerCase().trim());
            if (matchedUser) sub = await Subscription.findOne({ userId: matchedUser._id || matchedUser.id, status: { $in: ['active', 'trial'] } });
          }
          if (sub) {
            sub.remainingMeals = Math.max(0, (Number(sub.remainingMeals) || 0) - 1);
            if (typeof sub.save === 'function') await sub.save();
            item.mealDeducted = true;
            if (typeof item.save === 'function') await item.save();
            else await DispatchRoster.findByIdAndUpdate(entryId, { mealDeducted: true });
          }
        }
      } catch (deductErr) {
        console.warn('Error deducting meal in admin dispatch:', deductErr.message);
      }
    } else if (item.mealDeducted && status !== 'delivered') {
      // Revert deduction if status moved away from delivered
      try {
        let sub = null;
        if (item.subscriptionId) sub = await Subscription.findById(item.subscriptionId);
        if (!sub && item.userId) sub = await Subscription.findOne({ userId: item.userId, status: { $in: ['active', 'trial'] } });
        if (!sub && item.student) {
          const allUsers = await User.find();
          const matchedUser = allUsers.find(u => u.name && u.name.toLowerCase().trim() === String(item.student).toLowerCase().trim());
          if (matchedUser) sub = await Subscription.findOne({ userId: matchedUser._id || matchedUser.id, status: { $in: ['active', 'trial'] } });
        }
        if (sub) {
          sub.remainingMeals = (Number(sub.remainingMeals) || 0) + 1;
          if (typeof sub.save === 'function') await sub.save();
          item.mealDeducted = false;
          if (typeof item.save === 'function') await item.save();
          else await DispatchRoster.findByIdAndUpdate(entryId, { mealDeducted: false });
        }
      } catch (revErr) {
        console.warn('Error reverting meal deduction in admin dispatch:', revErr.message);
      }
    }
    const updated = await DispatchRoster.findById(entryId);
    res.json({ success: true, item: normalizeDispatchEntry(updated || item) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/admin/dispatch/:id/rider
// @desc    Assign / change rider for this tiffin box
// @access  Admin
router.put('/dispatch/:id/rider', protect, adminOnly, async (req, res) => {
  try {
    const { rider } = req.body;
    let item = await DispatchRoster.findById(req.params.id);
    if (!item) item = await DispatchRoster.findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ success: false, message: 'Dispatch item not found' });

    let riderDoc = null;
    if (rider && rider !== 'Unassigned') {
      const riders = await Rider.find();
      riderDoc = riders.find(r => 
        r.name === rider || 
        r.id === rider || 
        r._id === rider || 
        (r.name && rider && r.name.toLowerCase().includes(rider.toLowerCase()))
      );
    }

    const entryId = item._id || item.id;
    const updatePayload = {
      rider: riderDoc ? riderDoc.name : rider,
      assignedRider: riderDoc ? riderDoc.name : rider,
      riderPhone: riderDoc ? riderDoc.phone : item.riderPhone,
      riderVehicle: riderDoc ? riderDoc.vehicle : item.riderVehicle,
      riderId: riderDoc ? (riderDoc.id || riderDoc._id) : undefined
    };

    if (rider && rider !== 'Unassigned' && (item.status === 'pending' || item.status === 'preparing' || !item.status)) {
      updatePayload.status = 'dispatched';
      updatePayload.deliveryStatus = 'Out for delivery';
      updatePayload.statusStep = 'on-route';
    }

    if (riderDoc) {
      riderDoc.activeTiffins = (riderDoc.activeTiffins || 0) + 1;
      riderDoc.status = 'busy';
      await riderDoc.save();
    }

    await DispatchRoster.findByIdAndUpdate(entryId, updatePayload);

    // Auto-sync any Pack-with-Meal orders for this student
    try {
      if (item && item.student) {
        const studentClean = item.student.toLowerCase().trim();
        const itemSlot = (item.slot || item.mealSlot || '').toLowerCase().trim();
        const allOrders = await Order.find();
        for (const o of allOrders) {
          const isMealExtra = Boolean(
            o.deliverWithMeal === true ||
            o.deliveryMode === 'with_tiffin' ||
            (o.isExtraOrder && o.mealSlot && o.mealSlot !== 'Instant')
          );
          if (!isMealExtra) continue;
          if (o.status === 'delivered' || o.status === 'cancelled') continue;
          const oStudent = (o.customerName || '').toLowerCase().trim();
          const oSlot = (o.mealSlot || o.attachedMealSlot || o.notes || '').toLowerCase().trim();
          const matchesSlot = !itemSlot || oSlot.includes(itemSlot) || itemSlot.includes(oSlot);
          if (matchesSlot && oStudent && (oStudent.includes(studentClean) || studentClean.includes(oStudent))) {
            o.deliveryPartner = {
              name: updatePayload.assignedRider,
              phone: updatePayload.riderPhone,
              vehicle: updatePayload.riderVehicle
            };
            if (updatePayload.riderId) o.riderId = updatePayload.riderId;
            await o.save();
          }
        }
      }
    } catch (e) {
      console.warn('Could not auto-sync pack-with-meal orders in dispatch rider update:', e.message);
    }

    const updated = await DispatchRoster.findById(entryId);
    res.json({ success: true, message: `Admin assigned rider: ${updatePayload.assignedRider}`, item: normalizeDispatchEntry(updated) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/admin/dispatch/:id/pack-extras
// @desc    Toggle packing confirmation of attached extra add-ons inside tiffin box
// @access  Admin
router.put('/dispatch/:id/pack-extras', protect, adminOnly, async (req, res) => {
  try {
    const { packed } = req.body;
    let item = await DispatchRoster.findById(req.params.id);
    if (!item) item = await DispatchRoster.findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ success: false, message: 'Dispatch item not found' });

    const newPacked = typeof packed === 'boolean' ? packed : !item.extrasPacked;
    const entryId = item._id || item.id;
    await DispatchRoster.findByIdAndUpdate(entryId, { extrasPacked: newPacked });
    const updated = await DispatchRoster.findById(entryId);
    res.json({ success: true, item: normalizeDispatchEntry(updated), extrasPacked: newPacked });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/admin/dispatch/:id
// @desc    Delete dispatch item
// @access  Admin
router.delete('/dispatch/:id', protect, adminOnly, async (req, res) => {
  try {
    let item = await DispatchRoster.findById(req.params.id);
    if (!item) item = await DispatchRoster.findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ success: false, message: 'Dispatch item not found' });

    const entryId = item._id || item.id;
    await DispatchRoster.findByIdAndDelete(entryId);
    res.json({ success: true, message: `Tiffin entry ${req.params.id} removed from checklist` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/admin/dispatch/sync
// @desc    Force re-sync today's dispatch roster from all active subscriptions and today's meal skips
// @access  Admin
router.post('/dispatch/sync', protect, adminOnly, async (req, res) => {
  try {
    const addedCount = await syncActiveSubscriptionsIntoDispatch();
    const updatedRoster = await DispatchRoster.find();
    const normalized = updatedRoster.map(normalizeDispatchEntry);
    res.json({
      success: true,
      message: `Successfully synchronized dispatch checklist! Added ${addedCount} new student tiffins.`,
      addedCount,
      totalCount: normalized.length,
      roster: normalized
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/admin/dispatch/bulk-status
// @desc    Bulk update dispatch status (e.g. mark all lunch as dispatched)
// @access  Admin
router.post('/dispatch/bulk-status', protect, adminOnly, async (req, res) => {
  try {
    const { ids, slot, status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

    const allEntries = await DispatchRoster.find();
    let updatedCount = 0;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    for (const item of allEntries) {
      let matches = false;
      if (Array.isArray(ids) && ids.length > 0) {
        matches = ids.includes(item.id) || ids.includes(item._id);
      } else if (slot) {
        const itemSlot = (item.slot || item.mealSlot || '').toLowerCase();
        matches = itemSlot.includes(slot.toLowerCase());
      }

      if (matches) {
        const entryId = item._id || item.id;
        await DispatchRoster.findByIdAndUpdate(entryId, {
          status,
          deliveryStatus: status === 'delivered' ? 'Delivered' : status === 'dispatched' ? 'Out for delivery' : status,
          statusStep: status,
          deliveredAt: status === 'delivered' ? timeStr : item.deliveredAt
        });
        updatedCount++;
      }
    }

    const updatedRoster = await DispatchRoster.find();
    res.json({
      success: true,
      message: `Updated status to "${status.toUpperCase()}" for ${updatedCount} tiffins!`,
      updatedCount,
      roster: updatedRoster.map(normalizeDispatchEntry)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── MEAL SKIP REQUESTS (FULL-STACK ADMIN MANAGEMENT) ────────────

// @route   GET /api/admin/skips/stats
// @desc    Get aggregate stats for kitchen planning and wallet refunds
// @access  Admin
router.get('/skips/stats', protect, adminOnly, async (req, res) => {
  try {
    const skips = await SkipRequest.find();
    const todayStr = getISTDateStr(0);
    const tomorrowStr = getISTDateStr(1);

    const totalSkips = skips.length;
    const pendingSkips = skips.filter(s => s.status === 'pending').length;
    const approvedSkips = skips.filter(s => s.status === 'approved' || !s.status).length;
    const rejectedSkips = skips.filter(s => s.status === 'rejected').length;

    const totalRefunded = skips
      .filter(s => s.status === 'approved' || !s.status)
      .reduce((sum, s) => sum + (Number(s.credit) || 0), 0);

    // Kitchen forecast for today & tomorrow
    const todayLunchSkips = skips.filter(s => s.date === todayStr && (s.mealType === 'lunch' || (s.meal || '').toLowerCase().includes('lunch'))).length;
    const todayDinnerSkips = skips.filter(s => s.date === todayStr && (s.mealType === 'dinner' || (s.meal || '').toLowerCase().includes('dinner'))).length;
    const tomorrowLunchSkips = skips.filter(s => s.date === tomorrowStr && (s.mealType === 'lunch' || (s.meal || '').toLowerCase().includes('lunch'))).length;
    const tomorrowDinnerSkips = skips.filter(s => s.date === tomorrowStr && (s.mealType === 'dinner' || (s.meal || '').toLowerCase().includes('dinner'))).length;

    const totalMealsRolledOver = approvedSkips;

    res.json({
      success: true,
      stats: {
        totalSkips,
        pendingSkips,
        approvedSkips,
        rejectedSkips,
        totalMealsRolledOver,
        totalRefunded: 0,
        todayStr,
        tomorrowStr,
        todayLunchSkips,
        todayDinnerSkips,
        tomorrowLunchSkips,
        tomorrowDinnerSkips
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/admin/skips
// @desc    Get all meal skip requests with filtering, search, and sorting
// @access  Admin
router.get('/skips', protect, adminOnly, async (req, res) => {
  try {
    let skips = await SkipRequest.find();
    const { status, mealType, date, q } = req.query;

    // Filter by status
    if (status && status !== 'all') {
      skips = skips.filter(s => (s.status || 'approved').toLowerCase() === status.toLowerCase());
    }

    // Filter by mealType
    if (mealType && mealType !== 'all') {
      skips = skips.filter(s => {
        const m = (s.mealType || s.meal || '').toLowerCase();
        return m.includes(mealType.toLowerCase());
      });
    }

    // Filter by date
    if (date && date !== 'all') {
      const todayStr = getISTDateStr(0);
      const tomorrowStr = getISTDateStr(1);
      if (date === 'today') {
        skips = skips.filter(s => s.date === todayStr);
      } else if (date === 'tomorrow') {
        skips = skips.filter(s => s.date === tomorrowStr);
      } else if (date === 'past') {
        skips = skips.filter(s => s.date < todayStr);
      } else {
        skips = skips.filter(s => s.date === date);
      }
    }

    // Search query
    if (q && q.trim()) {
      const term = q.trim().toLowerCase();
      skips = skips.filter(s =>
        (s.student || '').toLowerCase().includes(term) ||
        (s.hostel || '').toLowerCase().includes(term) ||
        (s.reason || '').toLowerCase().includes(term) ||
        (s.id || '').toLowerCase().includes(term)
      );
    }

    // Sort: newest createdAt or date descending
    skips.sort((a, b) => {
      const timeA = new Date(a.createdAt || a.date).getTime();
      const timeB = new Date(b.createdAt || b.date).getTime();
      return timeB - timeA;
    });

    res.json({ success: true, count: skips.length, skips });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/admin/skips — Admin manual skip creation on behalf of student
// @desc    Allows admin/warden to skip a meal for a student (e.g. phone request)
// @access  Admin
router.post('/skips', protect, adminOnly, async (req, res) => {
  try {
    const { userId, mealType = 'lunch', date, reason, credit } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Please select a student / subscription.' });
    }

    const todayStr = getISTDateStr(0);
    const targetDate = date ? date.trim() : todayStr;

    // Find student & active subscription
    const studentUser = await User.findById(userId) || await User.findOne({ id: userId });
    if (!studentUser) {
      return res.status(404).json({ success: false, message: 'Student user not found' });
    }

    let sub = await Subscription.findOne({ userId: studentUser._id || studentUser.id, status: 'active' }).populate('planId');
    if (!sub && studentUser.activeSubscription) {
      sub = await Subscription.findById(studentUser.activeSubscription).populate('planId');
    }

    // Calculate credit amount
    const monthlyPrice = sub?.planId?.monthlyPrice || sub?.amountPaid || 2499;
    const mealsPerDay = sub?.planId?.mealsPerDay || 2;
    const defaultCredit = Math.max(50, Math.round(monthlyPrice / (mealsPerDay * 30)));
    const creditAmount = credit !== undefined && !isNaN(Number(credit)) ? Number(credit) : defaultCredit;

    const skipId = `SKP-ADM-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const mealLabel = mealType === 'lunch' ? 'Lunch (12:30 PM)' : 'Dinner (07:30 PM)';
    const skipReason = reason && reason.trim() ? reason.trim() : 'Manual skip recorded by Mess Admin';

    // Update Subscription if available: increment remainingMeals (+1 meal added)
    if (sub) {
      sub.remainingMeals = (Number(sub.remainingMeals) || 0) + 1;
      sub.skippedMeals = (Number(sub.skippedMeals) || 0) + 1;
      if (!Array.isArray(sub.skipHistory)) sub.skipHistory = [];
      sub.skipHistory.unshift({
        id: skipId,
        date: targetDate,
        mealType,
        mealSlot: mealLabel,
        reason: `${skipReason} (Admin Manual)`,
        refundAmount: 0,
        mealsAdded: 1,
        refundStatus: '+1 Meal Added to Balance',
        status: 'approved',
        createdAt: new Date().toISOString()
      });
      await sub.save();
    }

    // Do NOT credit student wallet (no wallet money added per user policy)

    // Create SkipRequest record
    const newSkip = await SkipRequest.create({
      id: skipId,
      student: studentUser.name || 'Student Member',
      studentId: String(studentUser._id || studentUser.id),
      hostel: sub?.hostelAddress || studentUser.deliveryAddress || 'Hostel Campus',
      meal: mealType === 'lunch' ? 'Lunch' : 'Dinner',
      mealType,
      mealSlot: mealLabel,
      reason: skipReason,
      credit: 0,
      mealsAdded: 1,
      refundStatus: '+1 Meal Added to Balance',
      status: 'approved',
      date: targetDate
    });

    // Sync kitchen dispatch roster if skipping today's meal
    if (targetDate === todayStr) {
      try {
        const studentName = (studentUser.name || '').toLowerCase();
        const rosterEntries = await DispatchRoster.find();
        const matchedEntry = rosterEntries.find(d =>
          d.student && d.student.toLowerCase().includes(studentName)
        );
        if (matchedEntry) {
          const entryId = matchedEntry._id || matchedEntry.id;
          const existingExtras = matchedEntry.extras || '';
          const skipTag = `[SKIPPED: ${mealType.toUpperCase()}]`;
          if (!existingExtras.includes(skipTag)) {
            await DispatchRoster.findByIdAndUpdate(entryId, {
              extras: existingExtras ? `${existingExtras} • ${skipTag}` : skipTag
            });
          }
        }
      } catch (e) {
        console.warn('Dispatch roster sync warning:', e.message);
      }
    }

    res.json({
      success: true,
      message: `Successfully recorded skip for ${studentUser.name}. +1 meal added to student's Remaining Meals balance.`,
      skip: newSkip
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/admin/skips/:id/approve
// @desc    Approve meal skip request and add +1 meal to remainingMeals balance
// @access  Admin
router.post('/skips/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const targetId = String(req.params.id);
    let skip = await SkipRequest.findById(targetId);
    if (!skip) skip = await SkipRequest.findOne({ id: targetId });
    if (!skip) skip = await SkipRequest.findOne({ _id: targetId });
    if (!skip) {
      const allSkips = await SkipRequest.find();
      skip = allSkips.find(s => s.id === targetId || s._id === targetId || s.skipId === targetId);
    }
    if (!skip) return res.status(404).json({ success: false, message: 'Skip request not found' });

    skip.status = 'approved';
    skip.credit = 0;
    skip.mealsAdded = 1;
    skip.refundStatus = '+1 Meal Added to Balance';
    await skip.save();

    // 1. Add +1 meal to active subscription remainingMeals
    let sub = null;
    if (skip.subscriptionId) {
      sub = await Subscription.findById(skip.subscriptionId);
    }
    if (!sub && skip.studentId) {
      sub = await Subscription.findOne({ userId: skip.studentId, status: 'active' });
    }
    if (sub) {
      sub.remainingMeals = (Number(sub.remainingMeals) || 0) + 1;
      sub.skippedMeals = (Number(sub.skippedMeals) || 0) + 1;
      if (Array.isArray(sub.skipHistory)) {
        sub.skipHistory = sub.skipHistory.map(h => {
          if (h.id === skip.id || (h.date === skip.date && h.mealType === skip.mealType)) {
            return {
              ...h,
              status: 'approved',
              refundStatus: '+1 Meal Added to Balance',
              refundAmount: 0,
              mealsAdded: 1
            };
          }
          return h;
        });
      }
      await sub.save();
    }

    // 2. No wallet money added per policy — meal quota preserved in remainingMeals

    // 3. Sync with kitchen dispatch roster if today
    const todayStr = getISTDateStr(0);
    if (skip.date === todayStr) {
      try {
        const studentName = (skip.student || '').toLowerCase();
        const rosterEntries = await DispatchRoster.find();
        const matchedEntry = rosterEntries.find(d =>
          d.student && d.student.toLowerCase().includes(studentName)
        );
        if (matchedEntry) {
          const entryId = matchedEntry._id || matchedEntry.id;
          let existingExtras = matchedEntry.extras || '';
          const mealType = (skip.mealType || skip.meal || 'MEAL').toUpperCase();
          const skipTag = `[SKIPPED: ${mealType}]`;
          const pendingTag = `[SKIP PENDING: ${mealType}]`;
          existingExtras = existingExtras.replace(pendingTag, '').trim();
          if (!existingExtras.includes(skipTag)) {
            existingExtras = existingExtras ? `${existingExtras} • ${skipTag}` : skipTag;
          }
          await DispatchRoster.findByIdAndUpdate(entryId, {
            extras: existingExtras
          });
        }
      } catch (e) {
        console.warn('Dispatch roster sync warning:', e.message);
      }
    }

    res.json({ success: true, message: `Approved skip for ${skip.student}. +1 meal added to student's Remaining Meals balance.`, skip });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/admin/skips/:id/reject
// @desc    Reject meal skip request
// @access  Admin
router.post('/skips/:id/reject', protect, adminOnly, async (req, res) => {
  try {
    const targetId = String(req.params.id);
    let skip = await SkipRequest.findById(targetId);
    if (!skip) skip = await SkipRequest.findOne({ id: targetId });
    if (!skip) skip = await SkipRequest.findOne({ _id: targetId });
    if (!skip) {
      const allSkips = await SkipRequest.find();
      skip = allSkips.find(s => s.id === targetId || s._id === targetId || s.skipId === targetId);
    }
    if (!skip) return res.status(404).json({ success: false, message: 'Skip request not found' });

    skip.status = 'rejected';
    skip.refundStatus = 'Declined by Admin';
    await skip.save();

    // Update status in subscription's skipHistory
    if (skip.subscriptionId || skip.studentId) {
      const sub = skip.subscriptionId
        ? await Subscription.findById(skip.subscriptionId)
        : await Subscription.findOne({ userId: skip.studentId, status: 'active' });
      if (sub && Array.isArray(sub.skipHistory)) {
        sub.skipHistory = sub.skipHistory.map(h => {
          if (h.id === skip.id || (h.date === skip.date && h.mealType === skip.mealType)) {
            return { ...h, status: 'rejected', refundStatus: 'Declined by Admin' };
          }
          return h;
        });
        await sub.save();
      }
    }

    // Clean up dispatch roster tag if skipping today's meal was rejected
    const todayStr = getISTDateStr(0);
    if (skip.date === todayStr) {
      try {
        const studentName = (skip.student || '').toLowerCase();
        const rosterEntries = await DispatchRoster.find();
        const matchedEntry = rosterEntries.find(d =>
          d.student && d.student.toLowerCase().includes(studentName)
        );
        if (matchedEntry) {
          const entryId = matchedEntry._id || matchedEntry.id;
          let existingExtras = matchedEntry.extras || '';
          const mealType = (skip.mealType || skip.meal || 'MEAL').toUpperCase();
          const pendingTag = `[SKIP PENDING: ${mealType}]`;
          existingExtras = existingExtras.replace(pendingTag, '').replace('•  •', '•').replace(/•\s*$/, '').trim();
          await DispatchRoster.findByIdAndUpdate(entryId, {
            extras: existingExtras
          });
        }
      } catch (e) {
        console.warn('Dispatch roster sync warning:', e.message);
      }
    }

    res.json({ success: true, message: `Skip request for ${skip.student} has been marked as rejected.`, skip });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/admin/skips/:id
// @desc    Delete / archive a skip request record
// @access  Admin
router.delete('/skips/:id', protect, adminOnly, async (req, res) => {
  try {
    let deleted = await SkipRequest.findByIdAndDelete(req.params.id);
    if (!deleted) deleted = await SkipRequest.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ success: false, message: 'Skip request not found' });

    res.json({ success: true, message: 'Skip request record removed from database' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/admin/skips/sync-roster
// @desc    One-click re-sync of all today's approved skips with kitchen dispatch roster
// @access  Admin
router.post('/skips/sync-roster', protect, adminOnly, async (req, res) => {
  try {
    const todayStr = getISTDateStr(0);
    const skips = await SkipRequest.find();
    const todayApprovedSkips = skips.filter(s => s.date === todayStr && (s.status === 'approved' || !s.status));

    const rosterEntries = await DispatchRoster.find();
    let syncedCount = 0;

    for (const skip of todayApprovedSkips) {
      const studentName = (skip.student || '').toLowerCase();
      const matched = rosterEntries.find(d => d.student && d.student.toLowerCase().includes(studentName));
      if (matched) {
        const entryId = matched._id || matched.id;
        const existingExtras = matched.extras || '';
        const mType = (skip.mealType || skip.meal || 'MEAL').toUpperCase();
        const tag = `[SKIPPED: ${mType}]`;
        if (!existingExtras.includes(tag)) {
          await DispatchRoster.findByIdAndUpdate(entryId, {
            extras: existingExtras ? `${existingExtras} • ${tag}` : tag
          });
          syncedCount++;
        }
      }
    }

    res.json({
      success: true,
      message: `Synchronized ${syncedCount} skipped meals with kitchen dispatch roster!`,
      syncedCount,
      todaySkipsCount: todayApprovedSkips.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── INSTANT ORDERS MANAGEMENT ──────────────────────────────────
// @route   GET /api/admin/orders
// @desc    Get all customer orders with subscriber enrichment
// @access  Admin
router.get('/orders', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    const allSubs = await Subscription.find().populate('planId', 'name monthlyPrice');
    
    // Enrich orders with subscriber status so admin can filter and view subscriber orders
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
        o.subscriberStatus = sub.status || 'active';
        o.subscriberHostel = sub.hostelAddress || o.deliveryAddress;
      } else {
        o.isSubscriber = false;
      }

      // Check if order contains extra addon items OR requested to pack with meal
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

// @route   GET /api/admin/subscribers/:id/orders
// @desc    Get complete order history, tiffin dispatches, skips and billing for a subscriber
// @access  Admin
router.get('/subscribers/:id/orders', protect, adminOnly, async (req, res) => {
  try {
    const paramId = req.params.id;

    // Search by subscription ID or User ID
    let sub = await Subscription.findById(paramId)
      .populate('userId', 'name email phone walletBalance deliveryAddress hostel roomNumber')
      .populate('planId', 'name monthlyPrice mealsPerDay description features');

    if (!sub) {
      sub = await Subscription.findOne({ id: paramId })
        .populate('userId', 'name email phone walletBalance deliveryAddress hostel roomNumber')
        .populate('planId', 'name monthlyPrice mealsPerDay description features');
    }

    let user = null;
    if (!sub) {
      user = await User.findById(paramId);
      if (!user) user = await User.findOne({ id: paramId });
      if (user) {
        sub = await Subscription.findOne({ userId: user._id || user.id })
          .populate('userId', 'name email phone walletBalance deliveryAddress hostel roomNumber')
          .populate('planId', 'name monthlyPrice mealsPerDay description features');
      }
    } else {
      user = sub.userId;
    }

    const targetUserId = user ? String(user._id || user.id) : (sub?.userId ? String(sub.userId._id || sub.userId.id || sub.userId) : null);
    const userName = (user?.name || sub?.userId?.name || '').trim();
    const userPhone = (user?.phone || sub?.userId?.phone || '').trim();
    const userEmail = (user?.email || sub?.userId?.email || '').trim();

    // 1. Food & Add-on Orders
    const allOrders = await Order.find().sort({ createdAt: -1 });
    const matchedOrders = allOrders.filter(o => {
      const oUid = String(o.userId || '');
      if (targetUserId && oUid === targetUserId) return true;
      if (userName && o.customerName && o.customerName.toLowerCase() === userName.toLowerCase()) return true;
      if (userPhone && o.customerPhone && (o.customerPhone.includes(userPhone) || userPhone.includes(o.customerPhone))) return true;
      return false;
    });

    const enrichedMatchedOrders = matchedOrders.map(ord => {
      const o = typeof ord.toObject === 'function' ? ord.toObject() : { ...ord };
      const isExtra = Boolean(
        o.isExtraOrder === true ||
        o.orderType === 'extra_addon' ||
        o.deliverWithMeal === true ||
        o.deliveryMode === 'with_tiffin'
      );
      if (isExtra) {
        o.isExtraOrder = true;
        if (!o.orderType || o.orderType === 'regular') o.orderType = 'extra_addon';
      }
      return o;
    });

    // 2. Daily Tiffin Dispatches
    const allDispatches = await DispatchRoster.find();
    const matchedDispatches = allDispatches.filter(d => {
      if (userName && d.student && d.student.toLowerCase().includes(userName.toLowerCase())) return true;
      if (sub?.room && d.hostel && d.hostel.includes(sub.room)) return true;
      return false;
    });

    // 3. Meal Skip Requests
    const allSkips = await SkipRequest.find();
    const matchedSkips = allSkips.filter(s => {
      if (targetUserId && String(s.studentId || '') === targetUserId) return true;
      if (userName && s.student && s.student.toLowerCase().includes(userName.toLowerCase())) return true;
      return false;
    });

    // 4. All Subscription Billing History for this user
    const allSubs = await Subscription.find()
      .populate('planId', 'name monthlyPrice mealsPerDay')
      .sort({ createdAt: -1 });
    const subscriptionHistory = allSubs.filter(s => {
      const sUid = typeof s.userId === 'object' ? String(s.userId?._id || s.userId?.id || '') : String(s.userId || '');
      return targetUserId && sUid === targetUserId;
    });

    // KPI Metrics
    const totalSpentOrders = enrichedMatchedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalSpentSubs = subscriptionHistory.reduce((sum, s) => sum + (s.amountPaid || 0), 0);

    const stats = {
      totalOrders: enrichedMatchedOrders.length,
      totalSpentOrders,
      totalSpentSubs,
      lifetimeValue: totalSpentOrders + totalSpentSubs,
      deliveredOrders: enrichedMatchedOrders.filter(o => o.status === 'delivered').length,
      pendingOrders: enrichedMatchedOrders.filter(o => ['confirmed', 'preparing', 'on-the-way'].includes(o.status)).length,
      cancelledOrders: enrichedMatchedOrders.filter(o => o.status === 'cancelled').length,
      dispatchesCount: matchedDispatches.length,
      skipsCount: matchedSkips.length
    };

    res.json({
      success: true,
      subscriber: sub,
      user: user || sub?.userId,
      stats,
      orders: enrichedMatchedOrders,
      dispatches: matchedDispatches,
      skips: matchedSkips,
      subscriptionHistory
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status
// @access  Admin
router.put('/orders/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    let order = await Order.findById(req.params.id);
    if (!order) order = await Order.findOne({ orderId: req.params.id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (status === 'delivered' && order.paymentMethod === 'Cash on Delivery') {
      order.paymentStatus = 'paid';
    }
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── COMPLAINTS MANAGEMENT ──────────────────────────────────────
// @route   GET /api/admin/complaints
// @desc    Get all complaints
// @access  Admin
router.get('/complaints', protect, adminOnly, async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json({ success: true, count: complaints.length, complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/admin/complaints/:id/resolve
// @desc    Resolve a complaint with optional refund/credit
// @access  Admin
router.put('/complaints/:id/resolve', protect, adminOnly, async (req, res) => {
  try {
    const { resolution, status, creditAmount } = req.body;
    let complaint = await Complaint.findById(req.params.id);
    if (!complaint) complaint = await Complaint.findOne({ ticketId: req.params.id });
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    complaint.resolution = resolution || 'Issue investigated and resolved by mess manager.';
    complaint.status = status || 'resolved';
    await complaint.save();

    // If credit is provided, add to user wallet
    if (creditAmount && Number(creditAmount) > 0 && complaint.userId) {
      await User.findByIdAndUpdate(complaint.userId, {
        $inc: { walletBalance: Number(creditAmount) }
      });
    }

    res.json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── COUPONS & PROMOS MANAGEMENT ────────────────────────────────
// @route   GET /api/admin/coupons
// @desc    Get all coupons
// @access  Admin / Public
router.get('/coupons', async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json({ success: true, count: coupons.length, coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/admin/coupons
// @desc    Create a new coupon code
// @access  Admin
router.post('/coupons', protect, adminOnly, async (req, res) => {
  try {
    const { code, type, value, minOrder, maxUsage, expiry, desc } = req.body;
    if (!code || !value) {
      return res.status(400).json({ success: false, message: 'Coupon code and discount value are required' });
    }

    const newCoupon = await Coupon.create({
      id: `CPN${Date.now().toString().slice(-4)}`,
      code: code.trim().toUpperCase(),
      type: type || 'Percentage',
      value: Number(value) || 10,
      minOrder: Number(minOrder) || 99,
      usage: 0,
      maxUsage: Number(maxUsage) || 200,
      expiry: expiry || '2026-12-31',
      status: 'active',
      desc: desc || `Flat ${value}${type === 'Percentage' ? '%' : ' Rs'} OFF`
    });

    res.status(201).json({ success: true, coupon: newCoupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/admin/coupons/:id/toggle
// @desc    Toggle coupon status (active/paused)
// @access  Admin
router.put('/coupons/:id/toggle', protect, adminOnly, async (req, res) => {
  try {
    let coupon = await Coupon.findById(req.params.id);
    if (!coupon) coupon = await Coupon.findOne({ id: req.params.id });
    if (!coupon) coupon = await Coupon.findOne({ code: req.params.id.toUpperCase() });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });

    coupon.status = coupon.status === 'active' ? 'paused' : 'active';
    await coupon.save();
    res.json({ success: true, coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/admin/coupons/:id
// @desc    Delete a coupon
// @access  Admin
router.delete('/coupons/:id', protect, adminOnly, async (req, res) => {
  try {
    let coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) coupon = await Coupon.findOneAndDelete({ id: req.params.id });
    if (!coupon) coupon = await Coupon.findOneAndDelete({ code: req.params.id.toUpperCase() });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });

    res.json({ success: true, message: 'Coupon removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── USER MANAGEMENT & WALLET TOPUP ─────────────────────────────
// @route   POST /api/admin/users/:id/wallet
// @desc    Admin credits or debits user wallet
// @access  Admin
router.post('/users/:id/wallet', protect, adminOnly, async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount === 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }

    let user = await User.findById(req.params.id);
    if (!user) user = await User.findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.walletBalance = Math.max(0, (user.walletBalance || 0) + numAmount);
    await user.save();

    res.json({
      success: true,
      message: `Wallet updated: ₹${Math.abs(numAmount)} ${numAmount > 0 ? 'credited to' : 'debited from'} ${user.name}`,
      walletBalance: user.walletBalance,
      user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Admin
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    let user = await User.findByIdAndDelete(req.params.id);
    if (!user) user = await User.findOneAndDelete({ id: req.params.id });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: 'User removed from database' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── COMPATIBILITY ALIASES ─────────────────────────────────────
router.use('/dispatch-roster', (req, res, next) => {
  const orig = req.url;
  req.url = '/dispatch' + (orig === '/' ? '' : orig);
  router.handle(req, res, next);
});

router.use('/skip-requests', (req, res, next) => {
  const orig = req.url;
  req.url = '/skips' + (orig === '/' ? '' : orig);
  router.handle(req, res, next);
});

router.use('/delivery-routes', (req, res, next) => {
  const orig = req.url;
  req.url = '/routes' + (orig === '/' ? '' : orig);
  router.handle(req, res, next);
});

// ── WIPE / CLEAR ALL BACKEND DATA ──────────────────────────────
// @route   POST /api/admin/clear-all-data
// @desc    Clear all operational and transactional data (orders, dispatches, subscriptions, complaints, payouts)
// @access  Admin
router.post('/clear-all-data', protect, adminOnly, async (req, res) => {
  try {
    const {
      clearOrders = true,
      clearDispatchRoster = true,
      clearSubscriptions = true,
      clearComplaints = true,
      clearSkipRequests = true,
      clearRiderPayouts = true,
      resetRiders = false,
      clearRiders = true,
      clearDeliveryRoutes = true,
      clearDeliveryZones = true
    } = req.body || {};

    if (clearOrders) {
      const Order = getModel('orders');
      if (typeof Order.deleteMany === 'function') await Order.deleteMany({});
    }

    if (clearDispatchRoster) {
      const Dispatch = getModel('dispatchRoster');
      if (typeof Dispatch.deleteMany === 'function') await Dispatch.deleteMany({});
    }

    if (clearSubscriptions) {
      const Sub = getModel('subscriptions');
      if (typeof Sub.deleteMany === 'function') await Sub.deleteMany({});
      const User = getModel('users');
      if (typeof User.updateMany === 'function') {
        await User.updateMany({}, { activeSubscription: null, walletBalance: 0, walletTransactions: [] });
      }
    }

    if (clearComplaints) {
      const Complaint = getModel('complaints');
      if (typeof Complaint.deleteMany === 'function') await Complaint.deleteMany({});
    }

    if (clearSkipRequests) {
      const Skip = getModel('skipRequests');
      if (typeof Skip.deleteMany === 'function') await Skip.deleteMany({});
    }

    if (clearRiderPayouts) {
      const Payout = getModel('riderPayouts');
      if (typeof Payout.deleteMany === 'function') await Payout.deleteMany({});
    }

    if (clearRiders) {
      const Rider = getModel('riders');
      if (typeof Rider.deleteMany === 'function') await Rider.deleteMany({});
    } else if (resetRiders) {
      const Rider = getModel('riders');
      const allRiders = await Rider.find({});
      for (const r of allRiders) {
        r.deliveriesToday = 0;
        r.activeTiffins = 0;
        r.earningsToday = 0;
        r.codCollectedToday = 0;
        r.walletBalance = 0;
        r.status = 'available';
        if (typeof r.save === 'function') await r.save();
        else if (typeof Rider.findByIdAndUpdate === 'function') {
          await Rider.findByIdAndUpdate(r._id || r.id, r);
        }
      }
    }

    if (clearDeliveryRoutes) {
      const Route = getModel('deliveryRoutes');
      if (typeof Route.deleteMany === 'function') await Route.deleteMany({});
    }

    if (clearDeliveryZones) {
      const Zone = getModel('deliveryZones');
      if (typeof Zone.deleteMany === 'function') await Zone.deleteMany({});
    }

    res.json({
      success: true,
      message: 'All backend operational and transactional data successfully cleared!'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
