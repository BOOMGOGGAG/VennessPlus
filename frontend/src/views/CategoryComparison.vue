<script setup>
import { ref, onMounted, nextTick, computed } from 'vue';
import { Chart, registerables } from 'chart.js';
import api from '../services/api';

Chart.register(...registerables);

const comparisonData = ref([]);
const growthData = ref([]);
const selectedMonths = ref(6);
const chartType = ref('line'); // 'line', 'bar', 'pie'
const chartRef = ref(null);
let chartInstance = null;

// Group comparison data by category
const categorizedData = computed(() => {
  const grouped = {};
  
  comparisonData.value.forEach(item => {
    if (!grouped[item.category_id]) {
      grouped[item.category_id] = {
        id: item.category_id,
        name: item.category_name,
        color: item.category_color,
        icon: item.category_icon,
        months: []
      };
    }
    grouped[item.category_id].months.push({
      month: item.month,
      amount: parseFloat(item.total_amount),
      transactions: item.transaction_count
    });
  });
  
  return Object.values(grouped);
});

// Get unique months for chart labels
const monthLabels = computed(() => {
  const months = new Set();
  comparisonData.value.forEach(item => months.add(item.month));
  return Array.from(months).sort();
});

// Calculate total by category for pie chart
const categoryTotals = computed(() => {
  const totals = {};
  
  comparisonData.value.forEach(item => {
    if (!totals[item.category_id]) {
      totals[item.category_id] = {
        id: item.category_id,
        name: item.category_name,
        color: item.category_color,
        icon: item.category_icon,
        total: 0
      };
    }
    totals[item.category_id].total += parseFloat(item.total_amount);
  });
  
  return Object.values(totals).sort((a, b) => b.total - a.total);
});

const loadData = async () => {
  try {
    const [comparisonRes, growthRes] = await Promise.all([
      api.getCategoryComparison({ months: selectedMonths.value }),
      api.getCategoryGrowth()
    ]);
    
    comparisonData.value = comparisonRes.data.data;
    growthData.value = growthRes.data.data;
    
    await nextTick();
    renderChart();
  } catch (error) {
    console.error('Error loading comparison data:', error);
  }
};

const renderChart = () => {
  if (!chartRef.value) return;
  
  if (chartInstance) {
    chartInstance.destroy();
  }
  
  const ctx = chartRef.value.getContext('2d');
  
  if (chartType.value === 'pie') {
    renderPieChart(ctx);
  } else if (chartType.value === 'bar') {
    renderBarChart(ctx);
  } else {
    renderLineChart(ctx);
  }
};

const renderLineChart = (ctx) => {
  const datasets = categorizedData.value.map(category => {
    const data = monthLabels.value.map(month => {
      const monthData = category.months.find(m => m.month === month);
      return monthData ? monthData.amount : 0;
    });
    
    return {
      label: category.name,
      data: data,
      borderColor: category.color,
      backgroundColor: category.color + '20',
      tension: 0.4,
      fill: false
    };
  });
  
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: monthLabels.value,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return context.dataset.label + ': $' + context.parsed.y.toFixed(2);
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => '$' + value.toFixed(0)
          }
        }
      }
    }
  });
};

const renderBarChart = (ctx) => {
  const datasets = categorizedData.value.map(category => {
    const data = monthLabels.value.map(month => {
      const monthData = category.months.find(m => m.month === month);
      return monthData ? monthData.amount : 0;
    });
    
    return {
      label: category.name,
      data: data,
      backgroundColor: category.color,
      borderColor: category.color,
      borderWidth: 1
    };
  });
  
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: monthLabels.value,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return context.dataset.label + ': $' + context.parsed.y.toFixed(2);
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => '$' + value.toFixed(0)
          }
        }
      }
    }
  });
};

const renderPieChart = (ctx) => {
  chartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: categoryTotals.value.map(c => c.icon + ' ' + c.name),
      datasets: [{
        data: categoryTotals.value.map(c => c.total),
        backgroundColor: categoryTotals.value.map(c => c.color),
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const total = categoryTotals.value.reduce((sum, c) => sum + c.total, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return context.label + ': $' + context.parsed.toFixed(2) + ' (' + percentage + '%)';
            }
          }
        }
      }
    }
  });
};

const changeChartType = (type) => {
  chartType.value = type;
  renderChart();
};

const changeMonths = async () => {
  await loadData();
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="px-4 sm:px-0 mb-6">
      <h2 class="text-3xl font-bold text-gray-900">Category Comparison</h2>
      <p class="mt-1 text-sm text-gray-600">Compare spending across categories over time</p>
    </div>

    <!-- Controls -->
    <div class="bg-white shadow rounded-lg p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Time Period Selector -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
          <select
            v-model="selectedMonths"
            @change="changeMonths"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option :value="3">Last 3 Months</option>
            <option :value="6">Last 6 Months</option>
            <option :value="12">Last 12 Months</option>
            <option :value="24">Last 24 Months</option>
          </select>
        </div>

        <!-- Chart Type Selector -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
          <div class="flex space-x-2">
            <button
              @click="changeChartType('line')"
              class="flex-1 px-4 py-2 rounded-md transition"
              :class="chartType === 'line' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
            >
              📈 Line
            </button>
            <button
              @click="changeChartType('bar')"
              class="flex-1 px-4 py-2 rounded-md transition"
              :class="chartType === 'bar' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
            >
              📊 Bar
            </button>
            <button
              @click="changeChartType('pie')"
              class="flex-1 px-4 py-2 rounded-md transition"
              :class="chartType === 'pie' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
            >
              🥧 Pie
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart Display -->
    <div class="bg-white shadow rounded-lg p-6 mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        {{ chartType === 'pie' ? 'Total Spending by Category' : 'Category Spending Trends' }}
      </h3>
      <div class="relative" style="height: 400px;">
        <canvas ref="chartRef"></canvas>
      </div>
    </div>

    <!-- Growth Analysis -->
    <div class="bg-white shadow rounded-lg p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Growth Analysis (Current vs Previous Month)</h3>
      <div class="space-y-3">
        <div
          v-for="category in growthData"
          :key="category.id"
          class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
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
              <div class="flex items-center space-x-4 text-sm text-gray-600">
                <span>Previous: ${{ category.previous_month.toFixed(2) }}</span>
                <span>Current: ${{ category.current_month.toFixed(2) }}</span>
              </div>
            </div>
          </div>
          <div class="text-right flex-shrink-0">
            <div
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
              :class="category.growth_percentage > 0 ? 'bg-red-100 text-red-800' : category.growth_percentage < 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
            >
              <svg
                v-if="category.growth_percentage > 0"
                class="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <svg
                v-else-if="category.growth_percentage < 0"
                class="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
              {{ category.growth_percentage > 0 ? '+' : '' }}{{ category.growth_percentage.toFixed(1) }}%
            </div>
            <p class="text-xs text-gray-500 mt-1">
              {{ category.growth_amount > 0 ? '+' : '' }}${{ category.growth_amount.toFixed(2) }}
            </p>
          </div>
        </div>

        <div v-if="growthData.length === 0" class="text-center text-gray-500 py-8">
          No growth data available
        </div>
      </div>
    </div>
  </div>
</template>
