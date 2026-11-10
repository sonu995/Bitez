const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/complaints
// @desc    Get all complaints (Admin)
// @access  Admin
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json({ success: true, count: complaints.length, complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/complaints/my
// @desc    Get logged in user complaints
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.user._id || req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: complaints.length, complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/complaints/:id
// @desc    Get single complaint
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const param = req.params.id;
    let complaint = await Complaint.findOne({ ticketId: param });
    if (!complaint) complaint = await Complaint.findById(param);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    res.json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/complaints
// @desc    Create complaint ticket
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { category, subject, message, orderId, priority } = req.body;
    if (!category || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Category, subject, and message are required' });
    }

    const ticketId = 'TCK-' + Math.floor(1000 + Math.random() * 9000);

    const complaint = await Complaint.create({
      ticketId,
      userId: req.user._id || req.user.id,
      orderId: orderId || '',
      userName: req.user.name,
      userEmail: req.user.email,
      userPhone: req.user.phone || '',
      category,
      subject,
      message,
      status: 'open',
      priority: priority || 'medium'
    });

    res.status(201).json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/complaints/:id
// @desc    Update complaint status or add resolution (Admin)
// @access  Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status, resolution, priority } = req.body;
    let complaint = await Complaint.findOneAndUpdate(
      { ticketId: req.params.id },
      { ...(status ? { status } : {}), ...(resolution ? { resolution } : {}), ...(priority ? { priority } : {}) },
      { new: true }
    );

    if (!complaint) {
      complaint = await Complaint.findByIdAndUpdate(
        req.params.id,
        { ...(status ? { status } : {}), ...(resolution ? { resolution } : {}), ...(priority ? { priority } : {}) },
        { new: true }
      );
    }

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
