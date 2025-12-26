<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import api from '../services/api'

Chart.register(...registerables)

// state
const summary = ref({})
const categoryBreakdown = ref([])
const monthlyTrend = ref([])
const filters = ref({
  startDate: '',
  endDate: ''
})

const trendChart = ref(null)
let chartInstance = null

// methods
const loadDashboardData = async () => {
  try {
    const params = {}

    if (filters.value.startDate) {
      params.startDate = filters.value.startDate
    }

    if (filters.value.endDate) {
      params.endDate = filters.value.endDate
    }

    const [summaryRes, breakdownRes, trendRes] = await Promise.all([
      api.getDashboardSummary(params),
      api.getCategoryBreakdown(params),
      api.getMonthlyTrend({ months: 6 })
    ])

    summary.value = summaryRes.data.data
    categoryBreakdown.value = breakdownRes.data.data
    monthlyTrend.value = trendRes.data.data

    await nextTick()
    renderTrendChart()
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
}

const renderTrendChart = () => {
  if (!trendChart.value) return

  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = trendChart.value.getContext('2d')

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: monthlyTrend.value.map(item => item.month),
      datasets: [
        {
          label: 'Monthly Expenses',
          data: monthlyTrend.value.map(item =>
            parseFloat(item.total_amount)
          ),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback(value) {
              return '$' + value.toFixed(0)
            }
          }
        }
      }
    }
  })
}

const clearFilters = () => {
  filters.value.startDate = ''
  filters.value.endDate = ''
  loadDashboardData()
}

// lifecycle
onMounted(() => {
  loadDashboardData()
})
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="px-4 sm:px-0 mb-6">
      <h2 class="text-3xl font-bold text-gray-900">Dashboard</h2>
      <p class="mt-1 text-sm text-gray-600">Overview of your expenses</p>
    </div>

    <!-- Date Filter -->
    <div class="bg-white shadow rounded-lg p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <input
            type="date"
            v-model="filters.startDate"
            @change="loadDashboardData"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <input
            type="date"
            v-model="filters.endDate"
            @change="loadDashboardData"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div class="flex items-end mb-0.5">
          <button
            @click="clearFilters"
            class="w-full px-4 py-2 bg-red-500 text-white font-medium rounded-md hover:bg-red-300 transition"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Expenses</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">
              ${{ summary.total_amount ? parseFloat(summary.total_amount).toFixed(2) : '0.00' }}
            </p>
          </div>
          <div class="bg-red-100 rounded-full p-3">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Transactions</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">{{ summary.total_transactions || 0 }}</p>
          </div>
          <div class="bg-blue-100 rounded-full p-3">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Average Expense</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">
              ${{ summary.average_amount ? parseFloat(summary.average_amount).toFixed(2) : '0.00' }}
            </p>
          </div>
          <div class="bg-green-100 rounded-full p-3">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Highest Expense</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">
              ${{ summary.highest_expense ? parseFloat(summary.highest_expense).toFixed(2) : '0.00' }}
            </p>
          </div>
          <div class="bg-purple-100 rounded-full p-3">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Category Breakdown -->
      <router-link
        to="/expenses"
      >
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
          <div v-if="categoryBreakdown.length > 0" class="space-y-4">
            <div
              v-for="category in categoryBreakdown"
              :key="category.id"
              class="flex items-center justify-between"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                  :style="{ backgroundColor: category.color + '20' }"
                >
                  {{ category.icon }}
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ category.name }}</p>
                  <p class="text-sm text-gray-500">{{ category.transaction_count }} transactions</p>
                </div>
              </div>
              <div class="text-right flex-shrink-0">
                <p class="font-semibold text-gray-900">${{ parseFloat(category.total_amount).toFixed(2) }}</p>
                <p class="text-sm text-gray-500">{{ parseFloat(category.percentage).toFixed(1) }}%</p>
              </div>
            </div>
            <div class="mt-4">
              <div class="flex h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  v-for="category in categoryBreakdown"
                  :key="category.id"
                  :style="{ 
                    width: category.percentage + '%', 
                    backgroundColor: category.color 
                  }"
                  class="transition-all duration-300"
                ></div>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-gray-500 py-8">
            No expense data available
          </div>
        </div>
      </router-link>

      <!-- Monthly Trend -->
      <router-link
        to="/comparison"
      >
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h3>
          <div v-if="monthlyTrend.length > 0">
            <canvas ref="trendChart"></canvas>
          </div>
          <div v-else class="text-center text-gray-500 py-8">
            No trend data available
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>
