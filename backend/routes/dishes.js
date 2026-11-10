const express = require('express');
const router = express.Router();
const Dish = require('../models/Dish');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/dishes
// @desc    Get all dishes with optional filtering, search, and sorting
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, vegOnly, sort, availableOnly, inStock } = req.query;
    let dishes = await Dish.find();

    // 1. Category Filter
    if (category && category !== 'all') {
      const catLower = category.toLowerCase().trim();
      dishes = dishes.filter(d => d.category && d.category.toLowerCase() === catLower);
    }

    // 2. Veg / Non-Veg Filter
    if (vegOnly === 'true' || vegOnly === true) {
      dishes = dishes.filter(d => d.isVeg === true);
    } else if (vegOnly === 'false' || vegOnly === false) {
      dishes = dishes.filter(d => d.isVeg === false);
    }

    // 3. Availability Filter
    if (availableOnly === 'true' || inStock === 'true') {
      dishes = dishes.filter(d => d.isAvailable !== false);
    } else if (inStock === 'false') {
      dishes = dishes.filter(d => d.isAvailable === false);
    }

    // 4. Search Query Filter
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      dishes = dishes.filter(d =>
        (d.name && d.name.toLowerCase().includes(q)) ||
        (d.description && d.description.toLowerCase().includes(q)) ||
        (d.category && d.category.toLowerCase().includes(q)) ||
        (Array.isArray(d.ingredients) && d.ingredients.some(ing => ing.toLowerCase().includes(q)))
      );
    }

    // 5. Sorting
    if (sort === 'rating') {
      dishes.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === 'price_low') {
      dishes.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_high') {
      dishes.sort((a, b) => b.price - a.price);
    } else if (sort === 'popular') {
      dishes.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    } else if (sort === 'newest') {
      dishes.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    res.json({ success: true, count: dishes.length, dishes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/dishes/stats
// @desc    Live analytics on store menu (Admin)
// @access  Admin
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const dishes = await Dish.find();
    const total = dishes.length;
    const available = dishes.filter(d => d.isAvailable !== false).length;
    const outOfStock = total - available;
    const vegCount = dishes.filter(d => d.isVeg === true).length;
    const nonVegCount = total - vegCount;
    const avgPrice = total > 0 ? Math.round(dishes.reduce((sum, d) => sum + (Number(d.price) || 0), 0) / total) : 0;

    const categories = {};
    dishes.forEach(d => {
      const cat = d.category || 'other';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    res.json({
      success: true,
      stats: {
        total,
        available,
        outOfStock,
        vegCount,
        nonVegCount,
        avgPrice,
        categories
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/dishes/:id
// @desc    Get single dish details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const targetId = req.params.id;
    let dish = await Dish.findById(targetId);
    if (!dish) dish = await Dish.findOne({ id: targetId });
    if (!dish) return res.status(404).json({ success: false, message: 'Dish not found' });
    res.json({ success: true, dish });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/dishes
// @desc    Create new dish (Admin)
// @access  Admin
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const data = { ...req.body };

    // Format ingredients if sent as comma-separated string
    if (typeof data.ingredients === 'string') {
      data.ingredients = data.ingredients.split(',').map(s => s.trim()).filter(Boolean);
    } else if (!Array.isArray(data.ingredients)) {
      data.ingredients = [];
    }

    if (data.isAvailable === undefined) {
      data.isAvailable = true;
    }

    if (data.isVeg === undefined) {
      data.isVeg = true;
    }

    if (!data.image || !data.image.trim()) {
      data.image = 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=600';
    }

    data.price = Number(data.price) || 99;
    if (data.originalPrice) data.originalPrice = Number(data.originalPrice);
    if (data.calories) data.calories = Number(data.calories);

    const dish = await Dish.create(data);
    res.status(201).json({ success: true, dish, message: `Dish "${dish.name}" created successfully!` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/dishes/:id
// @desc    Update dish (Admin)
// @access  Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const targetId = req.params.id;
    const updateData = { ...req.body };

    if (typeof updateData.ingredients === 'string') {
      updateData.ingredients = updateData.ingredients.split(',').map(s => s.trim()).filter(Boolean);
    }

    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.originalPrice !== undefined) updateData.originalPrice = Number(updateData.originalPrice);
    if (updateData.calories !== undefined) updateData.calories = Number(updateData.calories);

    let dish = await Dish.findByIdAndUpdate(targetId, updateData, { new: true });
    if (!dish) {
      dish = await Dish.findOneAndUpdate({ id: targetId }, updateData, { new: true });
    }
    if (!dish) return res.status(404).json({ success: false, message: 'Dish not found' });

    res.json({ success: true, dish, message: `Dish "${dish.name}" updated successfully!` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @route   PATCH /api/dishes/:id/toggle-availability
// @desc    Fast 1-click toggle for kitchen In-Stock / Out-of-Stock (Admin)
// @access  Admin
router.patch('/:id/toggle-availability', protect, adminOnly, async (req, res) => {
  try {
    const targetId = req.params.id;
    let dish = await Dish.findById(targetId);
    if (!dish) dish = await Dish.findOne({ id: targetId });
    if (!dish) return res.status(404).json({ success: false, message: 'Dish not found' });

    const newStatus = dish.isAvailable === false ? true : false;
    dish.isAvailable = newStatus;
    await dish.save();

    res.json({
      success: true,
      dish,
      isAvailable: newStatus,
      message: `Dish "${dish.name}" is now marked as ${newStatus ? 'In Stock (Available)' : 'Out of Stock (Sold Out)'}`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/dishes/:id
// @desc    Delete dish (Admin)
// @access  Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const targetId = req.params.id;
    let dish = await Dish.findByIdAndDelete(targetId);
    if (!dish) dish = await Dish.findOneAndDelete({ id: targetId });
    if (!dish) return res.status(404).json({ success: false, message: 'Dish not found' });

    res.json({ success: true, message: `Dish "${dish.name}" deleted successfully from menu.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
