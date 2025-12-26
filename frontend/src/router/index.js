import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import Expenses from '../views/Expenses.vue';
import Categories from '../views/Categories.vue';
import CategoryComparison from '../views/CategoryComparison.vue';

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/expenses',
    name: 'Expenses',
    component: Expenses
  },
  {
    path: '/categories',
    name: 'Categories',
    component: Categories
  },
  {
    path: '/comparison',
    name: 'CategoryComparison',
    component: CategoryComparison
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;