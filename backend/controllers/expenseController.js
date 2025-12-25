const Expense = require('../models/Expense');

class ExpenseController {
  static async getAllExpenses(req, res) {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        categoryId: req.query.categoryId,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      };

      const expenses = await Expense.getAll(filters);
      res.json({
        success: true,
        data: expenses,
        count: expenses.length
      });
    } catch (error) {
      console.error('Error fetching expenses:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching expenses',
        error: error.message
      });
    }
  }

  static async getExpenseById(req, res) {
    try {
      const expense = await Expense.getById(req.params.id);
      
      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
      }

      res.json({
        success: true,
        data: expense
      });
    } catch (error) {
      console.error('Error fetching expense:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching expense',
        error: error.message
      });
    }
  }

  static async createExpense(req, res) {
    try {
      const { amount, category_id, description, expense_date } = req.body;

      // Validation
      if (!amount || !category_id || !expense_date) {
        return res.status(400).json({
          success: false,
          message: 'Amount, category, and date are required'
        });
      }

      const expense = await Expense.create({
        amount,
        category_id,
        description: description || '',
        expense_date
      });

      res.status(201).json({
        success: true,
        message: 'Expense created successfully',
        data: expense
      });
    } catch (error) {
      console.error('Error creating expense:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating expense',
        error: error.message
      });
    }
  }

  static async updateExpense(req, res) {
    try {
      const { amount, category_id, description, expense_date } = req.body;

      // Validation
      if (!amount || !category_id || !expense_date) {
        return res.status(400).json({
          success: false,
          message: 'Amount, category, and date are required'
        });
      }

      const expense = await Expense.update(req.params.id, {
        amount,
        category_id,
        description: description || '',
        expense_date
      });

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
      }

      res.json({
        success: true,
        message: 'Expense updated successfully',
        data: expense
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating expense',
        error: error.message
      });
    }
  }

  static async deleteExpense(req, res) {
    try {
      const deleted = await Expense.delete(req.params.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
      }

      res.json({
        success: true,
        message: 'Expense deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting expense',
        error: error.message
      });
    }
  }
}

module.exports = ExpenseController;
