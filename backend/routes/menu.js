const express = require('express');
const router = express.Router();
const WeeklyMenu = require('../models/WeeklyMenu');
const { protect, adminOnly } = require('../middleware/auth');

// @route  GET /api/menu
// @access Public
router.get('/', async (req, res) => {
  try {
    const menu = await WeeklyMenu.find().sort({ _id: 1 });
    // Convert array to object keyed by day: { Mon: {...}, Tue: {...} }
    const menuObj = {};
    menu.forEach(m => {
      menuObj[m.day] = {
        breakfast: m.breakfast,
        lunch: m.lunch,
        dinner: m.dinner
      };
    });
    res.json({ success: true, menu: menuObj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  PUT /api/menu/:day  — update a single day's menu
// @access Admin
router.put('/:day', protect, adminOnly, async (req, res) => {
  try {
    const { breakfast, lunch, dinner } = req.body;
    const updated = await WeeklyMenu.findOneAndUpdate(
      { day: req.params.day },
      { breakfast, lunch, dinner },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, menu: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
