const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');
const { protect, adminOnly } = require('../middleware/auth');

// @route  GET /api/plans
// @access Public — for /mess page
router.get('/', async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ monthlyPrice: 1 });
    res.json({ success: true, plans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  GET /api/plans/all — admin sees all including inactive
// @access Admin
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const plans = await Plan.find().sort({ monthlyPrice: 1 });
    res.json({ success: true, plans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  GET /api/plans/:id
// @access Public
router.get('/:id', async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.json({ success: true, plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  POST /api/plans
// @access Admin
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const plan = await Plan.create(req.body);
    res.status(201).json({ success: true, plan });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @route  PUT /api/plans/:id
// @access Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.json({ success: true, plan });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @route  DELETE /api/plans/:id
// @access Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.json({ success: true, message: 'Plan deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
