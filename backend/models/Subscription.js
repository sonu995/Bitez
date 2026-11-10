const mongoose = require('mongoose');
const { getModel } = require('../config/adapter');

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
  totalMeals: { type: Number, default: 60 },
  amountPaid: { type: Number, required: true },
  skippedMeals: { type: Number, default: 0 },
  walletCredits: { type: Number, default: 0 },
  hostelAddress: { type: String, default: '' },
  room: { type: String, default: '' },
  zoneCode: { type: String, default: 'NC-01' },
  dietPreference: { type: String, default: 'Standard Homestyle' }
}, { timestamps: true });

const MongooseSubscription = mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);

module.exports = getModel('subscriptions', MongooseSubscription);
