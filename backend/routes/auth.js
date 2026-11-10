const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const { protect } = require('../middleware/auth');

// Generate JWT token
const JWT_SECRET = process.env.JWT_SECRET || 'bitez_super_secret_jwt_key_2026';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// @route  POST /api/auth/register
// @access Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, phone });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        walletBalance: user.walletBalance
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  POST /api/auth/login
// @access Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).populate('activeSubscription');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Build subscription info if exists
    let subscription = null;
    if (user.activeSubscription) {
      const sub = user.activeSubscription;
      subscription = {
        id: sub._id,
        plan: sub.planId,
        remainingMeals: sub.remainingMeals,
        expiryDate: sub.endDate,
        status: sub.status
      };
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        walletBalance: user.walletBalance,
        deliveryAddress: user.deliveryAddress || '',
        hostel: user.hostel || '',
        room: user.room || '',
        dietPreference: user.dietPreference || 'Standard Homestyle',
        activeSubscription: user.activeSubscription || subscription?.id || subscription?._id || null,
        subscription
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  GET /api/auth/me
// @access Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id || req.user.id).populate('activeSubscription');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  PUT /api/auth/profile
// @access Private
router.put('/profile', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { name, phone, deliveryAddress, hostel, room, dietPreference } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (name !== undefined) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (deliveryAddress !== undefined) user.deliveryAddress = deliveryAddress.trim();
    if (hostel !== undefined) user.hostel = hostel.trim();
    if (room !== undefined) user.room = room.trim();
    if (dietPreference !== undefined) user.dietPreference = dietPreference.trim();

    await user.save();

    res.json({
      success: true,
      message: 'Profile details updated successfully!',
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        walletBalance: user.walletBalance,
        deliveryAddress: user.deliveryAddress || '',
        hostel: user.hostel || '',
        room: user.room || '',
        dietPreference: user.dietPreference || 'Standard Homestyle'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  POST /api/auth/wallet/topup
// @access Private
router.post('/wallet/topup', protect, async (req, res) => {
  try {
    const { amount } = req.body;
    const addAmount = Number(amount);
    if (!addAmount || addAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive amount required' });
    }

    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.walletBalance = (Number(user.walletBalance) || 0) + addAmount;
    if (!Array.isArray(user.walletTransactions)) {
      user.walletTransactions = [];
    }

    const txnId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    const newTxn = {
      id: txnId,
      referenceId: txnId,
      type: 'credit',
      amount: addAmount,
      description: 'Digital Wallet Instant Top-Up',
      method: 'UPI / Online Card',
      status: 'Completed',
      date: new Date().toISOString(),
      balanceAfter: user.walletBalance
    };

    user.walletTransactions.unshift(newTxn);
    await user.save();

    res.json({
      success: true,
      message: `₹${addAmount} successfully added to wallet!`,
      walletBalance: user.walletBalance,
      transaction: newTxn
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  GET /api/auth/wallet/transactions
// @access Private
router.get('/wallet/transactions', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let transactions = Array.isArray(user.walletTransactions) ? [...user.walletTransactions] : [];

    // Also synthesize from orders
    try {
      const Order = require('../models/Order');
      const orders = await Order.find({ userId }).sort({ createdAt: -1 });

      for (const ord of orders) {
        const orderIdStr = ord.orderId || ord._id || ord.id;
        const isWallet = ord.paymentMethod && ord.paymentMethod.toLowerCase().includes('wallet');
        if (isWallet) {
          const exists = transactions.some(t => t.referenceId === orderIdStr);
          if (!exists) {
            transactions.push({
              id: `TXN-${orderIdStr}`,
              referenceId: orderIdStr,
              type: 'debit',
              amount: Number(ord.totalAmount) || 0,
              description: `Order #${String(orderIdStr).slice(-6).toUpperCase()} (${ord.orderType === 'extra_addon' ? 'Extra Add-on' : 'Food Order'})`,
              method: 'Campus Wallet',
              status: ord.status === 'cancelled' ? 'Refunded' : 'Completed',
              date: ord.createdAt || new Date().toISOString()
            });
          }
        }

        if (ord.paymentStatus === 'refunded') {
          const refExists = transactions.some(t => t.referenceId === `${orderIdStr}-REFUND`);
          if (!refExists) {
            transactions.push({
              id: `TXN-REF-${orderIdStr}`,
              referenceId: `${orderIdStr}-REFUND`,
              type: 'credit',
              amount: Number(ord.totalAmount) || 0,
              description: `Refund for Cancelled Order #${String(orderIdStr).slice(-6).toUpperCase()}`,
              method: 'Campus Wallet Refund',
              status: 'Completed',
              date: ord.updatedAt || ord.createdAt || new Date().toISOString()
            });
          }
        }
      }
    } catch (ordErr) {
      console.warn('Orders transactions synthesis warning:', ordErr.message);
    }

    // Also synthesize from skipRequests
    try {
      const { getModel } = require('../config/adapter');
      const SkipRequest = getModel('skipRequests');
      if (SkipRequest) {
        const allSkips = await SkipRequest.find();
        const userSkips = allSkips.filter(s => {
          if (s.studentId && String(s.studentId) === String(userId)) return true;
          if (user.name && s.student && s.student.toLowerCase() === user.name.toLowerCase()) return true;
          return false;
        });

        for (const sk of userSkips) {
          // If skip has no monetary credit (e.g., rollover +1 meal added), do not show in wallet transactions
          const creditAmt = Number(sk.credit || 0);
          if (creditAmt <= 0) continue;

          const skipIdStr = sk.id || sk._id;
          const exists = transactions.some(t => t.referenceId === skipIdStr);
          if (!exists) {
            transactions.push({
              id: `TXN-SKP-${skipIdStr}`,
              referenceId: skipIdStr,
              type: 'credit',
              amount: creditAmt,
              description: `Meal Skip Credit (${sk.mealSlot || 'Scheduled Meal'})`,
              method: 'Mess Skip Refund',
              status: 'Completed',
              date: sk.createdAt || sk.date || new Date().toISOString()
            });
          }
        }
      }
    } catch (skipErr) {
      console.warn('Skip requests synthesis warning:', skipErr.message);
    }

    // Sort descending by date
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json({
      success: true,
      balance: user.walletBalance || 0,
      count: transactions.length,
      transactions
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

