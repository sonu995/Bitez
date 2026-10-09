const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Plan = require('./models/Plan');
const WeeklyMenu = require('./models/WeeklyMenu');
const ExtraItem = require('./models/ExtraItem');
const User = require('./models/User');

const plans = [
  {
    name: 'Basic',
    mealsPerDay: 1,
    description: 'Perfect for students who need 1 meal a day',
    monthlyPrice: 2499,
    semesterDiscount: 15,
    features: [
      'Lunch or Dinner (choose 1)',
      'Basic Menu Access',
      '2 Skips / Month',
      '5% OFF on Extra Orders'
    ],
    isPopular: false,
    isActive: true
  },
  {
    name: 'Standard',
    mealsPerDay: 2,
    description: 'Most popular — Lunch + Dinner daily',
    monthlyPrice: 4299,
    semesterDiscount: 15,
    features: [
      'Lunch + Dinner included',
      'Full Premium Menu',
      'Unlimited Skips & Wallet Credits',
      'Weekend Specials Included',
      '5% OFF on Extra Orders'
    ],
    isPopular: true,
    isActive: true
  },
  {
    name: 'Premium',
    mealsPerDay: 3,
    description: 'All 3 meals + snacks — the complete package',
    monthlyPrice: 5999,
    semesterDiscount: 15,
    features: [
      'Breakfast + Lunch + Dinner + Snacks',
      'Priority Delivery',
      'Free Weekly Desserts',
      'Dedicated Support',
      '5% OFF on Extra Orders'
    ],
    isPopular: false,
    isActive: true
  }
];

const weeklyMenu = [
  { day: 'Mon', breakfast: 'Aloo Paratha + Curd + Chai', lunch: 'Dal Makhani + Jeera Rice + 3 Roti + Salad', dinner: 'Paneer Butter Masala + Rice + 3 Roti' },
  { day: 'Tue', breakfast: 'Poha + Boiled Eggs + Juice', lunch: 'Chole Masala + Puri + Raita', dinner: 'Kadhai Paneer + Dal Fry + 3 Roti' },
  { day: 'Wed', breakfast: 'Idli Sambar + Coconut Chutney', lunch: 'Chicken Curry / Mix Veg + Rice + 3 Roti', dinner: 'Veg Hakka Noodles + Manchurian' },
  { day: 'Thu', breakfast: 'Bread Butter + Omelette + Chai', lunch: 'Rajma Rice + Papad + Pickle', dinner: 'Chicken Tikka Masala + Rice + 3 Roti' },
  { day: 'Fri', breakfast: 'Upma + Fruit Bowl + Juice', lunch: 'Dal Tadka + Jeera Rice + Sabji + 3 Roti', dinner: 'Veg Biryani + Raita + Salan' },
  { day: 'Sat', breakfast: 'Chole Bhature + Lassi', lunch: 'Pav Bhaji + Butter Pav', dinner: 'Egg Curry / Palak Paneer + Rice + Roti' },
  { day: 'Sun', breakfast: 'Puri Sabji + Halwa + Chai', lunch: "Special Sunday Thali (Chef's Choice)", dinner: 'Butter Chicken / Mix Veg + Naan + Gulab Jamun 🎉' }
];

const extraItems = [
  { name: 'Extra Roti (2)', price: 15, imageUrl: 'https://images.pexels.com/photos/10860591/pexels-photo-10860591.jpeg?auto=compress&cs=tinysrgb&w=150', category: 'Roti' },
  { name: 'Extra Paneer', price: 45, imageUrl: 'https://images.pexels.com/photos/9738981/pexels-photo-9738981.jpeg?auto=compress&cs=tinysrgb&w=150', category: 'Side' },
  { name: 'Gulab Jamun', price: 30, imageUrl: 'https://images.pexels.com/photos/13435133/pexels-photo-13435133.jpeg?auto=compress&cs=tinysrgb&w=150', category: 'Sweet' },
  { name: 'Fresh Curd', price: 20, imageUrl: 'https://images.pexels.com/photos/4113888/pexels-photo-4113888.jpeg?auto=compress&cs=tinysrgb&w=150', category: 'Side' },
  { name: 'Sweet Lassi', price: 35, imageUrl: 'https://images.pexels.com/photos/10153303/pexels-photo-10153303.jpeg?auto=compress&cs=tinysrgb&w=150', category: 'Beverage' },
  { name: 'Boiled Eggs (2)', price: 25, imageUrl: 'https://images.pexels.com/photos/824635/pexels-photo-824635.jpeg?auto=compress&cs=tinysrgb&w=150', category: 'Side' },
  { name: 'Mango Shake', price: 50, imageUrl: 'https://images.pexels.com/photos/3625372/pexels-photo-3625372.jpeg?auto=compress&cs=tinysrgb&w=150', category: 'Beverage' },
  { name: 'Jeera Rice', price: 40, imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=150', category: 'Side' },
  { name: 'Papad (2)', price: 10, imageUrl: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=150', category: 'Side' },
  { name: 'Achar / Pickle', price: 10, imageUrl: 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=150', category: 'Side' },
  { name: 'Butter Naan', price: 25, imageUrl: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=150', category: 'Roti' },
  { name: 'Fruit Salad', price: 55, imageUrl: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=150', category: 'Side' }
];

const adminUser = {
  name: 'Admin',
  email: 'admin@mess.com',
  password: 'admin123',
  phone: '+91 9999999999',
  role: 'admin',
  walletBalance: 0
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Clear existing data
    await Plan.deleteMany();
    await WeeklyMenu.deleteMany();
    await ExtraItem.deleteMany();
    await User.deleteMany({ role: 'admin' });

    // Seed
    await Plan.insertMany(plans);
    console.log(`✅ ${plans.length} Plans seeded`);

    await WeeklyMenu.insertMany(weeklyMenu);
    console.log(`✅ Weekly menu seeded (7 days)`);

    await ExtraItem.insertMany(extraItems);
    console.log(`✅ ${extraItems.length} Extra items seeded`);

    await User.create(adminUser);
    console.log(`✅ Admin user created — email: admin@mess.com | password: admin123`);

    console.log('\n🎉 Seed complete! Backend is ready.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
