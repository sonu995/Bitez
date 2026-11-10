const mongoose = require('mongoose');
const { getModel } = require('../config/adapter');

const PlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Basic', 'Standard', 'Premium']
  },
  mealsPerDay: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  monthlyPrice: {
    type: Number,
    required: true
  },
  semesterDiscount: {
    type: Number,
    default: 15
  },
  features: {
    type: [String],
    default: []
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  activeSubscribers: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const MongoosePlan = mongoose.models.Plan || mongoose.model('Plan', PlanSchema);

module.exports = getModel('plans', MongoosePlan);
