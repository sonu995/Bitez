const mongoose = require('mongoose');
const { getModel } = require('../config/adapter');

const WeeklyMenuSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    unique: true
  },
  breakfast: { type: String, required: true },
  lunch: { type: String, required: true },
  dinner: { type: String, required: true }
}, { timestamps: true });

const MongooseWeeklyMenu = mongoose.models.WeeklyMenu || mongoose.model('WeeklyMenu', WeeklyMenuSchema);

module.exports = getModel('weeklyMenu', MongooseWeeklyMenu);
