const mongoose = require('mongoose');

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
    default: 15  // 15% off for semester
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

module.exports = mongoose.model('Plan', PlanSchema);
