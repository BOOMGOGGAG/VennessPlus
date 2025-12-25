<template>
  <div>
    <!-- Page Header -->
    <div class="px-4 sm:px-0 mb-6 flex justify-between items-center">
      <div>
        <h2 class="text-3xl font-bold text-gray-900">Expenses</h2>
        <p class="mt-1 text-sm text-gray-600">Manage and track your expenses</p>
      </div>
      <button
        @click="openAddModal"
        class="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition flex items-center space-x-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>Add Expense</span>
      </button>
    </div>

    <!-- Filters and Sorting -->
    <div class="bg-white shadow rounded-lg p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <input
            type="date"
            v-model="filters.startDate"
            @change="loadExpenses"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <input
            type="date"
            v-model="filters.endDate"
            @change="loadExpenses"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            v-model="filters.categoryId"
            @change="loadExpenses"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Categories</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.icon }} {{ category.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
          <select
            v-model="filters.sortBy"
            @change="loadExpenses"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="expense_date">Date</option>
            <option value="amount">Amount</option>
            <option value="category_name">Category</option>
          </select>
        </div>
      </div>
      <div class="mt-4 flex justify-between items-center">
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-gray-700">Order:</label>
          <button
            @click="toggleSortOrder"
            class="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition text-sm"
          >
            {{ filters.sortOrder === 'desc' ? '↓ Descending' : '↑ Ascending' }}
          </button>
        </div>
        <button
          @click="clearFilters"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition text-sm"
        >
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Expenses Table -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="expenses.length === 0">
            <td colspan="5" class="px-6 py-4 text-center text-gray-500">
              No expenses found. Add your first expense!
            </td>
          </tr>
          <tr v-for="expense in expenses" :key="expense.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ formatDate(expense.expense_date) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                :style="{ backgroundColor: expense.category_color + '20', color: expense.category_color }"
              >
                {{ expense.category_icon }} {{ expense.category_name }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-900">
              {{ expense.description || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
              ${{ parseFloat(expense.amount).toFixed(2) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="openEditModal(expense)"
                class="text-primary hover:text-blue-700 mr-3"
              >
                Edit
              </button>
              <button
                @click="deleteExpense(expense.id)"
                class="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="closeModal"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">
            {{ editingExpense ? 'Edit Expense' : 'Add New Expense' }}
          </h3>
          <form @submit.prevent="saveExpense" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
              <input
                type="number"
                step="0.01"
                v-model="formData.amount"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                v-model="formData.category_id"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a category</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.icon }} {{ category.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                v-model="formData.expense_date"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                v-model="formData.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Optional description..."
              ></textarea>
            </div>
            <div class="flex space-x-3 pt-4">
              <button
                type="submit"
                class="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition"
              >
                {{ editingExpense ? 'Update' : 'Add' }}
              </button>
              <button
                type="button"
                @click="closeModal"
                class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import api from '../services/api';

export default {
  name: 'Expenses',
  setup() {
    const expenses = ref([]);
    const categories = ref([]);
    const showModal = ref(false);
    const editingExpense = ref(null);
    const formData = ref({
      amount: '',
      category_id: '',
      description: '',
      expense_date: new Date().toISOString().split('T')[0]
    });
    const filters = ref({
      startDate: '',
      endDate: '',
      categoryId: '',
      sortBy: 'expense_date',
      sortOrder: 'desc'
    });

    const loadExpenses = async () => {
      try {
        const params = {};
        if (filters.value.startDate) params.startDate = filters.value.startDate;
        if (filters.value.endDate) params.endDate = filters.value.endDate;
        if (filters.value.categoryId) params.categoryId = filters.value.categoryId;
        if (filters.value.sortBy) params.sortBy = filters.value.sortBy;
        if (filters.value.sortOrder) params.sortOrder = filters.value.sortOrder;

        const response = await api.getExpenses(params);
        expenses.value = response.data.data;
      } catch (error) {
        console.error('Error loading expenses:', error);
        alert('Failed to load expenses');
      }
    };

    const loadCategories = async () => {
      try {
        const response = await api.getCategories();
        categories.value = response.data.data;
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    const openAddModal = () => {
      editingExpense.value = null;
      formData.value = {
        amount: '',
        category_id: '',
        description: '',
        expense_date: new Date().toISOString().split('T')[0]
      };
      showModal.value = true;
    };

    const openEditModal = (expense) => {
      editingExpense.value = expense;
      formData.value = {
        amount: expense.amount,
        category_id: expense.category_id,
        description: expense.description || '',
        expense_date: expense.expense_date
      };
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
      editingExpense.value = null;
    };

    const saveExpense = async () => {
      try {
        if (editingExpense.value) {
          await api.updateExpense(editingExpense.value.id, formData.value);
        } else {
          await api.createExpense(formData.value);
        }
        closeModal();
        loadExpenses();
      } catch (error) {
        console.error('Error saving expense:', error);
        alert('Failed to save expense');
      }
    };

    const deleteExpense = async (id) => {
      if (!confirm('Are you sure you want to delete this expense?')) return;

      try {
        await api.deleteExpense(id);
        loadExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Failed to delete expense');
      }
    };

    const toggleSortOrder = () => {
      filters.value.sortOrder = filters.value.sortOrder === 'desc' ? 'asc' : 'desc';
      loadExpenses();
    };

    const clearFilters = () => {
      filters.value = {
        startDate: '',
        endDate: '',
        categoryId: '',
        sortBy: 'expense_date',
        sortOrder: 'desc'
      };
      loadExpenses();
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    onMounted(() => {
      loadExpenses();
      loadCategories();
    });

    return {
      expenses,
      categories,
      showModal,
      editingExpense,
      formData,
      filters,
      loadExpenses,
      openAddModal,
      openEditModal,
      closeModal,
      saveExpense,
      deleteExpense,
      toggleSortOrder,
      clearFilters,
      formatDate
    };
  }
};
</script>
