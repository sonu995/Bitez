const mongoose = require('mongoose');
const { getModel } = require('../config/adapter');

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerName: { type: String, default: '' },
  customerPhone: { type: String, default: '' },
  restaurant: { type: String, default: 'Healthy Mess & Kitchen' },
  items: [
    {
      id: String,
      name: String,
      price: Number,
      quantity: Number,
      isVeg: { type: Boolean, default: true },
      image: String
    }
  ],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['confirmed', 'preparing', 'on-the-way', 'delivered', 'cancelled'],
    default: 'confirmed'
  },
  deliveryAddress: { type: String, required: true },
  paymentMethod: { type: String, default: 'Cash on Delivery' },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  estimatedMinutes: { type: Number, default: 35 },
  isExtraOrder: { type: Boolean, default: false },
  orderType: { type: String, default: 'regular' },
  isSubscriber: { type: Boolean, default: false },
  subscriptionPlan: { type: String, default: '' },
  subscriptionId: { type: String, default: '' },
  mealSlot: { type: String, default: 'Instant' },
  mealId: { type: String, default: '' },
  notes: { type: String, default: '' },
  deliverWithMeal: { type: Boolean, default: false },
  attachedMealSlot: { type: String, default: '' },
  attachedMealDate: { type: String, default: '' },
  packingStatus: { type: String, default: 'unpacked' },
  deliveryPartner: {
    name: { type: String, default: 'Rahul Kumar' },
    phone: { type: String, default: '+91 87654 32109' },
    vehicle: { type: String, default: 'Motorcycle - DL 12 AB 3456' }
  },
  otp: { type: String, default: '4821' },
  deliveredAt: { type: String, default: null }
}, { timestamps: true });

const MongooseOrder = mongoose.models.Order || mongoose.model('Order', OrderSchema);

module.exports = getModel('orders', MongooseOrder);
