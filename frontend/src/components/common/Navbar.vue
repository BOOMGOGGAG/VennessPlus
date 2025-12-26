<template>
  <nav class="bg-white shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <!-- Heading -->
          <div class="flex-shrink-0 flex items-center">
            <h1 class="text-2xl font-bold text-green-500">
              <span class="material-symbols-outlined align-top text-3xl mr-1">
                payments
              </span>
              Expense Tracker
              </h1>
          </div>

          <!-- Tabs -->
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <router-link
              to="/"
              class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              active-class="border-primary text-gray-900"
            >
              Dashboard
            </router-link>
            <router-link
              to="/expenses"
              class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              active-class="border-primary text-gray-900"
            >
              Expenses
            </router-link>
            <router-link
              to="/comparison"
              class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              active-class="border-primary text-gray-900"
            >
              Chart
            </router-link>
            <router-link
                to="/categories"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                active-class="border-primary text-gray-900"
              >
                Categories
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>