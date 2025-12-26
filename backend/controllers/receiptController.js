const path = require('path');
const fs = require('fs');

class ReceiptController {
  static async getReceiptImage(req, res) {
    try {
      const { filename } = req.params;

      const filePath = path.join(__dirname, '../uploads/receipts', filename);

      if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
      } else {
        res.status(404).json({
          success: false,
          message: 'Image not found'
        });
      }
    } catch (error) {
      console.error('Error serving receipt image:', error);
      res.status(500).json({
        success: false,
        message: 'Error serving image'
      });
    }
  }

  static async uploadReceipt(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const fileUrl = `/api/receipts/image/${req.file.filename}`;

      res.json({
        success: true,
        data: {
          filename: req.file.filename,
          url: fileUrl,
          path: req.file.path,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });
    } catch (error) {
      console.error('Error uploading receipt:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading receipt',
        error: error.message
      });
    }
  }

  static async deleteReceipt(req, res) {
    try {
      const { filename } = req.params;
      const filePath = path.join(__dirname, '../uploads/receipts', filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({
          success: true,
          message: 'Receipt deleted successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Receipt not found'
        });
      }
    } catch (error) {
      console.error('Error deleting receipt:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting receipt',
        error: error.message
      });
    }
  }
}

module.exports = ReceiptController;