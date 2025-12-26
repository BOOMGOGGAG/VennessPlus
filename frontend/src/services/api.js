import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default {
  // Expenses
  getExpenses(params = {}) {
    return api.get('/expenses', { params });
  },

  getExpense(id) {
    return api.get(`/expenses/${id}`);
  },

  createExpense(data) {
    // If data contains a file, use FormData
    if (data instanceof FormData) {
      return api.post('/expenses', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.post('/expenses', data);
  },

  updateExpense(id, data) {
    // If data contains a file, use FormData
    if (data instanceof FormData) {
      return api.put(`/expenses/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.put(`/expenses/${id}`, data);
  },

  deleteExpense(id) {
    return api.delete(`/expenses/${id}`);
  },

  // Categories
  getCategories() {
    return api.get('/categories');
  },

  createCategory(data) {
    return api.post('/categories', data);
  },

  updateCategory(id, data) {
    return api.put(`/categories/${id}`, data);
  },

  deleteCategory(id) {
    return api.delete(`/categories/${id}`);
  },

  // Dashboard
  getDashboardSummary(params = {}) {
    return api.get('/dashboard/summary', { params });
  },

  getCategoryBreakdown(params = {}) {
    return api.get('/dashboard/category-breakdown', { params });
  },

  getMonthlyTrend(params = {}) {
    return api.get('/dashboard/monthly-trend', { params });
  },

  getCategoryComparison(params = {}) {
    return api.get('/dashboard/category-comparison', { params });
  },

  getCategoryGrowth() {
    return api.get('/dashboard/category-growth');
  },

  // Receipts
  uploadReceipt(file) {
    const formData = new FormData();
    formData.append('receipt', file);
    return api.post('/receipts/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  deleteReceipt(filename) {
    return api.delete(`/receipts/${filename}`);
  }
};