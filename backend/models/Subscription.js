const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'semester'],
    default: 'monthly'
  },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['active', 'paused', 'expired', 'cancelled'],
    default: 'active'
  },
  remainingMeals: { type: Number, default: 0 },
  amountPaid: { type: Number, required: true },
  skippedMeals: { type: Number, default: 0 },
  walletCredits: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', SubscriptionSchema);
