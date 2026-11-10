const mongoose = require('mongoose');
const { getModel } = require('../config/adapter');

const DishSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  originalPrice: { type: Number, default: 0 },
  image: { type: String, default: '' },
  isVeg: { type: Boolean, default: true },
  rating: { type: Number, default: 4.5 },
  reviews: { type: Number, default: 50 },
  tag: { type: String, default: '' },
  prepTime: { type: String, default: '20-25 mins' },
  calories: { type: Number, default: 500 },
  protein: { type: String, default: '15g' },
  spiceLevel: { type: String, enum: ['Mild', 'Medium', 'Spicy'], default: 'Mild' },
  serves: { type: String, default: '1 Person' },
  ingredients: { type: [String], default: [] },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

const MongooseDish = mongoose.models.Dish || mongoose.model('Dish', DishSchema);

module.exports = getModel('dishes', MongooseDish);
