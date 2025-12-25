const express = require('express');
const router = express.Router();
const ExpenseController = require('../controllers/expenseController');

// Get all expenses (with optional filters)
router.get('/', ExpenseController.getAllExpenses);

// Get single expense
router.get('/:id', ExpenseController.getExpenseById);

// Create new expense
router.post('/', ExpenseController.createExpense);

// Update expense
router.put('/:id', ExpenseController.updateExpense);

// Delete expense
router.delete('/:id', ExpenseController.deleteExpense);

module.exports = router;
