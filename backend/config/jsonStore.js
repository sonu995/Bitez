const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const generateId = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const random = 'xxxxxxxxxxxxxxxx'.replace(/x/g, () => Math.floor(Math.random() * 16).toString(16));
  return timestamp + random; // 24-character hex ID matching MongoDB ObjectId format
};

const defaultSeedData = () => {
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);

  const adminId = '666600000000000000000001';
  const plan1Id = '666611110000000000000001';
  const plan2Id = '666611110000000000000002';
  const plan3Id = '666611110000000000000003';

  return {
    users: [
      {
        _id: adminId,
        id: adminId,
        name: 'Admin Master',
        email: 'admin@mess.com',
        password: adminPasswordHash,
        phone: '+91 99999 99999',
        role: 'admin',
        walletBalance: 0,
        activeSubscription: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    plans: [
      {
        _id: plan1Id,
        id: plan1Id,
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
        isActive: true,
        activeSubscribers: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: plan2Id,
        id: plan2Id,
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
        isActive: true,
        activeSubscribers: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: plan3Id,
        id: plan3Id,
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
        isActive: true,
        activeSubscribers: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    weeklyMenu: [
      { _id: generateId(), day: 'Mon', breakfast: 'Aloo Paratha + Curd + Chai', lunch: 'Dal Makhani + Jeera Rice + 3 Roti + Salad', dinner: 'Paneer Butter Masala + Rice + 3 Roti' },
      { _id: generateId(), day: 'Tue', breakfast: 'Poha + Boiled Eggs + Juice', lunch: 'Chole Masala + Puri + Raita', dinner: 'Kadhai Paneer + Dal Fry + 3 Roti' },
      { _id: generateId(), day: 'Wed', breakfast: 'Idli Sambar + Coconut Chutney', lunch: 'Chicken Curry / Mix Veg + Rice + 3 Roti', dinner: 'Veg Hakka Noodles + Manchurian' },
      { _id: generateId(), day: 'Thu', breakfast: 'Bread Butter + Omelette + Chai', lunch: 'Rajma Rice + Papad + Pickle', dinner: 'Chicken Tikka Masala + Rice + 3 Roti' },
      { _id: generateId(), day: 'Fri', breakfast: 'Upma + Fruit Bowl + Juice', lunch: 'Dal Tadka + Jeera Rice + Sabji + 3 Roti', dinner: 'Veg Biryani + Raita + Salan' },
      { _id: generateId(), day: 'Sat', breakfast: 'Chole Bhature + Lassi', lunch: 'Pav Bhaji + Butter Pav', dinner: 'Egg Curry / Palak Paneer + Rice + Roti' },
      { _id: generateId(), day: 'Sun', breakfast: 'Puri Sabji + Halwa + Chai', lunch: "Special Sunday Thali (Chef's Choice)", dinner: 'Butter Chicken / Mix Veg + Naan + Gulab Jamun 🎉' }
    ],
    extraItems: [
      { _id: generateId(), name: 'Extra Roti (2)', price: 15, imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=compress&cs=tinysrgb&w=300', category: 'Roti', isActive: true },
      { _id: generateId(), name: 'Extra Paneer', price: 45, imageUrl: 'https://images.pexels.com/photos/9738981/pexels-photo-9738981.jpeg?auto=compress&cs=tinysrgb&w=150', category: 'Side', isActive: true },
      { _id: generateId(), name: 'Gulab Jamun', price: 30, imageUrl: 'https://images.pexels.com/photos/13435133/pexels-photo-13435133.jpeg?auto=compress&cs=tinysrgb&w=150', category: 'Sweet', isActive: true },
      { _id: generateId(), name: 'Fresh Curd', price: 20, imageUrl: 'https://images.pexels.com/photos/4113888/pexels-photo-4113888.jpeg?auto=compress&cs=tinysrgb&w=150', category: 'Side', isActive: true },
      { _id: generateId(), name: 'Sweet Lassi', price: 35, imageUrl: 'https://images.pexels.com/photos/10153303/pexels-photo-10153303.jpeg?auto=compress&cs=tinysrgb&w=150', category: 'Beverage', isActive: true },
      { _id: generateId(), name: 'Boiled Eggs (2)', price: 25, imageUrl: 'https://images.pexels.com/photos/824635/pexels-photo-824635.jpeg?auto=compress&cs=tinysrgb&w=150', category: 'Side', isActive: true },
      { _id: generateId(), name: 'Mango Shake', price: 50, imageUrl: 'https://images.pexels.com/photos/3625372/pexels-photo-3625372.jpeg?auto=compress&cs=tinysrgb&w=150', category: 'Beverage', isActive: true },
      { _id: generateId(), name: 'Jeera Rice', price: 40, imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=150', category: 'Side', isActive: true },
      { _id: generateId(), name: 'Papad (2)', price: 10, imageUrl: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=150', category: 'Side', isActive: true },
      { _id: generateId(), name: 'Achar / Pickle', price: 10, imageUrl: 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=150', category: 'Side', isActive: true },
      { _id: generateId(), name: 'Butter Naan', price: 25, imageUrl: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=150', category: 'Roti', isActive: true },
      { _id: generateId(), name: 'Fruit Salad', price: 55, imageUrl: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=150', category: 'Side', isActive: true }
    ],
    subscriptions: [],
    orders: [],
    complaints: [],
    dishes: [
      {
        _id: 'dish_01',
        id: 'dish_01',
        name: 'Special Shahi Paneer Thali',
        category: 'thali',
        description: 'Velvety Shahi Paneer, Dal Makhani, Jeera Rice, 4 Butter Tawa Rotis, Fresh Salad, Mint Chutney & Gulab Jamun.',
        price: 160,
        originalPrice: 200,
        image: 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=600',
        isVeg: true,
        rating: 4.8,
        reviews: 580,
        tag: 'Bestseller 🔥',
        prepTime: '20-25 mins',
        calories: 680,
        protein: '24g',
        spiceLevel: 'Mild',
        serves: '1-2 Persons',
        ingredients: ['Fresh Paneer', 'Desi Ghee', 'Basmati Rice', 'Butter Roti', 'Dal Makhani', 'Gulab Jamun'],
        isAvailable: true
      },
      {
        _id: 'dish_02',
        id: 'dish_02',
        name: 'Hyderabadi Dum Chicken Biryani',
        category: 'biryani',
        description: 'Slow-cooked aromatic basmati rice with succulent chicken marinated in royal spices, accompanied by Mirchi Ka Salan and creamy Raita.',
        price: 199,
        originalPrice: 249,
        image: 'https://images.pexels.com/photos/7394819/pexels-photo-7394819.jpeg?auto=compress&cs=tinysrgb&w=600',
        isVeg: false,
        rating: 4.9,
        reviews: 820,
        tag: 'Chef Special 👑',
        prepTime: '20-25 mins',
        calories: 720,
        protein: '36g',
        spiceLevel: 'Spicy',
        serves: '1 Person',
        ingredients: ['Tender Chicken', 'Long-grain Basmati Rice', 'Saffron', 'Brown Onions', 'Mint'],
        isAvailable: true
      },
      {
        _id: 'dish_03',
        id: 'dish_03',
        name: 'Homestyle Veg Thali',
        category: 'thali',
        description: 'Simple and comforting home meal: Yellow Dal Tadka, Aloo Gobhi Matar, Steamed Rice, 4 Phulkas, Pickle & Crunchy Papad.',
        price: 110,
        originalPrice: 140,
        image: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=600',
        isVeg: true,
        rating: 4.7,
        reviews: 490,
        tag: 'Homestyle ❤️',
        prepTime: '15-20 mins',
        calories: 520,
        protein: '16g',
        spiceLevel: 'Mild',
        serves: '1 Person',
        ingredients: ['Yellow Dal', 'Seasonal Veggies', 'Steamed Rice', 'Soft Phulkas', 'Papad', 'Homemade Pickle'],
        isAvailable: true
      },
      {
        _id: 'dish_04',
        id: 'dish_04',
        name: 'Butter Chicken with 2 Butter Naan',
        category: 'curries',
        description: 'Tender roasted chicken tikka submerged in a silky, buttery tomato-cashew gravy served hot with 2 soft tandoori butter naans.',
        price: 220,
        originalPrice: 280,
        image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=600',
        isVeg: false,
        rating: 4.8,
        reviews: 640,
        tag: 'Top Rated ⭐',
        prepTime: '20-25 mins',
        calories: 780,
        protein: '38g',
        spiceLevel: 'Medium',
        serves: '1-2 Persons',
        ingredients: ['Boneless Chicken', 'Cashew Paste', 'Fresh Cream', 'Amul Butter', 'Tandoori Naan'],
        isAvailable: true
      },
      {
        _id: 'dish_05',
        id: 'dish_05',
        name: 'Dal Makhani & Jeera Rice Bowl',
        category: 'curries',
        description: 'Slow-simmered black lentils cooked overnight with cream and butter, paired with fragrant cumin basmati rice and onion rings.',
        price: 130,
        originalPrice: 160,
        image: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=600',
        isVeg: true,
        rating: 4.6,
        reviews: 320,
        tag: 'Comfort Food 🍲',
        prepTime: '15-20 mins',
        calories: 560,
        protein: '19g',
        spiceLevel: 'Mild',
        serves: '1 Person',
        ingredients: ['Urad Dal', 'Rajma', 'Makhan Butter', 'Cumin Rice', 'Garlic Tadka'],
        isAvailable: true
      },
      {
        _id: 'dish_06',
        id: 'dish_06',
        name: 'Crispy Veg Supreme Burger',
        category: 'burgers',
        description: 'Crispy herb potato patty topped with melted cheese, iceberg lettuce, pickled onions & tandoori mayo in a toasted brioche bun.',
        price: 89,
        originalPrice: 119,
        image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=600',
        isVeg: true,
        rating: 4.5,
        reviews: 410,
        tag: 'Crunchy 🍔',
        prepTime: '15-20 mins',
        calories: 450,
        protein: '12g',
        spiceLevel: 'Mild',
        serves: '1 Person',
        ingredients: ['Crispy Veg Patty', 'Brioche Bun', 'Cheese Slice', 'Lettuce', 'Chipotle Sauce'],
        isAvailable: true
      },
      {
        _id: 'dish_07',
        id: 'dish_07',
        name: 'Crispy Chicken Zinger Burger',
        category: 'burgers',
        description: 'Golden fried chicken breast fillet with extreme crunch, creamy garlic mayo and pickled gherkins in a soft sesame bun.',
        price: 139,
        originalPrice: 179,
        image: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=600',
        isVeg: false,
        rating: 4.7,
        reviews: 620,
        tag: 'Bestseller 🔥',
        prepTime: '15-20 mins',
        calories: 540,
        protein: '28g',
        spiceLevel: 'Medium',
        serves: '1 Person',
        ingredients: ['Crispy Chicken Fillet', 'Sesame Bun', 'Garlic Mayo', 'Iceberg Lettuce'],
        isAvailable: true
      },
      {
        _id: 'dish_08',
        id: 'dish_08',
        name: 'Double Egg Chicken Kathi Roll',
        category: 'rolls',
        description: 'Flaky layered paratha lined with double egg, packed with juicy spiced chicken chunks, green chutney, onions & chaat masala.',
        price: 120,
        originalPrice: 150,
        image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=600',
        isVeg: false,
        rating: 4.8,
        reviews: 730,
        tag: 'Street Legend 🌯',
        prepTime: '15-20 mins',
        calories: 580,
        protein: '32g',
        spiceLevel: 'Medium',
        serves: '1 Person',
        ingredients: ['Paratha', '2 Farm Eggs', 'Tandoori Chicken', 'Mint Chutney', 'Lachha Onion'],
        isAvailable: true
      },
      {
        _id: 'dish_09',
        id: 'dish_09',
        name: 'Paneer Tikka Roll',
        category: 'rolls',
        description: 'Soft rumali wrap filled with chargrilled cottage cheese, bell peppers, crunchy onions and tangy yogurt dressing.',
        price: 99,
        originalPrice: 130,
        image: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=600',
        isVeg: true,
        rating: 4.6,
        reviews: 380,
        tag: 'Popular ⭐',
        prepTime: '15-20 mins',
        calories: 460,
        protein: '20g',
        spiceLevel: 'Medium',
        serves: '1 Person',
        ingredients: ['Tandoori Paneer', 'Wrap', 'Bell Peppers', 'Mint Sauce', 'Chaat Masala'],
        isAvailable: true
      },
      {
        _id: 'dish_10',
        id: 'dish_10',
        name: 'Steamed Darjeeling Chicken Momos (8 Pcs)',
        category: 'momos',
        description: 'Thin-skinned dumplings packed with minced seasoned chicken, scallions and ginger, served with fiery roasted red chili sauce.',
        price: 99,
        originalPrice: 130,
        image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=600',
        isVeg: false,
        rating: 4.7,
        reviews: 510,
        tag: 'Fiery 🌶️',
        prepTime: '15-20 mins',
        calories: 380,
        protein: '22g',
        spiceLevel: 'Spicy',
        serves: '1-2 Persons',
        ingredients: ['Minced Chicken', 'Spring Onions', 'Sesame Oil', 'Red Chili Dip'],
        isAvailable: true
      },
      {
        _id: 'dish_11',
        id: 'dish_11',
        name: 'Street Style Veg Hakka Chowmein',
        category: 'chinese',
        description: 'Wok-tossed noodles with shredded cabbage, bell peppers, carrots and spring onions in dark soya garlic sauce.',
        price: 80,
        originalPrice: 105,
        image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=600',
        isVeg: true,
        rating: 4.4,
        reviews: 340,
        tag: 'Desi Chinese 🍜',
        prepTime: '15-20 mins',
        calories: 420,
        protein: '11g',
        spiceLevel: 'Medium',
        serves: '1 Person',
        ingredients: ['Eggless Noodles', 'Capsicum', 'Cabbage', 'Garlic', 'Chili Sauce', 'Soya Sauce'],
        isAvailable: true
      },
      {
        _id: 'dish_12',
        id: 'dish_12',
        name: 'Peri Peri Masala French Fries',
        category: 'fries',
        description: 'Crispy golden potato fries generously tossed in African bird’s eye chili seasoning with a side of cheesy mayo.',
        price: 69,
        originalPrice: 90,
        image: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=600',
        isVeg: true,
        rating: 4.5,
        reviews: 290,
        tag: 'Snack Pick 🍟',
        prepTime: '10-15 mins',
        calories: 340,
        protein: '5g',
        spiceLevel: 'Spicy',
        serves: '1 Person',
        ingredients: ['Golden Potatoes', 'Peri Peri Spice Mix', 'Herbs', 'Cheese Dip'],
        isAvailable: true
      },
      {
        _id: 'dish_13',
        id: 'dish_13',
        name: 'Crispy Butter Masala Dosa',
        category: 'south-indian',
        description: 'Golden crunchy rice crepe smeared with red chutney and spiced potato masala, served with piping hot sambar & coconut chutney.',
        price: 95,
        originalPrice: 120,
        image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=600',
        isVeg: true,
        rating: 4.7,
        reviews: 430,
        tag: 'South Indian 🫔',
        prepTime: '15-20 mins',
        calories: 410,
        protein: '12g',
        spiceLevel: 'Mild',
        serves: '1 Person',
        ingredients: ['Fermented Batter', 'Amul Butter', 'Aloo Masala', 'Toor Dal Sambar', 'Coconut Chutney'],
        isAvailable: true
      },
      {
        _id: 'dish_14',
        id: 'dish_14',
        name: 'Farmhouse Cheesy Overload Pizza (8 inch)',
        category: 'pizza',
        description: 'Hand-tossed crust loaded with 100% mozzarella, sweet corn, black olives, onions, bell peppers and Italian oregano herb sauce.',
        price: 199,
        originalPrice: 249,
        image: 'https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg?auto=compress&cs=tinysrgb&w=600',
        isVeg: true,
        rating: 4.8,
        reviews: 510,
        tag: 'Cheesy Delight 🍕',
        prepTime: '20-25 mins',
        calories: 680,
        protein: '22g',
        spiceLevel: 'Mild',
        serves: '1-2 Persons',
        ingredients: ['Hand Tossed Dough', 'Mozzarella Cheese', 'Sweet Corn', 'Black Olives', 'Marinara Sauce'],
        isAvailable: true
      },
      {
        _id: 'dish_15',
        id: 'dish_15',
        name: 'High Protein Paneer Sprouts Salad',
        category: 'healthy',
        description: 'Boiled moong sprouts, fresh paneer cubes, cucumber, cherry tomatoes, pomegranate seeds and roasted peanut lemon dressing.',
        price: 120,
        originalPrice: 150,
        image: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=600',
        isVeg: true,
        rating: 4.6,
        reviews: 210,
        tag: 'Diet Special 🥗',
        prepTime: '10-15 mins',
        calories: 320,
        protein: '26g',
        spiceLevel: 'Mild',
        serves: '1 Person',
        ingredients: ['Green Moong Sprouts', 'Raw Paneer', 'Cucumber', 'Pomegranate', 'Lemon Herb Dressing'],
        isAvailable: true
      },
      {
        _id: 'dish_16',
        id: 'dish_16',
        name: 'Hot Gulab Jamun (2 Pcs)',
        category: 'desserts',
        description: 'Soft milk solids mawa dumplings dipped in fragrant saffron cardamom syrup, served piping hot.',
        price: 35,
        originalPrice: 50,
        image: 'https://images.pexels.com/photos/13435133/pexels-photo-13435133.jpeg?auto=compress&cs=tinysrgb&w=600',
        isVeg: true,
        rating: 4.9,
        reviews: 640,
        tag: 'Sweet Tooth 🍨',
        prepTime: '5 mins',
        calories: 280,
        protein: '6g',
        spiceLevel: 'Mild',
        serves: '1 Person',
        ingredients: ['Khoya Mawa', 'Cardamom', 'Kesar Sugar Syrup', 'Pistachio Flakes'],
        isAvailable: true
      },
      {
        _id: 'dish_17',
        id: 'dish_17',
        name: 'Thick Alphonso Mango Shake (350ml)',
        category: 'beverages',
        description: 'Blended with premium Alphonso mango pulp, chilled rich milk and a scoop of vanilla ice cream with cashew garnishing.',
        price: 70,
        originalPrice: 90,
        image: 'https://images.pexels.com/photos/3625372/pexels-photo-3625372.jpeg?auto=compress&cs=tinysrgb&w=600',
        isVeg: true,
        rating: 4.8,
        reviews: 470,
        tag: 'Chilled 🥤',
        prepTime: '5-10 mins',
        calories: 290,
        protein: '7g',
        spiceLevel: 'Mild',
        serves: '1 Person',
        ingredients: ['Alphonso Mango Pulp', 'Full Cream Milk', 'Vanilla Ice Cream', 'Dry Fruits'],
        isAvailable: true
      }
    ],
    coupons: [
      { id: 'CPN001', code: 'MESS20', type: 'Percentage', value: 20, minOrder: 149, usage: 45, maxUsage: 100, expiry: '2026-12-31', status: 'active', desc: 'Flat 20% OFF on all orders' },
      { id: 'CPN002', code: 'SAVE50', type: 'Flat', value: 50, minOrder: 199, usage: 78, maxUsage: 200, expiry: '2026-12-31', status: 'active', desc: 'Flat ₹50 OFF on orders above ₹199' },
      { id: 'CPN003', code: 'FIRSTORDER', type: 'Percentage', value: 25, minOrder: 99, usage: 132, maxUsage: 500, expiry: '2026-12-31', status: 'active', desc: 'Welcome bonus 25% OFF' }
    ],
    deliveryZones: [
      {
        id: 'ZONE-01',
        _id: 'ZONE-01',
        name: 'North Campus Hostels',
        code: 'NC-01',
        pincode: '110007',
        areas: ['Tagore Hostel', 'Raman Hostel', 'Aryabhatta Block', 'Patel Hall', 'Subhash PG'],
        deliveryCharge: 0,
        timingSlots: { lunch: '12:15 PM - 01:15 PM', dinner: '07:30 PM - 08:30 PM' },
        assignedRider: 'Unassigned',
        dailyTiffinCapacity: 120,
        activeDeliveries: 38,
        status: 'active'
      },
      {
        id: 'ZONE-02',
        _id: 'ZONE-02',
        name: 'South Campus Hostels',
        code: 'SC-02',
        pincode: '110021',
        areas: ['Kasturba Hostel', 'Sarojini Hall', 'Gargi Ext.', 'Maitreyi PG Wing'],
        deliveryCharge: 0,
        timingSlots: { lunch: '12:30 PM - 01:30 PM', dinner: '07:45 PM - 08:45 PM' },
        assignedRider: 'Unassigned',
        dailyTiffinCapacity: 90,
        activeDeliveries: 24,
        status: 'active'
      },
      {
        id: 'ZONE-03',
        _id: 'ZONE-03',
        name: 'Mukherjee Nagar & GTB PG Hub',
        code: 'MN-03',
        pincode: '110009',
        areas: ['Batra Cinema Lane', 'Nehru Vihar PGs', 'Christian Colony', 'Indra Vihar'],
        deliveryCharge: 15,
        timingSlots: { lunch: '01:00 PM - 02:00 PM', dinner: '08:00 PM - 09:00 PM' },
        assignedRider: 'Unassigned',
        dailyTiffinCapacity: 150,
        activeDeliveries: 45,
        status: 'active'
      },
      {
        id: 'ZONE-04',
        _id: 'ZONE-04',
        name: 'Vijay Nagar & Hudson Lane',
        code: 'VJ-04',
        pincode: '110009',
        areas: ['Double Storey PGs', 'Single Storey', 'Outram Lines', 'Kingsway Camp'],
        deliveryCharge: 0,
        timingSlots: { lunch: '01:15 PM - 02:15 PM', dinner: '08:15 PM - 09:15 PM' },
        assignedRider: 'Unassigned',
        dailyTiffinCapacity: 100,
        activeDeliveries: 31,
        status: 'active'
      }
    ],
    riders: [],
    deliveryRoutes: [
      {
        id: 'ROUTE-NORTH',
        _id: 'ROUTE-NORTH',
        name: 'Route 1: North Campus Hub',
        zone: 'North Campus (NC-01)',
        hostels: ['Tagore Hostel', 'Raman Hostel', 'Subhash PG'],
        assignedRider: 'Unassigned',
        tiffinCount: 0,
        deliveredCount: 0,
        status: 'available',
        slot: 'Lunch',
        eta: '12:45 PM'
      },
      {
        id: 'ROUTE-SOUTH',
        _id: 'ROUTE-SOUTH',
        name: 'Route 2: Girls Hostel Complex',
        zone: 'South Campus (SC-02)',
        hostels: ['Kasturba Hostel', 'Sarojini Hostel', 'Pooja PG'],
        assignedRider: 'Unassigned',
        tiffinCount: 0,
        deliveredCount: 0,
        status: 'available',
        slot: 'Lunch',
        eta: '12:30 PM'
      },
      {
        id: 'ROUTE-MUKHERJEE',
        _id: 'ROUTE-MUKHERJEE',
        name: 'Route 3: Mukherjee Nagar Students PG',
        zone: 'Mukherjee Nagar (MN-03)',
        hostels: ['Block A Boys PG', 'Block B Girls PG', 'Saraswati Complex'],
        assignedRider: 'Mahesh Singh',
        tiffinCount: 0,
        deliveredCount: 0,
        status: 'available',
        slot: 'Lunch',
        eta: '01:05 PM'
      }
    ],
    dispatchRoster: [],
    skipRequests: []
  };
};

class JSONStore {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
        // Ensure all collections exist
        const defaults = defaultSeedData();
        for (const key of Object.keys(defaults)) {
          if (this.data[key] === undefined) {
            this.data[key] = defaults[key];
          }
        }
        this.save();
      } else {
        this.data = defaultSeedData();
        this.save();
      }
    } catch (err) {
      console.warn('⚠️ Could not load existing db.json, generating default seed:', err.message);
      this.data = defaultSeedData();
      this.save();
    }
  }

  reload() {
    this.init();
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('❌ Error saving to db.json:', err.message);
    }
  }

  getCollection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
    }
    return this.data[name];
  }
}

const store = new JSONStore();

// Attach document helper methods to match Mongoose doc interface
function wrapDoc(doc, collectionName) {
  if (!doc) return null;
  const wrapped = { ...doc };

  // Make sure both _id and id are accessible
  if (wrapped._id && !wrapped.id) wrapped.id = wrapped._id;
  if (wrapped.id && !wrapped._id) wrapped._id = wrapped.id;

  // matchPassword method for User docs
  if (collectionName === 'users') {
    wrapped.matchPassword = async function (enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password);
    };
  }

  // save method for updating self
  wrapped.save = async function () {
    const coll = store.getCollection(collectionName);
    const idx = coll.findIndex(item => 
      (this._id && String(item._id) === String(this._id)) ||
      (this.id && (String(item.id) === String(this.id) || String(item._id) === String(this.id))) ||
      (this.orderId && (String(item.orderId) === String(this.orderId) || String(item.id) === String(this.orderId)))
    );
    if (idx !== -1) {
      this.updatedAt = new Date().toISOString();
      coll[idx] = { ...this };
      store.save();
    }
    return this;
  };

  // populate method
  wrapped.populate = async function (field) {
    if (field === 'planId' && this.planId) {
      const planIdStr = typeof this.planId === 'object' && this.planId ? (this.planId._id || this.planId.id) : this.planId;
      const plan = store.getCollection('plans').find(p => String(p._id) === String(planIdStr) || String(p.id) === String(planIdStr));
      if (plan) this.planId = wrapDoc(plan, 'plans');
    }
    if (field === 'userId' && this.userId) {
      const userIdStr = typeof this.userId === 'object' && this.userId ? (this.userId._id || this.userId.id) : this.userId;
      const user = store.getCollection('users').find(u => String(u._id) === String(userIdStr) || String(u.id) === String(userIdStr));
      if (user) this.userId = wrapDoc(user, 'users');
    }
    if (field === 'activeSubscription' && this.activeSubscription) {
      const subIdStr = typeof this.activeSubscription === 'object' && this.activeSubscription ? (this.activeSubscription._id || this.activeSubscription.id) : this.activeSubscription;
      const sub = store.getCollection('subscriptions').find(s => String(s._id) === String(subIdStr) || String(s.id) === String(subIdStr));
      if (sub) this.activeSubscription = wrapDoc(sub, 'subscriptions');
    }
    return this;
  };

  return wrapped;
}

// Helper to filter documents
function matchesFilter(item, filter) {
  if (!filter || Object.keys(filter).length === 0) return true;
  for (const [key, val] of Object.entries(filter)) {
    if (key === '$or' && Array.isArray(val)) {
      if (!val.some(subFilter => matchesFilter(item, subFilter))) return false;
      continue;
    }
    if (key === '$and' && Array.isArray(val)) {
      if (!val.every(subFilter => matchesFilter(item, subFilter))) return false;
      continue;
    }
    if (key === '_id' || key === 'id') {
      if (typeof val === 'object' && val !== null && val.$in && Array.isArray(val.$in)) {
        const itemIds = [String(item._id || ''), String(item.id || '')];
        if (!val.$in.some(id => itemIds.includes(String(id)))) return false;
      } else {
        if (String(item._id) !== String(val) && String(item.id) !== String(val)) return false;
      }
    } else if (typeof val === 'object' && val !== null && !(val instanceof Date)) {
      if (val.$in && Array.isArray(val.$in)) {
        const itemVal = item[key];
        const inMatch = val.$in.some(v => String(v).toLowerCase() === String(itemVal).toLowerCase() || v === itemVal);
        if (!inMatch) return false;
      } else if (val.$nin && Array.isArray(val.$nin)) {
        const itemVal = item[key];
        const inMatch = val.$nin.some(v => String(v).toLowerCase() === String(itemVal).toLowerCase() || v === itemVal);
        if (inMatch) return false;
      } else if (val.$ne !== undefined) {
        if (item[key] === val.$ne || String(item[key]) === String(val.$ne)) return false;
      } else if (val.$regex) {
        const reg = new RegExp(val.$regex, val.$options || '');
        if (!reg.test(String(item[key] || ''))) return false;
      } else if (val.$exists !== undefined) {
        const exists = item[key] !== undefined && item[key] !== null;
        if (Boolean(val.$exists) !== exists) return false;
      } else {
        if (item[key] !== val && String(item[key]) !== String(val)) return false;
      }
    } else {
      if (item[key] !== val && String(item[key]) !== String(val)) return false;
    }
  }
  return true;
}

// Chainable Query Builder for Mock Mongoose Queries
class QueryBuilder {
  constructor(collectionName, filter = {}, action = 'find') {
    this.collectionName = collectionName;
    this.filter = filter;
    this.action = action;
    this.populateFields = [];
    this.sortField = null;
    this.sortAsc = true;
    this.excludedFields = [];
  }

  populate(field, select) {
    this.populateFields.push({ field, select });
    return this;
  }

  sort(sortObj) {
    if (sortObj && typeof sortObj === 'object') {
      const firstKey = Object.keys(sortObj)[0];
      this.sortField = firstKey;
      this.sortAsc = sortObj[firstKey] === 1 || sortObj[firstKey] === 'asc';
    }
    return this;
  }

  select(fieldsStr) {
    if (typeof fieldsStr === 'string') {
      fieldsStr.split(' ').forEach(f => {
        if (f.startsWith('-')) {
          this.excludedFields.push(f.slice(1));
        }
      });
    }
    return this;
  }

  async exec() {
    const coll = store.getCollection(this.collectionName);

    if (this.action === 'findOne' || this.action === 'findById') {
      const found = coll.find(item => matchesFilter(item, this.filter));
      if (!found) return null;
      let doc = wrapDoc(found, this.collectionName);

      for (const pop of this.populateFields) {
        await doc.populate(pop.field);
      }

      for (const excl of this.excludedFields) {
        delete doc[excl];
      }
      return doc;
    }

    // Default: find()
    let results = coll.filter(item => matchesFilter(item, this.filter));

    if (this.sortField) {
      results.sort((a, b) => {
        const valA = a[this.sortField] ?? '';
        const valB = b[this.sortField] ?? '';
        if (valA < valB) return this.sortAsc ? -1 : 1;
        if (valA > valB) return this.sortAsc ? 1 : -1;
        return 0;
      });
    }

    results = results.map(r => wrapDoc(r, this.collectionName));

    for (const doc of results) {
      for (const pop of this.populateFields) {
        await doc.populate(pop.field);
      }
      for (const excl of this.excludedFields) {
        delete doc[excl];
      }
    }

    return results;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }
}

// Model wrapper exposing Mongoose-identical API
function createJSONModel(collectionName) {
  return {
    find(filter = {}) {
      return new QueryBuilder(collectionName, filter, 'find');
    },

    findOne(filter = {}) {
      return new QueryBuilder(collectionName, filter, 'findOne');
    },

    findById(id) {
      return new QueryBuilder(collectionName, { _id: String(id) }, 'findById');
    },

    async create(data) {
      const coll = store.getCollection(collectionName);
      let newDoc = { ...data };

      if (!newDoc._id) newDoc._id = generateId();
      if (!newDoc.id) newDoc.id = newDoc._id;
      newDoc.createdAt = new Date().toISOString();
      newDoc.updatedAt = new Date().toISOString();

      // If User model, hash password if plain text
      if (collectionName === 'users' && newDoc.password && !newDoc.password.startsWith('$2')) {
        newDoc.password = await bcrypt.hash(newDoc.password, 10);
      }

      coll.push(newDoc);
      store.save();
      return wrapDoc(newDoc, collectionName);
    },

    async findByIdAndUpdate(id, update, options = {}) {
      const coll = store.getCollection(collectionName);
      const idx = coll.findIndex(item => String(item._id) === String(id) || String(item.id) === String(id));
      if (idx === -1) return null;

      let current = coll[idx];
      let updated = { ...current };

      // Handle MongoDB update operators like $inc, or plain object updates
      for (const [key, val] of Object.entries(update)) {
        if (key === '$inc') {
          for (const [incKey, incVal] of Object.entries(val)) {
            updated[incKey] = (Number(updated[incKey]) || 0) + Number(incVal);
          }
        } else if (key === '$set') {
          Object.assign(updated, val);
        } else {
          updated[key] = val;
        }
      }

      updated.updatedAt = new Date().toISOString();
      coll[idx] = updated;
      store.save();
      return wrapDoc(updated, collectionName);
    },

    async findOneAndUpdate(filter, update, options = {}) {
      const coll = store.getCollection(collectionName);
      let idx = coll.findIndex(item => matchesFilter(item, filter));

      if (idx === -1) {
        if (options.upsert) {
          return await this.create({ ...filter, ...update });
        }
        return null;
      }

      let current = coll[idx];
      let updated = { ...current, ...update, updatedAt: new Date().toISOString() };
      coll[idx] = updated;
      store.save();
      return wrapDoc(updated, collectionName);
    },

    async findByIdAndDelete(id) {
      const coll = store.getCollection(collectionName);
      const idx = coll.findIndex(item => String(item._id) === String(id) || String(item.id) === String(id));
      if (idx === -1) return null;

      const deleted = coll.splice(idx, 1)[0];
      store.save();
      return wrapDoc(deleted, collectionName);
    },

    async findOneAndDelete(filter = {}) {
      const coll = store.getCollection(collectionName);
      const idx = coll.findIndex(item => matchesFilter(item, filter));
      if (idx === -1) return null;

      const deleted = coll.splice(idx, 1)[0];
      store.save();
      return wrapDoc(deleted, collectionName);
    },

    async deleteMany(filter = {}) {
      const coll = store.getCollection(collectionName);
      if (!filter || Object.keys(filter).length === 0) {
        store.data[collectionName] = [];
        store.save();
        return { deletedCount: coll.length };
      }
      const beforeCount = coll.length;
      store.data[collectionName] = coll.filter(item => !matchesFilter(item, filter));
      store.save();
      return { deletedCount: beforeCount - store.data[collectionName].length };
    },

    async insertMany(items) {
      const coll = store.getCollection(collectionName);
      const created = [];
      for (const item of items) {
        let doc = { ...item };
        if (!doc._id) doc._id = generateId();
        doc.id = doc._id;
        doc.createdAt = new Date().toISOString();
        doc.updatedAt = new Date().toISOString();
        coll.push(doc);
        created.push(wrapDoc(doc, collectionName));
      }
      store.save();
      return created;
    }
  };
}

module.exports = {
  store,
  generateId,
  createJSONModel
};
