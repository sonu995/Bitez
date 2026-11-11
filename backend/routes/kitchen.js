const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Dish = require('../models/Dish');
const ExtraItem = require('../models/ExtraItem');
const { getModel } = require('../config/adapter');
const DispatchRoster = getModel('dispatchRoster');
const { protect, adminOnly } = require('../middleware/auth');

function getTodayISTStr() {
  const ist = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().split('T')[0];
}

// @route   GET /api/kitchen/queue
// @desc    Live KDS feed: Instant KOT orders, Mess meal batches, Combined boxes & Stock status
// @access  Admin / Kitchen
router.get('/queue', protect, adminOnly, async (req, res) => {
  try {
    const todayStr = getTodayISTStr();
    const [allOrders, allDispatches, allDishes, allExtras] = await Promise.all([
      Order.find().sort({ createdAt: -1 }),
      DispatchRoster.find(),
      Dish.find(),
      ExtraItem.find()
    ]);

    // 1. Live Instant Food KOT Queue (active non-cancelled/non-delivered orders)
    const activeKots = (allOrders || [])
      .filter(o => !o.deliverWithMeal && o.orderType !== 'extra_addon')
      .filter(o => ['confirmed', 'preparing', 'ready', 'on-the-way'].includes((o.status || '').toLowerCase()))
      .map(o => {
        const obj = typeof o.toObject === 'function' ? o.toObject() : { ...o };
        const createdMs = obj.createdAt ? new Date(obj.createdAt).getTime() : Date.now();
        const elapsedMins = Math.max(0, Math.floor((Date.now() - createdMs) / 60000));
        return {
          ...obj,
          kotNumber: `KOT-${String(obj.orderId || obj._id || '').slice(-4).toUpperCase()}`,
          elapsedMins
        };
      });

    // 2. Today's Mess Batches (Breakfast, Lunch, Dinner) with Combined Extra Add-on Highlights
    const todayDispatches = (allDispatches || []).filter(d => {
      const dDate = d.date || (d.createdAt ? String(d.createdAt).split('T')[0] : todayStr);
      return !d.date || dDate === todayStr;
    });

    const summarizeSlot = (slotKey) => {
      const list = todayDispatches.filter(d => {
        const sl = (d.slot || d.mealSlot || '').toLowerCase();
        if (slotKey === 'breakfast') return sl.includes('breakfast');
        if (slotKey === 'lunch') return sl.includes('lunch') || (!sl.includes('breakfast') && !sl.includes('dinner'));
        return sl.includes('dinner');
      });
      return {
        total: list.length,
        preparing: list.filter(d => (d.status || '').toLowerCase() === 'preparing' && !d.isSkipped).length,
        packed: list.filter(d => (d.status || '').toLowerCase() === 'packed').length,
        dispatched: list.filter(d => ['dispatched', 'out-for-delivery', 'out_for_delivery', 'on-the-way'].includes((d.status || '').toLowerCase())).length,
        delivered: list.filter(d => (d.status || '').toLowerCase() === 'delivered').length,
        skipped: list.filter(d => d.isSkipped || (d.status || '').toLowerCase() === 'skipped').length,
        withExtras: list.filter(d => Boolean(d.hasAttachedExtras || (Array.isArray(d.attachedExtras) && d.attachedExtras.length > 0))).length,
        unassignedCombined: list.filter(d =>
          (d.hasAttachedExtras || (Array.isArray(d.attachedExtras) && d.attachedExtras.length > 0)) &&
          (!d.rider || d.rider === 'Unassigned') &&
          (d.status || '').toLowerCase() !== 'delivered'
        ).length
      };
    };

    const messBatches = {
      breakfast: summarizeSlot('breakfast'),
      lunch: summarizeSlot('lunch'),
      dinner: summarizeSlot('dinner')
    };

    // Stock Items summary
    const dishesStock = (allDishes || []).map(d => ({
      id: d._id || d.id,
      type: 'dish',
      name: d.name,
      category: d.category,
      price: d.price,
      isAvailable: d.isAvailable !== false,
      stockQty: typeof d.stockQty === 'number' ? d.stockQty : null
    }));

    const extrasStock = (allExtras || []).map(ex => ({
      id: ex._id || ex.id,
      type: 'extra',
      name: ex.name,
      category: ex.category || 'Side',
      price: ex.price,
      isAvailable: ex.isActive !== false && ex.isAvailable !== false,
      stockQty: typeof ex.stockQty === 'number' ? ex.stockQty : null
    }));

    res.json({
      success: true,
      todayStr,
      kots: activeKots,
      messRoster: todayDispatches,
      messBatches,
      stock: {
        dishes: dishesStock,
        extras: extrasStock
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/kitchen/kot/:id/status
// @desc    Kitchen transitions an Instant Food KOT ticket status
// @access  Admin / Kitchen
router.put('/kot/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, kitchenReady } = req.body;
    let order = await Order.findOne({ orderId: req.params.id });
    if (!order) order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order KOT not found' });

    if (status) {
      order.status = status === 'ready' ? 'preparing' : status;
      if (status === 'ready') {
        order.kitchenReady = true;
        order.packingStatus = 'ready';
      }
    }
    if (kitchenReady !== undefined) {
      order.kitchenReady = Boolean(kitchenReady);
      if (kitchenReady) order.packingStatus = 'ready';
    }

    await order.save();
    res.json({ success: true, message: 'KOT status updated', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/kitchen/mess/:id/status
// @desc    Kitchen packs a mess tiffin box & its combined attached extras
// @access  Admin / Kitchen
router.put('/mess/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    let item = await DispatchRoster.findById(req.params.id);
    if (!item) item = await DispatchRoster.findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ success: false, message: 'Mess box not found' });

    const nextStatus = status || 'packed';
    item.status = nextStatus;
    item.statusStep = nextStatus;
    item.deliveryStatus = nextStatus === 'packed' ? 'Packed (Ready for Rider)' : nextStatus === 'preparing' ? 'Preparing' : nextStatus;

    if (nextStatus === 'packed' && Array.isArray(item.attachedExtras)) {
      item.extrasPacked = true;
      item.attachedExtras.forEach(ext => {
        ext.packed = true;
        if (ext.status === 'confirmed') ext.status = 'preparing';
      });
    }

    if (typeof item.save === 'function') {
      await item.save();
    } else {
      await DispatchRoster.findByIdAndUpdate(item._id || item.id, {
        status: item.status,
        statusStep: item.statusStep,
        deliveryStatus: item.deliveryStatus,
        extrasPacked: item.extrasPacked,
        attachedExtras: item.attachedExtras
      });
    }

    res.json({ success: true, message: `Mess box marked ${nextStatus}`, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/kitchen/mess/batch-pack
// @desc    Bulk-pack all preparing mess boxes for a specific slot (Breakfast / Lunch / Dinner)
// @access  Admin / Kitchen
router.put('/mess/batch-pack', protect, adminOnly, async (req, res) => {
  try {
    const slotReq = (req.body.slot || 'Lunch').toLowerCase();
    const todayStr = getTodayISTStr();
    const allDispatches = await DispatchRoster.find();
    let packedCount = 0;

    for (const d of (allDispatches || [])) {
      const sl = (d.slot || d.mealSlot || '').toLowerCase();
      const matchesSlot =
        slotReq === 'breakfast' ? sl.includes('breakfast') :
        slotReq === 'dinner' ? sl.includes('dinner') :
        (sl.includes('lunch') || (!sl.includes('breakfast') && !sl.includes('dinner')));
      const dDate = d.date || (d.createdAt ? String(d.createdAt).split('T')[0] : todayStr);

      if (matchesSlot && (!d.date || dDate === todayStr) && !d.isSkipped && (d.status || '').toLowerCase() === 'preparing') {
        d.status = 'packed';
        d.statusStep = 'packed';
        d.deliveryStatus = 'Packed (Ready for Rider)';
        if (Array.isArray(d.attachedExtras) && d.attachedExtras.length > 0) {
          d.extrasPacked = true;
          d.attachedExtras.forEach(ext => {
            ext.packed = true;
            if (ext.status === 'confirmed') ext.status = 'preparing';
          });
        }
        if (typeof d.save === 'function') await d.save();
        else await DispatchRoster.findByIdAndUpdate(d._id || d.id, d);
        packedCount++;
      }
    }

    res.json({ success: true, packedCount, message: `Packed ${packedCount} boxes for ${req.body.slot || 'Lunch'}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/kitchen/stock/:type/:id
// @desc    Toggle dish or extra item availability / stockQty
// @access  Admin / Kitchen
router.put('/stock/:type/:id', protect, adminOnly, async (req, res) => {
  try {
    const { type, id } = req.params;
    const { isAvailable, stockQty } = req.body;

    if (type === 'dish') {
      const dish = await Dish.findById(id) || await Dish.findOne({ id });
      if (!dish) return res.status(404).json({ success: false, message: 'Dish not found' });
      if (isAvailable !== undefined) dish.isAvailable = Boolean(isAvailable);
      if (stockQty !== undefined) dish.stockQty = stockQty === null ? undefined : Number(stockQty);
      await dish.save();
      return res.json({ success: true, item: dish });
    }

    if (type === 'extra') {
      const extra = await ExtraItem.findById(id) || await ExtraItem.findOne({ id });
      if (!extra) return res.status(404).json({ success: false, message: 'Extra item not found' });
      if (isAvailable !== undefined) {
        extra.isActive = Boolean(isAvailable);
        extra.isAvailable = Boolean(isAvailable);
      }
      if (stockQty !== undefined) extra.stockQty = stockQty === null ? undefined : Number(stockQty);
      await extra.save();
      return res.json({ success: true, item: extra });
    }

    return res.status(400).json({ success: false, message: 'Invalid stock type (dish or extra)' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

