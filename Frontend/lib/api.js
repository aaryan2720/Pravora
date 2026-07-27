let BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

if (typeof window !== 'undefined') {
  const hostname = window.location.hostname;
  const isLocalUrl = !process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL.includes('localhost') || process.env.NEXT_PUBLIC_API_URL.includes('127.0.0.1');
  // If accessed via an IPv4 address and using a local API URL, dynamically route API requests to port 5000 on the same host machine
  if (isLocalUrl && hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname.match(/^[0-9.]+$/)) {
    BASE_URL = `${window.location.protocol}//${hostname}:5000/api`;
  }
}

// Helper to get auth header
const getHeaders = (isMultipart = false) => {
  const headers = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

// Generic request wrapper
const request = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const isMultipart = options.body instanceof FormData;
  
  const config = {
    ...options,
    headers: {
      ...getHeaders(isMultipart),
      ...options.headers,
    },
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json();
    
    if (!res.ok) {
      // Handle expired token
      if (res.status === 401 && data.code === 'TOKEN_EXPIRED') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/auth/signin';
        }
      }
      throw new Error(data.message || 'Something went wrong');
    }
    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
};

export const api = {
  // ─── Auth ───────────────────────────────────────────────────────────────────
  auth: {
    register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      return Promise.resolve({ success: true });
    },
    getMe: () => request('/auth/me'),
    customerRegister: (data) => request('/auth/customer/register', { method: 'POST', body: JSON.stringify(data) }),
    customerLogin: (data) => request('/auth/customer/login', { method: 'POST', body: JSON.stringify(data) }),
  },

  // ─── Restaurant ────────────────────────────────────────────────────────────
  restaurant: {
    list: (params = '') => request(`/restaurants?${params}`),
    getBySlug: (slug) => request(`/restaurants/slug/${slug}`),
    getById: (id) => request(`/restaurants/id/${id}`),
    update: (id, data) => request(`/restaurants/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    toggleLive: (id) => request(`/restaurants/${id}/go-live`, { method: 'PATCH' }),
    uploadLogo: (id, formData) => request(`/restaurants/${id}/logo`, { method: 'POST', body: formData }),
    uploadCover: (id, formData) => request(`/restaurants/${id}/cover`, { method: 'POST', body: formData }),
  },

  // ─── Onboarding ────────────────────────────────────────────────────────────
  onboarding: {
    saveStep: (step, data) => request('/onboarding/step', { method: 'POST', body: JSON.stringify({ step, data }) }),
    complete: () => request('/onboarding/complete', { method: 'POST' }),
    getStatus: () => request('/onboarding/status'),
  },

  // ─── Menu ───────────────────────────────────────────────────────────────────
  menu: {
    getPublic: (restaurantId) => request(`/menu/restaurant/${restaurantId}`),
    getCategories: () => request('/menu/categories'),
    createCategory: (data) => request('/menu/categories', { method: 'POST', body: JSON.stringify(data) }),
    updateCategory: (id, data) => request(`/menu/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteCategory: (id) => request(`/menu/categories/${id}`, { method: 'DELETE' }),
    
    getItems: (params = '') => request(`/menu/items?${params}`),
    createItem: (data) => request('/menu/items', { method: 'POST', body: JSON.stringify(data) }),
    updateItem: (id, data) => request(`/menu/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateAvailability: (id, availability) => request(`/menu/items/${id}/availability`, { method: 'PATCH', body: JSON.stringify({ availability }) }),
    updatePrice: (id, price, reason = '') => request(`/menu/items/${id}/price`, { method: 'PATCH', body: JSON.stringify({ price, reason }) }),
    deleteItem: (id) => request(`/menu/items/${id}`, { method: 'DELETE' }),
    uploadImage: (id, formData) => request(`/menu/items/${id}/image`, { method: 'POST', body: formData }),
  },

  // ─── Tables ─────────────────────────────────────────────────────────────────
  tables: {
    list: () => request('/tables'),
    create: (data) => request('/tables', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/tables/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/tables/${id}`, { method: 'DELETE' }),
    reset: (id) => request(`/tables/${id}/reset`, { method: 'POST' }),
    updateStatus: (id, status) => request(`/tables/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    resolveToken: (token) => request(`/tables/qr/${token}`),
    regenerateAllTokens: () => request('/tables/regenerate-tokens', { method: 'POST' }),
  },

  // ─── Table Sessions ────────────────────────────────────────────────────────
  sessions: {
    create: (data) => request('/sessions', { method: 'POST', body: JSON.stringify(data) }),
    get: (id) => request(`/sessions/${id}`),
    listActive: () => request('/sessions'),
    close: (id) => request(`/sessions/${id}/close`, { method: 'PATCH' }),
  },

  // ─── Orders ─────────────────────────────────────────────────────────────────
  orders: {
    list: (params = '') => request(`/orders?${params}`),
    place: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
    get: (id) => request(`/orders/${id}`),
    updateStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    cancel: (id) => request(`/orders/${id}`, { method: 'DELETE' }),
  },

  // ─── Reservations ───────────────────────────────────────────────────────────
  reservations: {
    list: (params = '') => request(`/reservations?${params}`),
    create: (data) => request('/reservations', { method: 'POST', body: JSON.stringify(data) }),
    get: (id) => request(`/reservations/${id}`),
    updateStatus: (id, status, details = {}) => request(`/reservations/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, ...details }) }),
    cancel: (id) => request(`/reservations/${id}`, { method: 'DELETE' }),
  },

  // ─── Queue ──────────────────────────────────────────────────────────────────
  queue: {
    list: (params = '') => request(`/queue?${params}`),
    publicList: (restaurantId) => request(`/queue/public/${restaurantId}`),
    join: (data) => request('/queue', { method: 'POST', body: JSON.stringify(data) }),
    seat: (id, tableId = null) => request(`/queue/${id}/seat`, { method: 'PATCH', body: JSON.stringify({ tableId }) }),
    leave: (id) => request(`/queue/${id}/leave`, { method: 'PATCH' }),
  },

  // ─── Billing ────────────────────────────────────────────────────────────────
  billing: {
    generate: (sessionId) => request('/billing/generate', { method: 'POST', body: JSON.stringify({ sessionId }) }),
    get: (sessionId) => request(`/billing/${sessionId}`),
    pay: (billId, paymentMethod = 'cash') => request(`/billing/${billId}/pay`, { method: 'PATCH', body: JSON.stringify({ paymentMethod }) }),
  },

  // ─── Inventory ──────────────────────────────────────────────────────────────
  inventory: {
    list: (status = '') => request(`/inventory?status=${status}`),
    create: (data) => request('/inventory', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/inventory/${id}`, { method: 'DELETE' }),
  },

  // ─── Memberships ────────────────────────────────────────────────────────────
  memberships: {
    list: (params = '') => request(`/memberships/customers?${params}`),
    getProfile: (id) => request(`/memberships/customers/${id}`),
    getMyMemberships: () => request('/memberships/me'),
    toggleFavorite: (restaurantId, itemId) => request('/memberships/favorites', { method: 'POST', body: JSON.stringify({ restaurantId, itemId }) }),
  },

  // ─── Analytics ──────────────────────────────────────────────────────────────
  analytics: {
    getToday: () => request('/analytics/today'),
    getWeek: () => request('/analytics/week'),
    getMonth: () => request('/analytics/month'),
    getPulse: () => request('/analytics/pulse'),
    getSaaS: () => request('/analytics/saas'),
  },

  // ─── AI Insights ────────────────────────────────────────────────────────────
  ai: {
    getOnboardingSummary: () => request('/ai/onboarding-summary', { method: 'POST' }),
    getMenuInsights: () => request('/ai/menu-insights', { method: 'POST' }),
    getOperationsSummary: (analyticsData = {}) => request('/ai/operations-summary', { method: 'POST', body: JSON.stringify({ analyticsData }) }),
    getRecommendation: (restaurantId, guestHistory = {}) => request('/ai/recommendation', { method: 'POST', body: JSON.stringify({ restaurantId, guestHistory }) }),
  },

  // ─── Staff Management ───────────────────────────────────────────────────────
  staff: {
    list: () => request('/restaurants/staff'),
    create: (data) => request('/restaurants/staff', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => request(`/restaurants/staff/${id}`, { method: 'DELETE' }),
  },

  // ─── Complaints ─────────────────────────────────────────────────────────────
  complaints: {
    list: (params = '') => request(`/complaints?${params}`),
    create: (data) => request('/complaints', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/complaints/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request(`/complaints/${id}`, { method: 'DELETE' }),
  },
};
