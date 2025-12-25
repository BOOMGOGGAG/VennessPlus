import axios from 'axios';

const API_BASE_URL = 'https://accounting.redirectme.net/api';

const api = axios.create({
  baseURL: API_BASE_URL,
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
  
  createExpense(expense) {
    return api.post('/expenses', expense);
  },
  
  updateExpense(id, expense) {
    return api.put(`/expenses/${id}`, expense);
  },
  
  deleteExpense(id) {
    return api.delete(`/expenses/${id}`);
  },

  // Categories
  getCategories() {
    return api.get('/categories');
  },
  
  getCategory(id) {
    return api.get(`/categories/${id}`);
  },
  
  createCategory(category) {
    return api.post('/categories', category);
  },
  
  updateCategory(id, category) {
    return api.put(`/categories/${id}`, category);
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
  }
};
