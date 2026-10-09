const mongoose = require('mongoose');

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

module.exports = mongoose.model('WeeklyMenu', WeeklyMenuSchema);
