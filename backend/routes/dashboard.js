const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');

// Get summary statistics
router.get('/summary', DashboardController.getSummary);

// Get category breakdown
router.get('/category-breakdown', DashboardController.getCategoryBreakdown);

// Get monthly trend
router.get('/monthly-trend', DashboardController.getMonthlyTrend);

// Get category comparison over time
router.get('/category-comparison', DashboardController.getCategoryComparison);

// Get category growth (current vs previous month)
router.get('/category-growth', DashboardController.getCategoryGrowth);

module.exports = router;