const express = require('express');
const router = express.Router();
const ExtraItem = require('../models/ExtraItem');
const { protect, adminOnly } = require('../middleware/auth');

// @route  GET /api/extras
// @access Public
router.get('/', async (req, res) => {
  try {
    const items = await ExtraItem.find({ isActive: true });
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  GET /api/extras/all — admin sees all
// @access Admin
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const items = await ExtraItem.find();
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  POST /api/extras
// @access Admin
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const item = await ExtraItem.create(req.body);
    res.status(201).json({ success: true, item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @route  PUT /api/extras/:id
// @access Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await ExtraItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @route  DELETE /api/extras/:id
// @access Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await ExtraItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
