<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const categories = ref([]);
const showModal = ref(false);
const editingCategory = ref(null);
const formData = ref({
  name: '',
  icon: '💰',
  color: '#3B82F6'
});

// Emoji options for quick selection
const emojiOptions = [
  '🍔', '🚗', '🛍️', '🎬', '💡', '⚕️', '📚', '📌',
  '✈️', '🏠', '💻', '🎮', '🎵', '🏋️', '🍕', '☕',
  '🎨', '🐕', '🌳', '🔧', '📱', '👔', '🎁', '🏖️'
];

// Color options for quick selection
const colorOptions = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
  '#8B5CF6', '#EC4899', '#06B6D4', '#6B7280',
  '#F97316', '#84CC16', '#14B8A6', '#6366F1',
  '#A855F7', '#E11D48', '#0EA5E9', '#64748B'
];

const loadCategories = async () => {
  try {
    const response = await api.getCategories();
    categories.value = response.data.data;
    // console.log(categories.value)
  } catch (error) {
    console.error('Error loading categories:', error);
    alert('Failed to load categories');
  }
};

const openAddModal = () => {
  editingCategory.value = null;
  formData.value = {
    name: '',
    icon: '💰',
    color: '#3B82F6'
  };
  showModal.value = true;
};

const openEditModal = (category) => {
  editingCategory.value = category;
  formData.value = {
    name: category.name,
    icon: category.icon,
    color: category.color
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingCategory.value = null;
};

const saveCategory = async () => {
  try {
    if (editingCategory.value) {
      await api.updateCategory(editingCategory.value.id, formData.value);
    } else {
      await api.createCategory(formData.value);
    }
    closeModal();
    loadCategories();
  } catch (error) {
    console.error('Error saving category:', error);
    if (error.response?.status === 500 && error.response?.data?.message?.includes('Duplicate')) {
      alert('Category name already exists. Please use a different name.');
    } else {
      alert('Failed to save category');
    }
  }
};

const deleteCategory = async (category) => {
  if (!confirm(`Are you sure you want to delete "${category.name}"?\n\nNote: You cannot delete categories that have expenses.`)) {
    return;
  }

  try {
    await api.deleteCategory(category.id);
    loadCategories();
  } catch (error) {
    console.error('Error deleting category:', error);
    if (error.response?.status === 500) {
      alert('Cannot delete this category because it has expenses associated with it.');
    } else {
      alert('Failed to delete category');
    }
  }
};

onMounted(() => {
  loadCategories();
});
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="px-4 sm:px-0 mb-6 flex justify-between items-center">
      <div>
        <h2 class="text-3xl font-bold text-gray-900">Categories</h2>
        <p class="mt-1 text-sm text-gray-600">Manage your expense categories</p>
      </div>
      <button
        @click="openAddModal"
        class="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition flex items-center space-x-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>Add Category</span>
      </button>
    </div>

    <!-- Categories Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="category in categories"
        :key="category.id"
        class="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition"
      >
        <!-- Category Header -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              :style="{ backgroundColor: category.color + '20' }"
            >
              {{ category.icon }}
            </div>
            <div class="flex-1 space-y-0.5">
              <h3 class="text-lg font-semibold text-gray-900">{{ category.name }}</h3>
              <!-- Color -->
              <div class="flex items-center space-x-2 mt-1">
                <div
                  class="w-4 h-4 rounded border-2 border-gray-300"
                  :style="{ backgroundColor: category.color }"
                ></div>
                <span class="text-sm font-mono text-gray-700">{{ category.color }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="flex space-x-2">
          <button
            @click="openEditModal(category)"
            class="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition text-sm font-medium"
          >
            Edit
          </button>
          <button
            @click="deleteCategory(category)"
            class="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="categories.length === 0"
        class="col-span-full text-center py-12 text-gray-500"
      >
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <p class="text-lg font-medium">No categories yet</p>
        <p class="text-sm mt-1">Click "Add Category" to create your first category</p>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
      @click.self="closeModal"
    >
      <div class="relative p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">
          {{ editingCategory ? 'Edit Category' : 'Add New Category' }}
        </h3>
        <form @submit.prevent="saveCategory" class="space-y-4">
          <!-- Preview  -->
          <div class="bg-gradient-to-br from-gray-50 to-blue-50 p-5 rounded-lg border-2 border-blue-100">
            <p class="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Live Preview
            </p>
            <div class="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm">
              <div
                class="w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-md"
                :style="{ backgroundColor: formData.color + '20', border: `2px solid ${formData.color}` }"
              >
                {{ formData.icon || '?' }}
              </div>
              <div class="flex-1">
                <p class="font-bold text-gray-900 text-lg">{{ formData.name || 'Category Name' }}</p>
                <div class="flex items-center space-x-2 mt-1">
                  <div
                    class="w-4 h-4 rounded border border-gray-300"
                    :style="{ backgroundColor: formData.color }"
                  ></div>
                  <span class="text-xs font-mono text-gray-600">{{ formData.color }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Category Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              v-model="formData.name"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Food & Dining"
            />
          </div>

          <!-- Icon -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Icon (Emoji) *
            </label>
            <div class="grid grid-cols-8 gap-2 mb-2">
              <button
                v-for="emoji in emojiOptions"
                :key="emoji"
                type="button"
                @click="formData.icon = emoji"
                class="w-10 h-10 text-2xl rounded border-2 hover:border-primary transition"
                :class="formData.icon === emoji ? 'border-primary bg-blue-50' : 'border-gray-200'"
              >
                {{ emoji }}
              </button>
            </div>
            <label class="block text-sm font-medium text-gray-700 mb-2"> 
              Custom Emoji
            </label>
            <input
              type="text"
              v-model="formData.icon"
              required
              maxlength="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Or type emoji: 🍔"
            />
          </div>

          <!-- Color Picker -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Color *
            </label>
            <div class="grid grid-cols-8 gap-2 mb-2">
              <button
                v-for="color in colorOptions"
                :key="color"
                type="button"
                @click="formData.color = color"
                class="w-10 h-10 rounded border-2 hover:border-gray-400 transition"
                :class="formData.color === color ? 'border-gray-800 ring-2 ring-offset-2 ring-primary' : 'border-gray-200'"
                :style="{ backgroundColor: color }"
              ></button>
            </div>
            <input
              type="color"
              v-model="formData.color"
              required
              class="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
            />
            <p class="text-xs text-gray-500 mt-1">Selected: {{ formData.color }}</p>
          </div>

          <!-- Buttons -->
          <div class="flex space-x-3 pt-4">
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition"
            >
              {{ editingCategory ? 'Update' : 'Add' }}
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
</template>