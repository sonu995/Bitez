const { getModel } = require('../config/adapter');

const DEFAULT_MEAL_TIMINGS = {
  id: 'global_meal_timings',
  breakfast: {
    enabled: true,
    label: 'Morning Breakfast',
    deliveryStart: '08:00',
    deliveryEnd: '09:30',
    deliveryTimeStr: '08:00 AM - 09:30 AM',
    cutoffTime: '07:30',
    cutoffTimeStr: '07:30 AM',
    cutoffMinutes: 7 * 60 + 30, // 450 mins
    skipCutoffTime: '07:00',
    skipCutoffTimeStr: '07:00 AM',
    skipCutoffMinutes: 7 * 60,   // 420 mins
    description: 'Hot Parathas, Poha, Fresh Curd & Masala Chai'
  },
  lunch: {
    enabled: true,
    label: 'Lunch Thali',
    deliveryStart: '12:30',
    deliveryEnd: '14:00',
    deliveryTimeStr: '12:30 PM - 02:00 PM',
    cutoffTime: '11:30',
    cutoffTimeStr: '11:30 AM',
    cutoffMinutes: 11 * 60 + 30, // 690 mins
    skipCutoffTime: '10:30',
    skipCutoffTimeStr: '10:30 AM',
    skipCutoffMinutes: 10 * 60 + 30, // 630 mins
    description: '4 Butter Phulkas, Dal Tadka, Paneer / Seasonal Sabji, Jeera Rice & Salad'
  },
  dinner: {
    enabled: true,
    label: 'Dinner Feast',
    deliveryStart: '19:30',
    deliveryEnd: '21:00',
    deliveryTimeStr: '07:30 PM - 09:00 PM',
    cutoffTime: '19:00',
    cutoffTimeStr: '07:00 PM',
    cutoffMinutes: 19 * 60, // 1140 mins
    skipCutoffTime: '17:30',
    skipCutoffTimeStr: '05:30 PM',
    skipCutoffMinutes: 17 * 60 + 30, // 1050 mins
    description: '4 Warm Rotis, Dal Makhani, Mixed Veg Curry, Rice & Sweet / Raita'
  },
  generalNotice: 'Daily hostel mess tiffin delivery. Extra items and skip requests must be placed before kitchen cutoff.'
};

function parse24to12(time24) {
  if (!time24) return { minutes: 0, timeStr: '12:00 PM', raw: '12:00' };
  const parts = String(time24).trim().split(':');
  let h = parseInt(parts[0], 10);
  let m = parseInt(parts[1], 10);
  if (isNaN(h)) h = 12;
  if (isNaN(m)) m = 0;
  h = Math.max(0, Math.min(23, h));
  m = Math.max(0, Math.min(59, m));
  const totalMinutes = h * 60 + m;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const pad = n => String(n).padStart(2, '0');
  const timeStr = `${pad(displayH)}:${pad(m)} ${period}`;
  return {
    minutes: totalMinutes,
    timeStr,
    raw: `${pad(h)}:${pad(m)}`
  };
}

async function getOrCreateMealTimings() {
  const MealTiming = getModel('mealTimingSettings');
  try {
    let doc = await MealTiming.findOne({ id: 'global_meal_timings' });
    if (!doc) {
      doc = await MealTiming.create({
        ...DEFAULT_MEAL_TIMINGS,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    return doc;
  } catch (err) {
    return DEFAULT_MEAL_TIMINGS;
  }
}

module.exports = {
  DEFAULT_MEAL_TIMINGS,
  parse24to12,
  getOrCreateMealTimings
};

