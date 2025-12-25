const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const initDatabase = require('./scripts/initDatabase');
const db = require('./config/database')

const expenseRoutes = require('./routes/expenses');
const categoryRoutes = require('./routes/categories');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Expense Tracker API',
    version: '1.0.0',
    endpoints: {
      expenses: '/api/expenses',
      categories: '/api/categories',
      dashboard: '/api/dashboard',
      health: '/api/health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const startServer = async () => {
  try {
    // 1. รอ Init Database ให้เสร็จก่อน
    await initDatabase();

    // 2. พอเสร็จแล้ว ค่อยเริ่มเปิด Server
    app.listen(PORT, async () => {
      console.log(`
    ╔════════════════════════════════════════╗
    ║    Expense Tracker API Server          ║
    ╠════════════════════════════════════════╣
    ║    Port: ${PORT}                          ║
    ║    Environment: ${process.env.NODE_ENV || 'development'}            ║
    ║    Database: ${process.env.DB_NAME}          ║
    ╚════════════════════════════════════════╝
      `);
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}/`);

      // Test Connection Pool อีกทีเพื่อความชัวร์
      try {
        await db.query('SELECT 1');
        console.log('\x1b[32m%s\x1b[0m', '✅ Database connection successful!');
      } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', '❌ Database connection failed!');
        console.error('Error details:', error.message);
      }
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;