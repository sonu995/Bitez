// Central API service — auto-attaches JWT token to all requests

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');
const getAdminToken = () => localStorage.getItem('adminToken') || localStorage.getItem('token');

const headers = (extra: Record<string, string> = {}) => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...extra
});

const adminHeaders = (extra: Record<string, string> = {}) => ({
  'Content-Type': 'application/json',
  ...(getAdminToken() ? { Authorization: `Bearer ${getAdminToken()}` } : {}),
  ...extra
});

const handleResponse = async (res: Response) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API Error');
  return data;
};

// ── AUTH ─────────────────────────────────────────────────────
export const authAPI = {
  login: (email: string, password: string) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ email, password })
    }).then(handleResponse),

  register: (userData: { name: string; email: string; password: string; phone?: string }) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(userData)
    }).then(handleResponse),

  me: () =>
    fetch(`${BASE_URL}/auth/me`, { headers: headers() }).then(handleResponse),

  updateProfile: (data: { name?: string; phone?: string; deliveryAddress?: string; hostel?: string; room?: string; dietPreference?: string }) =>
    fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data)
    }).then(handleResponse)
};

// ── PLANS ────────────────────────────────────────────────────
export const plansAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/plans`).then(handleResponse),

  getAllAdmin: () =>
    fetch(`${BASE_URL}/plans/all`, { headers: headers() }).then(handleResponse),

  getById: (id: string) =>
    fetch(`${BASE_URL}/plans/${id}`).then(handleResponse),

  create: (data: object) =>
    fetch(`${BASE_URL}/plans`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  update: (id: string, data: object) =>
    fetch(`${BASE_URL}/plans/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  delete: (id: string) =>
    fetch(`${BASE_URL}/plans/${id}`, {
      method: 'DELETE',
      headers: headers()
    }).then(handleResponse)
};

// ── WEEKLY MENU ──────────────────────────────────────────────
export const menuAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/menu`).then(handleResponse),

  getToday: () =>
    fetch(`${BASE_URL}/menu/today`).then(handleResponse),

  updateDay: (day: string, data: { breakfast: string; lunch: string; dinner: string }) =>
    fetch(`${BASE_URL}/menu/${day}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  updateWeekly: (schedule: Record<string, any>) =>
    fetch(`${BASE_URL}/menu`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ schedule })
    }).then(handleResponse),

  getMealTimings: () =>
    fetch(`${BASE_URL}/menu/meal-timings`).then(handleResponse)
};

// ── EXTRA ITEMS ──────────────────────────────────────────────
export const extrasAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/extras`).then(handleResponse),

  getAllAdmin: () =>
    fetch(`${BASE_URL}/extras/all`, { headers: headers() }).then(handleResponse),

  create: (data: object) =>
    fetch(`${BASE_URL}/extras`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  update: (id: string, data: object) =>
    fetch(`${BASE_URL}/extras/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  delete: (id: string) =>
    fetch(`${BASE_URL}/extras/${id}`, {
      method: 'DELETE',
      headers: headers()
    }).then(handleResponse)
};

// ── SUBSCRIPTIONS ────────────────────────────────────────────
export const subscriptionsAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/subscriptions`, { headers: headers() }).then(handleResponse),

  getMine: () =>
    fetch(`${BASE_URL}/subscriptions/me`, { headers: headers() }).then(handleResponse),

  subscribe: (
    dataOrPlanId:
      | string
      | {
          planId: string;
          billingCycle?: 'monthly' | 'semester';
          hostelAddress?: string;
          room?: string;
          zoneCode?: string;
          dietPreference?: string;
          paymentMethod?: string;
          forceReplace?: boolean;
        },
    billingCycle?: 'monthly' | 'semester'
  ) => {
    const body =
      typeof dataOrPlanId === 'string'
        ? { planId: dataOrPlanId, billingCycle: billingCycle || 'monthly' }
        : { billingCycle: 'monthly', ...dataOrPlanId };

    return fetch(`${BASE_URL}/subscriptions`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body)
    }).then(handleResponse);
  },

  pause: (id: string) =>
    fetch(`${BASE_URL}/subscriptions/${id}/pause`, {
      method: 'PUT',
      headers: headers()
    }).then(handleResponse),

  cancel: (id: string) =>
    fetch(`${BASE_URL}/subscriptions/${id}/cancel`, {
      method: 'PUT',
      headers: headers()
    }).then(handleResponse),

  createManual: (data: object) =>
    fetch(`${BASE_URL}/subscriptions/manual`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  extend: (id: string, data: { extraMeals?: number; extraDays?: number }) =>
    fetch(`${BASE_URL}/subscriptions/${id}/extend`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  renew: (id: string) =>
    fetch(`${BASE_URL}/subscriptions/${id}/renew`, {
      method: 'PUT',
      headers: headers()
    }).then(handleResponse),

  getCutoffStatus: () =>
    fetch(`${BASE_URL}/subscriptions/cutoff-status`, { headers: headers() }).then(handleResponse),

  skipMeal: (id: string, data?: { mealType?: 'lunch' | 'dinner'; date?: string; reason?: string }) =>
    fetch(`${BASE_URL}/subscriptions/${id}/skip-meal`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data || {})
    }).then(handleResponse),

  getOrderHistory: (id: string) =>
    fetch(`${BASE_URL}/subscriptions/${id}/orders`, { headers: headers() }).then(handleResponse),

  update: (id: string, data: { dietPreference?: string; hostelAddress?: string; room?: string; zoneCode?: string }) =>
    fetch(`${BASE_URL}/subscriptions/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  updatePreferences: (id: string, data: { dietPreference?: string; hostelAddress?: string; room?: string; zoneCode?: string }) =>
    fetch(`${BASE_URL}/subscriptions/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data)
    }).then(handleResponse)
};

// ── ORDERS ───────────────────────────────────────────────────
export const ordersAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/orders`, { headers: headers() }).then(handleResponse),

  getMyOrders: () =>
    fetch(`${BASE_URL}/orders/my`, { headers: headers() }).then(handleResponse),

  getMine: () =>
    fetch(`${BASE_URL}/orders/my`, { headers: headers() }).then(handleResponse),

  getById: (id: string) =>
    fetch(`${BASE_URL}/orders/${id}`, { headers: headers() }).then(handleResponse),

  create: (data: { items: any[]; totalAmount: number; deliveryAddress: string; paymentMethod?: string }) =>
    fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  updateStatus: (id: string, status: string) =>
    fetch(`${BASE_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ status })
    }).then(handleResponse),

  cancel: (id: string) =>
    fetch(`${BASE_URL}/orders/${id}/cancel`, {
      method: 'POST',
      headers: headers()
    }).then(handleResponse),

  getAttachedMealExtras: () =>
    fetch(`${BASE_URL}/orders/attached-meal-extras`, { headers: headers() }).then(handleResponse),

  getMealDeliveryStatus: () =>
    fetch(`${BASE_URL}/orders/meal-delivery-status`, { headers: headers() }).then(handleResponse)
};

// ── COMPLAINTS ───────────────────────────────────────────────
export const complaintsAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/complaints`, { headers: headers() }).then(handleResponse),

  getMy: () =>
    fetch(`${BASE_URL}/complaints/my`, { headers: headers() }).then(handleResponse),

  getById: (id: string) =>
    fetch(`${BASE_URL}/complaints/${id}`, { headers: headers() }).then(handleResponse),

  create: (data: { category: string; subject: string; message: string; orderId?: string; priority?: string }) =>
    fetch(`${BASE_URL}/complaints`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  update: (id: string, data: { status?: string; resolution?: string; priority?: string }) =>
    fetch(`${BASE_URL}/complaints/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data)
    }).then(handleResponse)
};

// ── WALLET ───────────────────────────────────────────────────
export const walletAPI = {
  topup: (amount: number) =>
    fetch(`${BASE_URL}/auth/wallet/topup`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ amount })
    }).then(handleResponse),

  getTransactions: () =>
    fetch(`${BASE_URL}/auth/wallet/transactions`, { headers: headers() }).then(handleResponse)
};

// ── DISHES & INSTANT FOOD ────────────────────────────────────
export const dishesAPI = {
  getAll: (params?: { category?: string; search?: string; vegOnly?: boolean | string; sort?: string; availableOnly?: boolean | string; inStock?: boolean | string }) => {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'all') query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.vegOnly !== undefined && params?.vegOnly !== '') query.set('vegOnly', String(params.vegOnly));
    if (params?.sort) query.set('sort', params.sort);
    if (params?.availableOnly !== undefined && params?.availableOnly !== '') query.set('availableOnly', String(params.availableOnly));
    if (params?.inStock !== undefined && params?.inStock !== '') query.set('inStock', String(params.inStock));
    const qs = query.toString();
    return fetch(`${BASE_URL}/dishes${qs ? `?${qs}` : ''}`).then(handleResponse);
  },

  getById: (id: string) =>
    fetch(`${BASE_URL}/dishes/${id}`).then(handleResponse),

  getStats: () =>
    fetch(`${BASE_URL}/dishes/stats`, { headers: adminHeaders() }).then(handleResponse),

  create: (data: any) =>
    fetch(`${BASE_URL}/dishes`, {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  update: (id: string, data: any) =>
    fetch(`${BASE_URL}/dishes/${id}`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  toggleAvailability: (id: string) =>
    fetch(`${BASE_URL}/dishes/${id}/toggle-availability`, {
      method: 'PATCH',
      headers: adminHeaders()
    }).then(handleResponse),

  delete: (id: string) =>
    fetch(`${BASE_URL}/dishes/${id}`, {
      method: 'DELETE',
      headers: adminHeaders()
    }).then(handleResponse)
};

// ── ADMIN ────────────────────────────────────────────────────
export const adminAPI = {
  checkHealth: () =>
    fetch(`${BASE_URL}/health`).then(handleResponse),

  quickLogin: () =>
    fetch(`${BASE_URL}/admin/quick-login`, {
      method: 'POST',
      headers: headers()
    }).then(handleResponse),

  getOverview: () =>
    fetch(`${BASE_URL}/admin/overview`, { headers: adminHeaders() }).then(handleResponse),

  getUsers: () =>
    fetch(`${BASE_URL}/admin/users`, { headers: adminHeaders() }).then(handleResponse),

  updateUserRole: (id: string, role: string) =>
    fetch(`${BASE_URL}/admin/users/${id}/role`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify({ role })
    }).then(handleResponse),

  // Delivery Zones
  getZones: () =>
    fetch(`${BASE_URL}/admin/zones`, { headers: adminHeaders() }).then(handleResponse),

  createZone: (data: any) =>
    fetch(`${BASE_URL}/admin/zones`, {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  updateZone: (id: string, data: any) =>
    fetch(`${BASE_URL}/admin/zones/${id}`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  toggleZoneStatus: (id: string) =>
    fetch(`${BASE_URL}/admin/zones/${id}/status`, {
      method: 'PUT',
      headers: adminHeaders()
    }).then(handleResponse),

  deleteZone: (id: string) =>
    fetch(`${BASE_URL}/admin/zones/${id}`, {
      method: 'DELETE',
      headers: adminHeaders()
    }).then(handleResponse),

  // Delivery Riders
  getRiders: () =>
    fetch(`${BASE_URL}/admin/riders`, { headers: adminHeaders() }).then(handleResponse),

  createRider: (data: any) =>
    fetch(`${BASE_URL}/admin/riders`, {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  updateRider: (id: string, data: any) =>
    fetch(`${BASE_URL}/admin/riders/${id}`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  toggleRiderStatus: (id: string) =>
    fetch(`${BASE_URL}/admin/riders/${id}/status`, {
      method: 'PUT',
      headers: adminHeaders()
    }).then(handleResponse),

  setRiderStatus: (id: string, status: string) =>
    fetch(`${BASE_URL}/admin/riders/${id}/status`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify({ status })
    }).then(handleResponse),

  assignDeliveryToRider: (riderId: string, deliveryId: string, type: 'mess' | 'instant') =>
    fetch(`${BASE_URL}/admin/riders/${riderId}/assign`, {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify({ deliveryId, type })
    }).then(handleResponse),

  autoAssignMessRoutes: () =>
    fetch(`${BASE_URL}/admin/dispatch/auto-assign-routes`, {
      method: 'POST',
      headers: adminHeaders()
    }).then(handleResponse),

  settleRiderPayout: (id: string) =>
    fetch(`${BASE_URL}/admin/riders/${id}/settle`, {
      method: 'PUT',
      headers: adminHeaders()
    }).then(handleResponse),

  deleteRider: (id: string) =>
    fetch(`${BASE_URL}/admin/riders/${id}`, {
      method: 'DELETE',
      headers: adminHeaders()
    }).then(handleResponse),

  // Delivery Rates & Pricing Configuration
  getDeliveryRates: () =>
    fetch(`${BASE_URL}/admin/delivery-rates`, { headers: adminHeaders() }).then(handleResponse),

  updateDeliveryRates: (data: {
    // Mess Delivery fields
    messPerBoxRate?: number;
    messDinnerSurgeBonus?: number;
    messCustomerDeliveryFee?: number;
    messExtraAttachedBonus?: number;
    messWeekendBonus?: number;
    messMinDailyGuarantee?: number;

    // Instant Delivery fields (Pricing & Fee Controls)
    instantPerOrderRate?: number;
    instantCustomerDeliveryFee?: number;
    instantBaseDeliveryFee?: number;
    instantPerKmFee?: number;
    instantPricingMode?: 'slabs' | 'per_km';
    instantSlab0to2Km?: number;
    instantSlab2to5Km?: number;
    instantSlab5to8Km?: number;
    instantSlabAbove8Km?: number;
    instantMinOrderValue?: number;
    instantFreeDeliveryThreshold?: number;
    instantPeakHourFee?: number;
    instantPeakHourEnabled?: boolean;
    instantPeakHourTiming?: string;
    instantNightDeliveryFee?: number;
    instantNightDeliveryEnabled?: boolean;
    instantNightTiming?: string;
    instantRainFee?: number;
    instantRainFeeEnabled?: boolean;
    instantSurgeFee?: number;
    instantSurgeMultiplier?: number;
    instantSurgeMode?: 'flat' | 'multiplier';
    instantSurgeEnabled?: boolean;
    instantZones?: Array<{ id: string; name: string; baseFee: number; extraFee: number; isActive: boolean; description?: string }>;
    instantPeakSurgeBonus?: number;
    instantRainSurgeBonus?: number;
    instantMinDailyGuarantee?: number;

    // Fallback & Application options
    defaultPerDeliveryRate?: number;
    dinnerSurgeBonus?: number;
    customerDeliveryFee?: number;
    freeDeliveryThreshold?: number;
    minDailyGuarantee?: number;
    weekendSurgeBonus?: number;
    applyToAllRiders?: boolean;
    applyTarget?: 'both' | 'mess' | 'instant';
    individualRiderRates?: Array<{ riderId: string; perDeliveryRate?: number; messDeliveryRate?: number; instantDeliveryRate?: number }>;
  }) =>
    fetch(`${BASE_URL}/admin/delivery-rates`, {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  updateRiderDeliveryRate: (riderId: string, rates: { perDeliveryRate?: number; messDeliveryRate?: number; instantDeliveryRate?: number } | number) => {
    const payload = typeof rates === 'number' ? { perDeliveryRate: rates, messDeliveryRate: rates } : rates;
    return fetch(`${BASE_URL}/admin/riders/${riderId}/rate`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse);
  },

  // Rider Earnings & Payout Reports
  getRiderEarningsReport: (params?: {
    period?: string;
    date?: string;
    month?: string;
    startDate?: string;
    endDate?: string;
    riderId?: string;
    status?: string;
    service?: string;
  }) => {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return fetch(`${BASE_URL}/admin/rider-earnings${query}`, { headers: adminHeaders() }).then(handleResponse);
  },

  settleRiderEarnings: (data: {
    riderId: string;
    date?: string;
    month?: string;
    amount: number;
    paymentMethod: string;
    referenceId?: string;
    notes?: string;
  }) =>
    fetch(`${BASE_URL}/admin/rider-earnings/settle`, {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  bulkSettleRiderEarnings: (data: {
    date?: string;
    month?: string;
    paymentMethod: string;
    referenceId?: string;
    notes?: string;
    riderIds?: string[];
  }) =>
    fetch(`${BASE_URL}/admin/rider-earnings/bulk-settle`, {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  // Delivery Routes
  getRoutes: () =>
    fetch(`${BASE_URL}/admin/routes`, { headers: adminHeaders() }).then(handleResponse),

  updateRouteStatus: (id: string, status: string) =>
    fetch(`${BASE_URL}/admin/routes/${id}/status`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify({ status })
    }).then(handleResponse),

  // Daily Dispatch Roster (Full-Stack Dynamic)
  getDispatch: (sync?: boolean) =>
    fetch(`${BASE_URL}/admin/dispatch${sync ? '?sync=true' : ''}`, { headers: adminHeaders() }).then(handleResponse),

  getDispatchHistory: (params?: { timeframe?: string; month?: string; date?: string; startDate?: string; endDate?: string; rider?: string; slot?: string; status?: string; q?: string }) => {
    const query = new URLSearchParams();
    if (params?.timeframe) query.append('timeframe', params.timeframe);
    if (params?.month) query.append('month', params.month);
    if (params?.date) query.append('date', params.date);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.rider) query.append('rider', params.rider);
    if (params?.slot) query.append('slot', params.slot);
    if (params?.status) query.append('status', params.status);
    if (params?.q) query.append('q', params.q);
    const qs = query.toString();
    return fetch(`${BASE_URL}/admin/dispatch/history${qs ? `?${qs}` : ''}`, { headers: adminHeaders() }).then(handleResponse);
  },

  updateDispatchStatus: (id: string, status: string) =>
    fetch(`${BASE_URL}/admin/dispatch/${id}/status`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify({ status })
    }).then(handleResponse),

  assignDispatchRider: (id: string, rider: string) =>
    fetch(`${BASE_URL}/admin/dispatch/${id}/rider`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify({ rider })
    }).then(handleResponse),

  createDispatch: (data: any) =>
    fetch(`${BASE_URL}/admin/dispatch`, {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  updateDispatch: (id: string, data: any) =>
    fetch(`${BASE_URL}/admin/dispatch/${id}`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  deleteDispatch: (id: string) =>
    fetch(`${BASE_URL}/admin/dispatch/${id}`, {
      method: 'DELETE',
      headers: adminHeaders()
    }).then(handleResponse),

  syncDispatchRoster: () =>
    fetch(`${BASE_URL}/admin/dispatch/sync`, {
      method: 'POST',
      headers: adminHeaders()
    }).then(handleResponse),

  bulkUpdateDispatchStatus: (data: { ids?: string[]; slot?: string; status: string }) =>
    fetch(`${BASE_URL}/admin/dispatch/bulk-status`, {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  togglePackExtras: (id: string, packed?: boolean) =>
    fetch(`${BASE_URL}/admin/dispatch/${id}/pack-extras`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify({ packed })
    }).then(handleResponse),

  assignSlotRider: (data: { slot: string; riderId: string; overwriteAll?: boolean }) =>
    fetch(`${BASE_URL}/admin/dispatch/assign-slot`, {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  getSlotSummary: () =>
    fetch(`${BASE_URL}/admin/dispatch/slot-summary`, { headers: adminHeaders() }).then(handleResponse),

  assignZoneRider: (data: { zoneCode: string; riderId: string; slot?: string; overwriteAll?: boolean }) =>
    fetch(`${BASE_URL}/admin/dispatch/assign-zone`, {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  getZoneSummary: () =>
    fetch(`${BASE_URL}/admin/dispatch/zone-summary`, { headers: adminHeaders() }).then(handleResponse),

  // Skip Requests (Full-Stack Admin)
  getSkips: (params?: { status?: string; mealType?: string; date?: string; q?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.mealType) query.append('mealType', params.mealType);
    if (params?.date) query.append('date', params.date);
    if (params?.q) query.append('q', params.q);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetch(`${BASE_URL}/admin/skips${qs}`, { headers: adminHeaders() }).then(handleResponse);
  },

  getSkipStats: () =>
    fetch(`${BASE_URL}/admin/skips/stats`, { headers: adminHeaders() }).then(handleResponse),

  createSkip: (data: { userId: string; mealType: 'lunch' | 'dinner'; date?: string; reason?: string; credit?: number }) =>
    fetch(`${BASE_URL}/admin/skips`, {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  approveSkip: (id: string) =>
    fetch(`${BASE_URL}/admin/skips/${id}/approve`, {
      method: 'POST',
      headers: adminHeaders()
    }).then(handleResponse),

  rejectSkip: (id: string) =>
    fetch(`${BASE_URL}/admin/skips/${id}/reject`, {
      method: 'POST',
      headers: adminHeaders()
    }).then(handleResponse),

  deleteSkip: (id: string) =>
    fetch(`${BASE_URL}/admin/skips/${id}`, {
      method: 'DELETE',
      headers: adminHeaders()
    }).then(handleResponse),

  syncSkipsWithRoster: () =>
    fetch(`${BASE_URL}/admin/skips/sync-roster`, {
      method: 'POST',
      headers: adminHeaders()
    }).then(handleResponse),

  // Instant Food Orders
  getOrders: () =>
    fetch(`${BASE_URL}/admin/orders`, { headers: adminHeaders() }).then(handleResponse),

  updateOrderStatus: (id: string, status: string, paymentStatus?: string) =>
    fetch(`${BASE_URL}/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify({ status, paymentStatus })
    }).then(handleResponse),

  // Assign Rider to an Extra/Subscriber Order (Admin-only, deliver with meal)
  assignOrderRider: (id: string, riderName: string, riderPhone: string, riderVehicle: string) =>
    fetch(`${BASE_URL}/orders/${id}/rider`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify({ riderName, riderPhone, riderVehicle })
    }).then(handleResponse),

  // Complaints
  getComplaints: () =>
    fetch(`${BASE_URL}/admin/complaints`, { headers: adminHeaders() }).then(handleResponse),

  resolveComplaint: (id: string, resolution: string, status: string = 'resolved', creditAmount?: number) =>
    fetch(`${BASE_URL}/admin/complaints/${id}/resolve`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify({ resolution, status, creditAmount })
    }).then(handleResponse),

  // Subscriber Order History
  getSubscriberOrders: (id: string) =>
    fetch(`${BASE_URL}/admin/subscribers/${id}/orders`, { headers: adminHeaders() }).then(handleResponse),

  // Coupons
  getCoupons: () =>
    fetch(`${BASE_URL}/admin/coupons`, { headers: adminHeaders() }).then(handleResponse),

  createCoupon: (data: any) =>
    fetch(`${BASE_URL}/admin/coupons`, {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  toggleCoupon: (id: string) =>
    fetch(`${BASE_URL}/admin/coupons/${id}/toggle`, {
      method: 'PUT',
      headers: adminHeaders()
    }).then(handleResponse),

  // Clear All Operational & Transactional Data
  clearAllData: (options?: {
    clearOrders?: boolean;
    clearDispatchRoster?: boolean;
    clearSubscriptions?: boolean;
    clearComplaints?: boolean;
    clearSkipRequests?: boolean;
    clearRiderPayouts?: boolean;
    resetRiders?: boolean;
  }) =>
    fetch(`${BASE_URL}/admin/clear-all-data`, {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(options || {})
    }).then(handleResponse),

  deleteCoupon: (id: string) =>
    fetch(`${BASE_URL}/admin/coupons/${id}`, {
      method: 'DELETE',
      headers: adminHeaders()
    }).then(handleResponse),

  // Meal Timings & Cutoff Management
  getMealTimings: () =>
    fetch(`${BASE_URL}/admin/meal-timings`, { headers: adminHeaders() }).then(handleResponse),

  updateMealTimings: (data: any) =>
    fetch(`${BASE_URL}/admin/meal-timings`, {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  // User Actions
  creditUserWallet: (id: string, amount: number, reason?: string) =>
    fetch(`${BASE_URL}/admin/users/${id}/wallet`, {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify({ amount, reason })
    }).then(handleResponse),

  deleteUser: (id: string) =>
    fetch(`${BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: adminHeaders()
    }).then(handleResponse)
};

// ── RIDER PARTNER APP API ───────────────────────────────────
export const riderAPI = {
  getProfile: (id?: string) => {
    const q = id ? `/${encodeURIComponent(id)}` : '';
    return fetch(`${BASE_URL}/rider/profile${q}`).then(handleResponse);
  },
  getTasks: (id?: string, mode?: string) => {
    const q = id ? `/${encodeURIComponent(id)}` : '';
    const m = mode ? `?mode=${encodeURIComponent(mode)}` : '';
    return fetch(`${BASE_URL}/rider/tasks${q}${m}`).then(handleResponse);
  },
  toggleDutyStatus: (id?: string, status?: string) => {
    const q = id ? `/${encodeURIComponent(id)}` : '';
    return fetch(`${BASE_URL}/rider/duty-status${q}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).then(handleResponse);
  },
  acceptTask: (taskId: string, riderId?: string) =>
    fetch(`${BASE_URL}/rider/tasks/${taskId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ riderId })
    }).then(handleResponse),
  updateTaskStatus: (taskId: string, status: string, otp?: string, riderId?: string) =>
    fetch(`${BASE_URL}/rider/tasks/${taskId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, otp, riderId })
    }).then(handleResponse),
  requestPayout: (data: { riderId?: string; amount: number; upiId?: string }) =>
    fetch(`${BASE_URL}/rider/payout-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  submitCashSettlement: (data: { riderId?: string; amount: number; notes?: string }) =>
    fetch(`${BASE_URL}/rider/cash-settlement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  reportSosIssue: (data: { riderId?: string; taskId?: string; reason: string; details?: string }) =>
    fetch(`${BASE_URL}/rider/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  getEarnings: (id?: string) => {
    const q = id ? `/${encodeURIComponent(id)}` : '';
    return fetch(`${BASE_URL}/rider/earnings${q}`).then(handleResponse);
  },
  getDateEarnings: (id?: string, date?: string) => {
    const rId = id ? `/${encodeURIComponent(id)}` : '';
    const q = date ? `?date=${encodeURIComponent(date)}` : '';
    return fetch(`${BASE_URL}/rider/date-earnings${rId}${q}`).then(handleResponse);
  },
  updateBankDetails: (id?: string, data?: { bankName?: string; accountNumber?: string; ifscCode?: string; upiId?: string; accountHolder?: string }) => {
    const q = id ? `/${encodeURIComponent(id)}` : '';
    return fetch(`${BASE_URL}/rider/bank-details${q}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || {})
    }).then(handleResponse);
  },
  login: (data: { identifier: string; pin?: string; mode?: string }) =>
    fetch(`${BASE_URL}/rider/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  register: (data: any) =>
    fetch(`${BASE_URL}/rider/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse)
};

