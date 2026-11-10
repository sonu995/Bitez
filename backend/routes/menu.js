const express = require('express');
const router = express.Router();
const WeeklyMenu = require('../models/WeeklyMenu');
const { protect, adminOnly } = require('../middleware/auth');
const { getOrCreateMealTimings } = require('./mealTimingsHelper');

// @route  GET /api/menu/meal-timings
// @desc   Public access to live mess delivery timings & cutoff
// @access Public
router.get('/meal-timings', async (req, res) => {
  try {
    const timings = await getOrCreateMealTimings();
    res.json({ success: true, timings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  GET /api/menu
// @access Public
router.get('/', async (req, res) => {
  try {
    const menu = await WeeklyMenu.find().sort({ _id: 1 });
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

// @route  GET /api/menu/today
// @access Public
router.get('/today', async (req, res) => {
  try {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDay = dayNames[new Date().getDay()];

    const [todayMenu, allMenu] = await Promise.all([
      WeeklyMenu.findOne({ day: currentDay }),
      WeeklyMenu.find().sort({ _id: 1 })
    ]);

    const weeklyObj = {};
    if (Array.isArray(allMenu)) {
      allMenu.forEach(m => {
        weeklyObj[m.day] = {
          breakfast: m.breakfast,
          lunch: m.lunch,
          dinner: m.dinner
        };
      });
    }

    if (todayMenu) {
      return res.json({
        success: true,
        day: currentDay,
        breakfast: { emoji: '🥪', items: todayMenu.breakfast },
        lunch: { emoji: '🍚', items: todayMenu.lunch },
        dinner: { emoji: '🍲', items: todayMenu.dinner },
        menu: {
          breakfast: todayMenu.breakfast,
          lunch: todayMenu.lunch,
          dinner: todayMenu.dinner
        },
        weekly: weeklyObj
      });
    }

    // Default fallback
    res.json({
      success: true,
      day: currentDay,
      breakfast: { emoji: '🥪', items: 'Aloo Paratha + Curd + Chai' },
      lunch: { emoji: '🍚', items: 'Dal Makhani + Jeera Rice + 3 Roti + Salad' },
      dinner: { emoji: '🍲', items: 'Paneer Butter Masala + Rice + 3 Roti' },
      menu: {
        breakfast: 'Aloo Paratha + Curd + Chai',
        lunch: 'Dal Makhani + Jeera Rice + 3 Roti + Salad',
        dinner: 'Paneer Butter Masala + Rice + 3 Roti'
      },
      weekly: weeklyObj
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  PUT /api/menu/:day  — update a single day's menu
// @access Admin
router.put('/:day', protect, adminOnly, async (req, res) => {
  try {
    const { breakfast, lunch, dinner } = req.body;
    const day = req.params.day;

    const updated = await WeeklyMenu.findOneAndUpdate(
      { day },
      { day, breakfast, lunch, dinner },
      { new: true, upsert: true, runValidators: true }
    );

    // Fetch the updated full weekly schedule to return to the frontend
    const allMenu = await WeeklyMenu.find().sort({ _id: 1 });
    const menuObj = {};
    allMenu.forEach(m => {
      menuObj[m.day] = {
        breakfast: m.breakfast,
        lunch: m.lunch,
        dinner: m.dinner
      };
    });

    res.json({ success: true, message: `${day} menu updated successfully`, updated, menu: menuObj });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @route  PUT /api/menu — bulk update entire weekly timetable
// @access Admin
router.put('/', protect, adminOnly, async (req, res) => {
  try {
    const { schedule } = req.body;
    if (!schedule || typeof schedule !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid schedule payload' });
    }

    const updatedDays = [];
    for (const [day, meals] of Object.entries(schedule)) {
      if (['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].includes(day)) {
        const item = await WeeklyMenu.findOneAndUpdate(
          { day },
          { day, breakfast: meals.breakfast || '', lunch: meals.lunch || '', dinner: meals.dinner || '' },
          { new: true, upsert: true }
        );
        updatedDays.push(item);
      }
    }

    const allMenu = await WeeklyMenu.find().sort({ _id: 1 });
    const menuObj = {};
    allMenu.forEach(m => {
      menuObj[m.day] = {
        breakfast: m.breakfast,
        lunch: m.lunch,
        dinner: m.dinner
      };
    });

    res.json({ success: true, message: 'Weekly schedule updated successfully', menu: menuObj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
