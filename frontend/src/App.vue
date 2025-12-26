<script setup>
import Navbar from './components/common/Navbar.vue';
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Navigation -->
    <Navbar />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <router-view />
    </main>
  </div>
</template>
