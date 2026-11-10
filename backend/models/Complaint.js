const mongoose = require('mongoose');
const { getModel } = require('../config/adapter');

const ComplaintSchema = new mongoose.Schema({
  ticketId: { type: String, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: { type: String, default: '' },
  userName: { type: String, default: '' },
  userEmail: { type: String, default: '' },
  userPhone: { type: String, default: '' },
  category: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ['open', 'investigating', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  resolution: { type: String, default: '' }
}, { timestamps: true });

const MongooseComplaint = mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);

module.exports = getModel('complaints', MongooseComplaint);
