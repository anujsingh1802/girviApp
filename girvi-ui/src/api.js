const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const API_ENDPOINTS = {
  CUSTOMERS: `${API_BASE_URL}/api/auth/customers`,
  CUSTOMER_SINGLE: `${API_BASE_URL}/api/auth/customer`,
  CUSTOMER_PROFILE: (id) => `${API_BASE_URL}/api/auth/customer/${id}`,
  USER_SUMMARY: (id) => `${API_BASE_URL}/api/auth/user/${id}/summary`,
  DASHBOARD_SUMMARY: `${API_BASE_URL}/api/dashboard/summary`,
  LOANS_ALL: `${API_BASE_URL}/api/loan/public/all`,
  LOAN_APPLY: `${API_BASE_URL}/api/loan/public/apply`,
  NOTIFICATIONS: `${API_BASE_URL}/api/notifications`,
  PAYMENT_HISTORY: `${API_BASE_URL}/api/payment/public/history`,
  PAYMENT_PUBLIC: `${API_BASE_URL}/api/payment/public/pay`,
  ITEMS_ALL: `${API_BASE_URL}/api/items/public/all`,
  RECEIPT_PUBLIC: (txnId) => `${API_BASE_URL}/api/receipt/${txnId}`
};

export default API_BASE_URL;
