const Expense = require('../models/Expense');

class DashboardController {
  static async getSummary(req, res) {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const summary = await Expense.getSummary(filters);
      
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Error fetching summary:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching summary',
        error: error.message
      });
    }
  }

  static async getCategoryBreakdown(req, res) {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const breakdown = await Expense.getCategoryBreakdown(filters);
      
      res.json({
        success: true,
        data: breakdown
      });
    } catch (error) {
      console.error('Error fetching category breakdown:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching category breakdown',
        error: error.message
      });
    }
  }

  static async getMonthlyTrend(req, res) {
    try {
      const months = parseInt(req.query.months) || 6;
      const trend = await Expense.getMonthlyTrend(months);
      
      res.json({
        success: true,
        data: trend
      });
    } catch (error) {
      console.error('Error fetching monthly trend:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching monthly trend',
        error: error.message
      });
    }
  }

  static async getCategoryComparison(req, res) {
    try {
      const months = parseInt(req.query.months) || 6;
      const comparison = await Expense.getCategoryComparison(months);
      
      res.json({
        success: true,
        data: comparison
      });
    } catch (error) {
      console.error('Error fetching category comparison:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching category comparison',
        error: error.message
      });
    }
  }

  static async getCategoryGrowth(req, res) {
    try {
      const growth = await Expense.getCategoryGrowth();
      
      res.json({
        success: true,
        data: growth
      });
    } catch (error) {
      console.error('Error fetching category growth:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching category growth',
        error: error.message
      });
    }
  }
}

module.exports = DashboardController;
