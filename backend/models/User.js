const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { getModel } = require('../config/adapter');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, default: '' },
  role: {
    type: String,
    enum: ['customer', 'admin', 'delivery'],
    default: 'customer'
  },
  walletBalance: { type: Number, default: 0 },
  activeSubscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    default: null
  },
  deliveryAddress: { type: String, default: '' },
  hostel: { type: String, default: '' },
  room: { type: String, default: '' },
  dietPreference: { type: String, default: 'Standard Homestyle' },
  walletTransactions: { type: Array, default: [] }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const MongooseUser = mongoose.models.User || mongoose.model('User', UserSchema);

module.exports = getModel('users', MongooseUser);
