const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');

// Get summary statistics
router.get('/summary', DashboardController.getSummary);

// Get category breakdown
router.get('/category-breakdown', DashboardController.getCategoryBreakdown);

// Get monthly trend
router.get('/monthly-trend', DashboardController.getMonthlyTrend);

module.exports = router;
