// Central API service — auto-attaches JWT token to all requests

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

const headers = (extra: Record<string, string> = {}) => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
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
    fetch(`${BASE_URL}/auth/me`, { headers: headers() }).then(handleResponse)
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

  updateDay: (day: string, data: { breakfast: string; lunch: string; dinner: string }) =>
    fetch(`${BASE_URL}/menu/${day}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data)
    }).then(handleResponse)
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

  subscribe: (planId: string, billingCycle: 'monthly' | 'semester') =>
    fetch(`${BASE_URL}/subscriptions`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ planId, billingCycle })
    }).then(handleResponse),

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

  skipMeal: (id: string) =>
    fetch(`${BASE_URL}/subscriptions/${id}/skip-meal`, {
      method: 'PUT',
      headers: headers()
    }).then(handleResponse)
};
