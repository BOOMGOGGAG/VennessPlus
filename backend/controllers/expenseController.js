const Expense = require('../models/Expense');
const path = require('path');
const fs = require('fs');

class ExpenseController {
  static async getAll(req, res) {
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
        data: expenses
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

  static async getById(req, res) {
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

  static async create(req, res) {
    try {
      const expenseData = {
        amount: req.body.amount,
        category_id: req.body.category_id,
        description: req.body.description,
        expense_date: req.body.expense_date,
        receipt_image: req.file ? `/uploads/receipts/${req.file.filename}` : null
      };

      const expenseId = await Expense.create(expenseData);
      const expense = await Expense.getById(expenseId);

      res.status(201).json({
        success: true,
        data: expense
      });
    } catch (error) {
      console.error('Error creating expense:', error);
      
      // Delete uploaded file if expense creation fails
      if (req.file) {
        const filePath = path.join(__dirname, '../uploads/receipts', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      res.status(500).json({
        success: false,
        message: 'Error creating expense',
        error: error.message
      });
    }
  }

  static async update(req, res) {
    try {
      const expenseId = req.params.id;
      const oldExpense = await Expense.getById(expenseId);

      if (!oldExpense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
      }

      const expenseData = {
        amount: req.body.amount,
        category_id: req.body.category_id,
        description: req.body.description,
        expense_date: req.body.expense_date,
        receipt_image: req.file 
          ? `/uploads/receipts/${req.file.filename}` 
          : (req.body.keep_receipt === 'true' ? oldExpense.receipt_image : null)
      };

      // Delete old receipt if new one is uploaded
      if (req.file && oldExpense.receipt_image) {
        const oldFilePath = path.join(__dirname, '..', oldExpense.receipt_image);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      await Expense.update(expenseId, expenseData);
      const expense = await Expense.getById(expenseId);

      res.json({
        success: true,
        data: expense
      });
    } catch (error) {
      console.error('Error updating expense:', error);

      // Delete uploaded file if update fails
      if (req.file) {
        const filePath = path.join(__dirname, '../uploads/receipts', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      res.status(500).json({
        success: false,
        message: 'Error updating expense',
        error: error.message
      });
    }
  }

  static async delete(req, res) {
    try {
      const expense = await Expense.getById(req.params.id);

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
      }

      // Delete receipt image if exists
      if (expense.receipt_image) {
        const filePath = path.join(__dirname, '..', expense.receipt_image);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      await Expense.delete(req.params.id);

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