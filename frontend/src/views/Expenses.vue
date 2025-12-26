<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../services/api';
import ReceiptScanner from '../components/ReceiptScanner.vue';

// Helper function to get base URL
const getBaseUrl = () => {
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `${window.location.protocol}//${window.location.hostname}`;
  }
  return 'http://localhost:3000';
};

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
  sortOrder: 'desc',
  search: ''
});

const showReceiptScanner = ref(false);
const receiptFile = ref(null);
const receiptPreview = ref(null);
const showReceiptPreview = ref(false);
const previewReceiptUrl = ref(null);
const imageError = ref(false);

const filteredExpenses = computed(() => {
  if (!filters.value.search) {
    return expenses.value;
  }
  
  const searchLower = filters.value.search.toLowerCase();
  return expenses.value.filter(expense => {
    const descriptionMatch = expense.description?.toLowerCase().includes(searchLower);
    const categoryMatch = expense.category_name?.toLowerCase().includes(searchLower);
    const amountMatch = expense.amount.toString().includes(searchLower);
    
    return descriptionMatch || categoryMatch || amountMatch;
  });
});

const highlightSearch = (text) => {
  if (!filters.value.search || !text) return text;
  
  const searchLower = filters.value.search.toLowerCase();
  const textLower = text.toLowerCase();
  const index = textLower.indexOf(searchLower);
  
  if (index === -1) return text;
  
  const before = text.substring(0, index);
  const match = text.substring(index, index + filters.value.search.length);
  const after = text.substring(index + filters.value.search.length);
  
  return `${before}<mark class="bg-yellow-200 px-1 rounded">${match}</mark>${after}`;
};

const handleReceiptExtracted = (data) => {
  console.log('✅ Extracted data:', data);
  
  // Set form data
  formData.value.amount = data.amount || formData.value.amount;
  formData.value.expense_date = data.date || formData.value.expense_date;
  
  let description = data.merchant || '';
  if (data.items && data.items.length > 0) {
    const itemsList = data.items.map(item => `${item.name} ($${item.price})`).join(', ');
    description += description ? ` - ${itemsList}` : itemsList;
  }
  formData.value.description = description || formData.value.description;
  
  // AUTO-SAVE THE RECEIPT IMAGE!
  if (data.imageFile) {
    console.log('📸 Auto-saving receipt image from OCR');
    receiptFile.value = data.imageFile;
    receiptPreview.value = data.imagePreview;
  }
  
  showReceiptScanner.value = false;
  
  alert(`Receipt scanned!
    Amount: $${data.amount}
    Merchant: ${data.merchant || 'Unknown'}
    Receipt image saved!`
  );
};


const handleReceiptUpload = (event) => {
  const file = event.target.files[0];
  if (!file) {
    console.log('❌ No file selected');
    return;
  }

  console.log('📁 File selected:', file.name, file.type, `${(file.size / 1024).toFixed(2)} KB`);

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('❌ Please select an image file');
    return;
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('❌ File size must be less than 5MB');
    return;
  }

  receiptFile.value = file;
  imageError.value = false;
  
  const reader = new FileReader();
  
  reader.onload = (e) => {
    receiptPreview.value = e.target.result;
    console.log('✅ Preview generated:', receiptPreview.value.substring(0, 50) + '...');
  };
  
  reader.onerror = (error) => {
    console.error('❌ FileReader error:', error);
    imageError.value = true;
    alert('❌ Error reading file');
  };
  
  reader.readAsDataURL(file);
};

const handleImageError = () => {
  console.error('❌ Image failed to load');
  imageError.value = true;
};

const handleImageLoad = () => {
  console.log('✅ Image loaded successfully');
  imageError.value = false;
};

const removeReceipt = () => {
  receiptFile.value = null;
  receiptPreview.value = null;
  imageError.value = false;
  console.log('🗑️ Receipt removed');
};

const viewReceipt = (receiptUrl) => {
  let finalUrl = receiptUrl;

  if (finalUrl && finalUrl.includes('/uploads/receipts/')) {
    finalUrl = finalUrl.replace('/uploads/receipts/', '/api/receipts/image/');
  }

  previewReceiptUrl.value = `${getBaseUrl()}${finalUrl}`;

  showReceiptPreview.value = true;
  console.log('Viewing receipt:', previewReceiptUrl.value);
};

const closeReceiptPreview = () => {
  showReceiptPreview.value = false;
  previewReceiptUrl.value = null;
};

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
  receiptFile.value = null;
  receiptPreview.value = null;
  imageError.value = false;
  showReceiptScanner.value = false;
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
  receiptFile.value = null;
  receiptPreview.value = expense.receipt_image ? `${getBaseUrl()}${expense.receipt_image}` : null;
  imageError.value = false;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingExpense.value = null;
  receiptFile.value = null;
  receiptPreview.value = null;
  imageError.value = false;
  showReceiptScanner.value = false;
};

const saveExpense = async () => {
  try {
    const formDataToSend = new FormData();
    formDataToSend.append('amount', formData.value.amount);
    formDataToSend.append('category_id', formData.value.category_id);
    formDataToSend.append('description', formData.value.description || '');
    formDataToSend.append('expense_date', formData.value.expense_date);

    if (receiptFile.value) {
      console.log('📤 Uploading receipt file:', receiptFile.value.name);
      formDataToSend.append('receipt', receiptFile.value);
    } else if (editingExpense.value && receiptPreview.value && !receiptPreview.value.startsWith('data:')) {
      formDataToSend.append('keep_receipt', 'true');
    }

    if (editingExpense.value) {
      await api.updateExpense(editingExpense.value.id, formDataToSend);
    } else {
      await api.createExpense(formDataToSend);
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
    sortOrder: 'desc',
    search: ''
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

const orderByLabel = computed(() => {
  const labels = {
    'expense_date': 'Date',
    'category_name': 'Category',
    'amount': 'Amount'
  };
  return labels[filters.value.sortBy] || null;
});

onMounted(() => {
  console.log('🚀 Component mounted, base URL:', getBaseUrl());
  loadExpenses();
  loadCategories();
});
</script>

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

    <!-- Search Bar -->
    <div class="rounded-lg w-1/2 p-4 mb-3 mx-auto">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <!-- Box for type -->
        <input
          type="text"
          v-model="filters.search"
          class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
          placeholder="Search by description, category, or amount..."
        />

        <!-- Clear -->
        <div
          v-if="filters.search"
          class="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <button
            @click="filters.search = ''"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <!-- Found [number] result -->
      <div v-if="filters.search" class="mt-2 text-sm text-gray-600">
        Found {{ filteredExpenses.length }} result{{ filteredExpenses.length !== 1 ? 's' : '' }}
      </div>
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
          <label class="text-sm font-medium text-gray-700">Order by {{ orderByLabel }}:</label>
          <button
            @click="toggleSortOrder"
            class="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition text-sm"
          >
            {{ filters.sortOrder === 'desc' ? '↓ Descending' : '↑ Ascending' }}
          </button>
        </div>
        <button
          @click="clearFilters"
          class="px-4 py-2 bg-red-500 text-white font-medium rounded-md hover:bg-red-300 transition text-sm"
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
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="filteredExpenses.length === 0">
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">
              {{ filters.search ? 'No expenses match your search' : 'No expenses found. Add your first expense!' }}
            </td>
          </tr>
          <tr v-for="expense in filteredExpenses" :key="expense.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ formatDate(expense.expense_date) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap max-w-xs">
              <span
                class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full block truncate"
                :style="{ backgroundColor: expense.category_color + '20', color: expense.category_color }"
              >
                {{ expense.category_icon }} {{ expense.category_name }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-900 max-w-xs">
              <span v-if="filters.search && expense.description" v-html="highlightSearch(expense.description)"></span>
              <span v-else class="block truncate">{{ expense.description || '-' }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
              ${{ parseFloat(expense.amount).toFixed(2) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <button
                v-if="expense.receipt_image"
                @click="viewReceipt(expense.receipt_image)"
                class="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <span class="material-symbols-outlined text-lg">
                  receipt_long
                </span>
                <span>View</span>
              </button>
              <span v-else class="text-gray-400">-</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="openEditModal(expense)"
                class="text-primary hover:text-blue-700 mr-3"
              >
                <span class="material-symbols-outlined">
                  edit
                </span>
              </button>
              <button
                @click="deleteExpense(expense.id)"
                class="text-red-600 hover:text-red-800"
              >
                <span class="material-symbols-outlined">
                  delete
                </span>
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
      <div class="relative top-10 mx-auto p-6 border w-full max-w-3xl shadow-2xl rounded-xl bg-white my-8">
        <div>
          <!-- Modal Header -->
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-gray-900">
              {{ editingExpense ? 'Edit Expense' : 'Add New Expense' }}
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Receipt Scanner Section (Only for new expenses) -->
          <div v-if="!editingExpense" class="mb-6">
            <!-- Scanner Toggle Card -->
            <div 
              class="border-2 rounded-xl overflow-hidden transition-all"
              :class="showReceiptScanner ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50'"
            >
              <!-- Toggle Button -->
              <button
                @click="showReceiptScanner = !showReceiptScanner"
                type="button"
                class="w-full px-6 py-4 flex items-center justify-between hover:bg-white/50 transition"
              >
                <div class="flex items-center space-x-3">
                  <div class="p-2 bg-purple-600 rounded-lg">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div class="text-left">
                    <p class="text-lg font-semibold text-gray-900">Scan Receipt (OCR)</p>
                    <p class="text-sm text-gray-600">Auto-extract amount, date, and merchant from receipt image</p>
                  </div>
                </div>
                <svg 
                  class="w-6 h-6 text-gray-400 transition-transform duration-200" 
                  :class="showReceiptScanner ? 'rotate-180' : ''"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Scanner Content -->
              <div 
                v-show="showReceiptScanner"
                class="border-t border-purple-200 bg-white p-6"
              >
                <ReceiptScanner @extracted="handleReceiptExtracted" />
              </div>
            </div>
          </div>

          <!-- Divider -->
          <div v-if="!editingExpense && showReceiptScanner" class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-white text-gray-500 font-medium">or enter manually</span>
            </div>
          </div>

          <!-- Manual Entry Form -->
          <form @submit.prevent="saveExpense" class="space-y-5">
            <!-- Amount -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Amount *
              </label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-lg">$</span>
                <input
                  type="number"
                  step="0.01"
                  v-model="formData.amount"
                  required
                  class="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
                  placeholder="0.00"
                />
              </div>
            </div>

            <!-- Category -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Category *
              </label>
              <select
                v-model="formData.category_id"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base"
              >
                <option value="">Select a category</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.icon }} {{ category.name }}
                </option>
              </select>
            </div>

            <!-- Date -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                v-model="formData.expense_date"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                v-model="formData.description"
                rows="4"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base resize-none"
                placeholder="Add notes about this expense..."
              ></textarea>
            </div>

            <!-- Receipt Upload -->
            <div>              
              <!-- Show if receipt was auto-saved from OCR -->
              <div v-if="receiptPreview && !editingExpense" class="mb-3 p-3 bg-green-50 border border-green-300 rounded-lg">
                <div class="flex items-start space-x-2">
                  <svg class="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div class="flex-1">
                    <p class="text-sm font-semibold text-green-800">Receipt image saved from OCR scan</p>
                    <p class="text-xs text-green-700 mt-1">Your scanned receipt will be automatically attached to this expense</p>
                  </div>
                </div>
              </div>
              
              <!-- Receipt Preview -->
              <div v-if="receiptPreview" class="mb-3">
                <div class="relative inline-block">
                  <img 
                    :src="receiptPreview" 
                    alt="Receipt preview" 
                    class="h-32 rounded-lg border-2 border-gray-300 shadow-md"
                    @error="handleImageError"
                    @load="handleImageLoad"
                  />
                  <button
                    @click="removeReceipt"
                    type="button"
                    class="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Error Message -->
              <div v-if="imageError" class="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-sm text-red-700">❌ Failed to load image preview</p>
                <button
                  @click="removeReceipt"
                  type="button"
                  class="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                >
                  Remove and try again
                </button>
              </div>

              <!-- Upload Button (only show if no receipt yet) -->
              <div v-if="!receiptPreview">
                <label class="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition">
                  <svg class="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span class="text-sm font-medium text-gray-700">
                    Upload Receipt Manually
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    @change="handleReceiptUpload"
                    class="hidden"
                  />
                </label>
                <p class="text-xs text-gray-500 mt-1">Optional - Or use OCR scanner above to auto-extract data</p>
              </div>
              
              <!-- Change Receipt Button (if receipt already exists) -->
              <div v-else>
                <label class="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 transition">
                  <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span class="text-sm font-medium text-blue-700">
                    Replace Receipt
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    @change="handleReceiptUpload"
                    class="hidden"
                  />
                </label>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex space-x-3 pt-4">
              <button
                type="submit"
                class="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-semibold shadow-md hover:shadow-lg"
              >
                {{ editingExpense ? 'Update' : 'Add' }} Expense
              </button>
              <button
                type="button"
                @click="closeModal"
                class="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Receipt Preview Modal -->
    <div
      v-if="showReceiptPreview"
      class="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center"
      @click.self="closeReceiptPreview"
    >
      <div class="relative max-w-4xl max-h-screen p-4">
        <button
          @click="closeReceiptPreview"
          class="absolute top-6 right-6 p-2 bg-white rounded-full hover:bg-gray-100 shadow-lg z-10"
        >
          <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img :src="previewReceiptUrl" alt="Receipt" class="max-w-full max-h-screen rounded-lg shadow-2xl" />
      </div>
    </div>
  </div>
</template>
