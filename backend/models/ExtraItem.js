const mongoose = require('mongoose');

const ExtraItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  category: {
    type: String,
    default: 'General',
    enum: ['General', 'Roti', 'Sweet', 'Beverage', 'Side']
  }
}, { timestamps: true });

module.exports = mongoose.model('ExtraItem', ExtraItemSchema);
