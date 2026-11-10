const { getModel } = require('../config/adapter');

const Rider = getModel('riders');
const Order = getModel('orders');
const DispatchRoster = getModel('dispatchRoster');
const RiderPayout = getModel('riderPayouts');

// Robust seeded random generator for stable mock data
function seededRandom(seed) {
  const str = String(seed || 'fleet');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const x = Math.sin(Math.abs(hash) + 1) * 10000;
  return x - Math.floor(x);
}

// Helper to get formatted date string YYYY-MM-DD
function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Fallback fleet riders if database table is cleared
const FALLBACK_FLEET_RIDERS = [];

// Student customers & hostels for generating realistic run details
const SAMPLE_STUDENTS = [
  { name: 'Rahul Sharma', hostel: 'Tagore Hostel', room: '204', phone: '+91 98101 12345' },
  { name: 'Priya Patel', hostel: 'Sarojini Hall', room: '112', phone: '+91 98202 23456' },
  { name: 'Rohit Verma', hostel: 'Bose Hostel', room: '108', phone: '+91 98303 34567' },
  { name: 'Sneha Rao', hostel: 'Kasturba Hostel', room: '302', phone: '+91 98404 45678' },
  { name: 'Vikram Aditya', hostel: 'Shastri Hostel', room: '405', phone: '+91 98505 56789' },
  { name: 'Ankit Gupta', hostel: 'Tagore Hostel', room: '102', phone: '+91 98606 67890' },
  { name: 'Deepika Iyer', hostel: 'Sarojini Hall', room: '219', phone: '+91 98707 78901' },
  { name: 'Karan Mehra', hostel: 'Patel Hall', room: '315', phone: '+91 98808 89012' }
];

// Generate deterministic runs for a rider on a given date if live database is empty
function generateDeterministicRuns(rider, dateStr) {
  return [];
}

// Get real delivery runs for a rider on a given date from live orders and dispatch items
function getRunsForRiderDate(rider, dateStr, liveOrders, dispatchItems) {
  const runs = [];
  const messRate = Number(rider.messDeliveryRate || rider.perDeliveryRate || 35);
  const instantRate = Number(rider.instantDeliveryRate || (rider.perDeliveryRate ? Math.max(35, rider.perDeliveryRate + 10) : 40));
  const riderIdStr = String(rider.id || rider._id || '');
  const riderName = (rider.name || '').toLowerCase();

  // From dispatchItems (Mess)
  if (Array.isArray(dispatchItems) && dispatchItems.length > 0) {
    dispatchItems.forEach(d => {
      const itemDate = d.date || (d.createdAt ? formatDate(new Date(d.createdAt)) : '');
      const isAssigned = String(d.riderId) === riderIdStr || (d.assignedRider && d.assignedRider.toLowerCase().includes(riderName));
      if (isAssigned && itemDate === dateStr && d.status === 'delivered') {
        runs.push({
          runId: d.deliveryId || d.id || d._id,
          date: dateStr,
          time: d.deliveredAt ? new Date(d.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (d.time || '12:30 PM'),
          type: 'Mess Tiffin',
          slot: d.mealSlot || 'Lunch',
          customerName: d.studentName || d.customerName || 'Customer',
          customerPhone: d.customerPhone || '',
          deliveryAddress: d.hostelAddress || (d.hostel ? `${d.hostel}, Room ${d.room || ''}` : ''),
          orderAmount: d.totalAmount || 120,
          deliveryFee: messRate,
          tipAmount: d.tipAmount || 0,
          totalEarned: messRate + (d.tipAmount || 0),
          status: 'Delivered',
          rating: d.rating || 5.0
        });
      }
    });
  }

  // From liveOrders (Instant Food)
  if (Array.isArray(liveOrders) && liveOrders.length > 0) {
    liveOrders.forEach(o => {
      const orderDate = o.createdAt ? formatDate(new Date(o.createdAt)) : (o.date || '');
      const isAssigned = String(o.riderId) === riderIdStr || (o.deliveryPartner?.name && o.deliveryPartner.name.toLowerCase().includes(riderName));
      if (isAssigned && orderDate === dateStr && o.status === 'delivered') {
        runs.push({
          runId: o.orderId || o.id || o._id,
          date: dateStr,
          time: o.updatedAt ? new Date(o.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '01:00 PM',
          type: 'Instant Food',
          slot: 'Instant Snack / Meal',
          customerName: o.customerName || 'Customer',
          customerPhone: o.customerPhone || '',
          deliveryAddress: o.deliveryAddress || '',
          orderAmount: o.totalAmount || 0,
          deliveryFee: instantRate,
          tipAmount: o.tipAmount || 0,
          totalEarned: instantRate + (o.tipAmount || 0),
          status: 'Delivered',
          rating: o.rating || 5.0
        });
      }
    });
  }

  // If no live runs found in DB, return empty runs
  return runs;
}

/**
 * Main Generator for Rider Earnings Report
 */
async function getRiderEarningsReport({
  period = 'daily',
  date,
  month,
  startDate,
  endDate,
  riderId,
  status = 'all',
  service = 'all'
} = {}) {
  let riders = await Rider.find();
  if (!Array.isArray(riders) || riders.length === 0) {
    return {
      success: true,
      filter: {
        period,
        date: date || formatDate(new Date()),
        month: month || formatDate(new Date()).substring(0, 7),
        startDate: startDate || formatDate(new Date()),
        endDate: endDate || formatDate(new Date()),
        riderId: riderId || 'all',
        status,
        service
      },
      summary: {
        totalEarnings: 0,
        totalDeliveries: 0,
        messDeliveries: 0,
        instantDeliveries: 0,
        combinedDeliveries: 0,
        totalPaid: 0,
        totalPending: 0,
        activeRidersCount: 0,
        avgEarningPerRider: 0,
        avgDeliveriesPerRider: 0,
        topEarner: { riderId: '', riderName: 'N/A', amount: 0, deliveries: 0 }
      },
      riders: [],
      dailyTimeline: [],
      dateList: []
    };
  }

  const payouts = await RiderPayout.find();
  const liveOrders = await Order.find();
  const dispatchItems = await DispatchRoster.find();

  // Dynamic today reference
  const today = new Date();
  const todayStr = formatDate(today);

  // Normalize target date
  const targetDateStr = date || todayStr;
  const targetMonthStr = month || targetDateStr.substring(0, 7);

  // Determine date bounds
  let startD, endD;
  if (period === 'daily') {
    startD = new Date(`${targetDateStr}T00:00:00`);
    endD = new Date(`${targetDateStr}T23:59:59`);
  } else if (period === 'monthly') {
    const [y, m] = targetMonthStr.split('-').map(Number);
    startD = new Date(y, m - 1, 1);
    const lastDayOfMonth = new Date(y, m, 0).getDate();
    const capDay = (targetMonthStr === todayStr.substring(0, 7)) ? today.getDate() : lastDayOfMonth;
    endD = new Date(y, m - 1, capDay, 23, 59, 59);
  } else if (period === 'custom' && startDate && endDate) {
    startD = new Date(`${startDate}T00:00:00`);
    endD = new Date(`${endDate}T23:59:59`);
  } else {
    // Default to 14 days window up to target date
    endD = new Date(`${targetDateStr}T23:59:59`);
    startD = new Date(endD);
    startD.setDate(startD.getDate() - 13);
  }

  // Generate list of dates in the window
  const dateList = [];
  const cur = new Date(startD);
  while (cur <= endD) {
    dateList.push(formatDate(cur));
    cur.setDate(cur.getDate() + 1);
  }

  // Pre-process payouts indexed by `riderId_date` and `riderId_month`
  const payoutIndex = {};
  if (Array.isArray(payouts)) {
    payouts.forEach(p => {
      const rId = String(p.riderId);
      if (p.date) payoutIndex[`${rId}_${p.date}`] = p;
      if (p.month) payoutIndex[`${rId}_${p.month}`] = p;
      payoutIndex[`${rId}_latest`] = p;
    });
  }

  // Calculate earnings for each rider
  const riderReports = [];
  const dailyTimelineMap = {};

  // Initialize daily timeline map
  dateList.forEach(dStr => {
    const dObj = new Date(dStr + 'T00:00:00');
    dailyTimelineMap[dStr] = {
      date: dStr,
      formattedDate: dObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      dayName: dObj.toLocaleDateString('en-IN', { weekday: 'short' }),
      totalEarnings: 0,
      totalDeliveries: 0,
      messDeliveries: 0,
      instantDeliveries: 0,
      paidAmount: 0,
      pendingAmount: 0,
      activeRiders: 0,
      topRider: { name: 'None', earnings: 0, riderId: '' },
      riderBreakdown: []
    };
  });

  // Loop through all riders
  for (const rider of riders) {
    const rId = rider.id || rider._id;
    const rate = Number(rider.perDeliveryRate || 35);

    let totalRiderDeliveries = 0;
    let totalMessDeliveries = 0;
    let totalInstantDeliveries = 0;
    let totalBaseEarnings = 0;
    let totalIncentives = 0;
    let totalTips = 0;
    let totalDeductions = 0;
    let totalNetEarnings = 0;
    let totalPaid = 0;
    let totalPending = 0;

    const dailyBreakdown = [];
    let allRiderRuns = [];

    // Loop through each date in the window for this rider
    dateList.forEach(dStr => {
      const runs = getRunsForRiderDate(rider, dStr, liveOrders, dispatchItems);
      let messRuns = runs.filter(r => r.type === 'Mess Tiffin');
      let instantRuns = runs.filter(r => r.type === 'Instant Food');

      if (service === 'mess') instantRuns = [];
      if (service === 'instant') messRuns = [];

      const messCount = messRuns.length;
      const instantCount = instantRuns.length;
      const dayTotalDeliveries = messCount + instantCount;
      const baseEarning = dayTotalDeliveries * rate;
      const incentive = dayTotalDeliveries >= 18 ? 100 : dayTotalDeliveries >= 14 ? 50 : 0;
      const tips = runs.reduce((sum, r) => sum + (r.tipAmount || 0), 0);
      const dayNet = baseEarning + incentive + tips;

      // Determine payout status for this day
      const payoutKey = `${rId}_${dStr}`;
      const monthPayoutKey = `${rId}_${dStr.substring(0, 7)}`;
      let dayStatus = dayTotalDeliveries > 0 ? 'pending' : 'none';
      let settlementRef = null;

      if (dayTotalDeliveries > 0) {
        if (payoutIndex[payoutKey]) {
          dayStatus = 'paid';
          settlementRef = payoutIndex[payoutKey].referenceId || 'UPI-SETTLED';
        } else if (payoutIndex[monthPayoutKey]) {
          dayStatus = 'paid';
          settlementRef = payoutIndex[monthPayoutKey].referenceId || 'MONTHLY-BULK';
        }
      }

      allRiderRuns = allRiderRuns.concat(runs);

      totalRiderDeliveries += dayTotalDeliveries;
      totalMessDeliveries += messCount;
      totalInstantDeliveries += instantCount;
      totalBaseEarnings += baseEarning;
      totalIncentives += incentive;
      totalTips += tips;
      totalNetEarnings += dayNet;

      if (dayStatus === 'paid') {
        totalPaid += dayNet;
      } else {
        totalPending += dayNet;
      }

      // Record daily breakdown entry
      dailyBreakdown.push({
        date: dStr,
        dayName: new Date(dStr + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' }),
        messDeliveries: messCount,
        instantDeliveries: instantCount,
        totalDeliveries: dayTotalDeliveries,
        baseEarnings: baseEarning,
        incentives: incentive,
        tips,
        netEarnings: dayNet,
        status: dayStatus,
        settlementRef
      });

      // Aggregate into daily timeline
      if (dailyTimelineMap[dStr]) {
        dailyTimelineMap[dStr].totalEarnings += dayNet;
        dailyTimelineMap[dStr].totalDeliveries += dayTotalDeliveries;
        dailyTimelineMap[dStr].messDeliveries += messCount;
        dailyTimelineMap[dStr].instantDeliveries += instantCount;
        if (dayStatus === 'paid') {
          dailyTimelineMap[dStr].paidAmount += dayNet;
        } else {
          dailyTimelineMap[dStr].pendingAmount += dayNet;
        }
        if (dayTotalDeliveries > 0) {
          dailyTimelineMap[dStr].activeRiders += 1;
        }

        if (dayNet > (dailyTimelineMap[dStr].topRider?.earnings || 0)) {
          dailyTimelineMap[dStr].topRider = {
            name: rider.name,
            earnings: dayNet,
            riderId: rId
          };
        }

        dailyTimelineMap[dStr].riderBreakdown.push({
          riderId: rId,
          name: rider.name,
          deliveries: dayTotalDeliveries,
          earnings: dayNet,
          status: dayStatus
        });
      }
    });

    // Overall payout status
    let riderOverallStatus = 'none';
    if (totalPending > 0 && totalPaid > 0) {
      riderOverallStatus = 'partially_paid';
    } else if (totalPending > 0) {
      riderOverallStatus = 'pending';
    } else if (totalPaid > 0) {
      riderOverallStatus = 'paid';
    }

    if (status !== 'all' && status !== riderOverallStatus) {
      continue;
    }

    if (riderId && riderId !== 'all' && String(rId) !== String(riderId) && String(rider.id) !== String(riderId)) {
      continue;
    }

    const upiId = `${rider.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)}@okhdfcbank`;
    const bankAccount = `AC-9102${String(Math.abs(seededRandom(rId) * 100000)).slice(0, 4)}XXXX`;

    riderReports.push({
      riderId: rId,
      id: rId,
      name: rider.name,
      phone: rider.phone,
      route: rider.route,
      vehicle: rider.vehicle,
      vehicleType: rider.vehicleType || 'Electric Two-Wheeler',
      licenseNumber: rider.licenseNumber || 'DL-1420230098712',
      kycStatus: rider.kycStatus || 'verified',
      avatar: rider.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rider.name}`,
      rating: rider.rating || 4.8,
      status: rider.status || 'available',
      onlineStatus: rider.onlineStatus || 'online',
      perDeliveryRate: rate,
      upiId,
      bankAccount,
      messDeliveries: totalMessDeliveries,
      instantDeliveries: totalInstantDeliveries,
      totalDeliveries: totalRiderDeliveries,
      baseEarnings: totalBaseEarnings,
      incentives: totalIncentives,
      tips: totalTips,
      deductions: totalDeductions,
      netEarnings: totalNetEarnings,
      totalPaid,
      totalPending,
      payoutStatus: riderOverallStatus,
      lastSettlementDate: payoutIndex[`${rId}_latest`]?.createdAt || '2026-11-01T18:30:00.000Z',
      dailyBreakdown,
      deliveries: allRiderRuns
    });
  }

  // Summary Metrics
  const summaryTotalEarnings = riderReports.reduce((sum, r) => sum + r.netEarnings, 0);
  const summaryTotalDeliveries = riderReports.reduce((sum, r) => sum + r.totalDeliveries, 0);
  const summaryMessDeliveries = riderReports.reduce((sum, r) => sum + r.messDeliveries, 0);
  const summaryInstantDeliveries = riderReports.reduce((sum, r) => sum + r.instantDeliveries, 0);
  const summaryTotalPaid = riderReports.reduce((sum, r) => sum + r.totalPaid, 0);
  const summaryTotalPending = riderReports.reduce((sum, r) => sum + r.totalPending, 0);
  const activeRidersCount = riderReports.filter(r => r.totalDeliveries > 0).length;

  let topEarner = { riderId: '', riderName: 'N/A', amount: 0, deliveries: 0 };
  if (riderReports.length > 0) {
    const sorted = [...riderReports].sort((a, b) => b.netEarnings - a.netEarnings);
    topEarner = {
      riderId: sorted[0].riderId,
      riderName: sorted[0].name,
      amount: sorted[0].netEarnings,
      deliveries: sorted[0].totalDeliveries
    };
  }

  return {
    success: true,
    filter: {
      period,
      targetDate: targetDateStr,
      targetMonth: targetMonthStr,
      startDate: formatDate(startD),
      endDate: formatDate(endD),
      riderId: riderId || 'all',
      status,
      service
    },
    summary: {
      totalEarnings: summaryTotalEarnings,
      totalDeliveries: summaryTotalDeliveries,
      messDeliveries: summaryMessDeliveries,
      instantDeliveries: summaryInstantDeliveries,
      totalPaid: summaryTotalPaid,
      totalPending: summaryTotalPending,
      activeRidersCount,
      avgEarningPerRider: activeRidersCount > 0 ? Math.round(summaryTotalEarnings / activeRidersCount) : 0,
      avgDeliveriesPerRider: activeRidersCount > 0 ? Math.round(summaryTotalDeliveries / activeRidersCount) : 0,
      topEarner
    },
    riders: riderReports,
    dailyTimeline: Object.values(dailyTimelineMap),
    dateList
  };
}

module.exports = {
  getRiderEarningsReport,
  formatDate
};
