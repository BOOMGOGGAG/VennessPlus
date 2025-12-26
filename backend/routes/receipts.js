const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const ReceiptController = require('../controllers/receiptController');

// GET Receipt
router.get('/image/:filename', ReceiptController.getReceiptImage);

// Upload receipt
router.post('/upload', upload.single('receipt'), ReceiptController.uploadReceipt);

// Delete receipt
router.delete('/:filename', ReceiptController.deleteReceipt);

module.exports = router;