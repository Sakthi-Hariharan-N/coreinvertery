const API_BASE = 'http://localhost:8000/api';

export const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'API Request Failed');
    }
    
    return response.json();
  },

  auth: {
    login(email, password) {
      return api.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: "Login", role: "staff" }), 
      });
    },
    signup(name, email, password, role="staff") {
      return api.request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      });
    },
    resetPasswordRequest(email) {
      return api.request(`/auth/reset-password-otp?email=${encodeURIComponent(email)}`, {
        method: 'POST'
      });
    },
    resetPasswordVerify(email, otp, newPassword) {
      return api.request('/auth/reset-password-verify', {
        method: 'POST',
        body: JSON.stringify({ email, otp, new_password: newPassword }),
      });
    }
  },
  
  dashboard: {
    getKPIs() {
      return api.request('/dashboard/kpis');
    }
  },

  products: {
    getAll() {
      return api.request('/products/');
    },
    create(data) {
      return api.request('/products/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
  },

  inventory: {
    createReceipt(data) {
      return api.request('/inventory/receipts', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    validateReceipt(id) {
      return api.request(`/inventory/receipts/${id}/validate`, {
        method: 'PUT',
      });
    },
    createDelivery(data) {
      return api.request('/inventory/deliveries', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    validateDelivery(id) {
      return api.request(`/inventory/deliveries/${id}/validate`, {
        method: 'PUT',
      });
    },
  }
};
