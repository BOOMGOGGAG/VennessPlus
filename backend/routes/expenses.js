const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const ExpenseController = require('../controllers/expenseController');

// Get all expenses with optional filters
router.get('/', ExpenseController.getAll);

// Get expense by ID
router.get('/:id', ExpenseController.getById);

// Create new expense (with optional receipt upload)
router.post('/', upload.single('receipt'), ExpenseController.create);

// Update expense (with optional receipt upload)
router.put('/:id', upload.single('receipt'), ExpenseController.update);

// Delete expense
router.delete('/:id', ExpenseController.delete);

module.exports = router;