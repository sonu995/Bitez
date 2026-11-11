const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/extras', require('./routes/extras'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/dishes', require('./routes/dishes'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/rider', require('./routes/rider'));
app.use('/api/kitchen', require('./routes/kitchen'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '🚀 Mess App Backend running!', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
