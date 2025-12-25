const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
  let connection;
  
  try {
    // Connect to MySQL server
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT
    });

    console.log('Connected to MySQL server');

    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`Database '${process.env.DB_NAME}' created or already exists`);

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Create categories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        color VARCHAR(7) DEFAULT '#3B82F6',
        icon VARCHAR(50) DEFAULT '💰',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Categories table created');

    // Create expenses table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        amount DECIMAL(10, 2) NOT NULL,
        category_id INT NOT NULL,
        description TEXT,
        expense_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
      )
    `);
    console.log('Expenses table created');

    // Insert default categories
    const defaultCategories = [
      ['Food & Dining', '#EF4444', '🍔'],
      ['Transportation', '#3B82F6', '🚗'],
      ['Shopping', '#8B5CF6', '🛍️'],
      ['Entertainment', '#EC4899', '🎬'],
      ['Bills & Utilities', '#F59E0B', '💡'],
      ['Healthcare', '#10B981', '⚕️'],
      ['Education', '#06B6D4', '📚'],
      ['Other', '#6B7280', '📌']
    ];

    for (const [name, color, icon] of defaultCategories) {
      await connection.query(
        'INSERT IGNORE INTO categories (name, color, icon) VALUES (?, ?, ?)',
        [name, color, icon]
      );
    }
    console.log('Default categories inserted');

    // Insert sample expenses
    const sampleExpenses = [
      [45.50, 1, 'Lunch at restaurant', '2024-12-20'],
      [80.00, 2, 'Uber rides', '2024-12-21'],
      [120.00, 3, 'New shoes', '2024-12-22'],
      [25.00, 4, 'Movie tickets', '2024-12-23'],
      [150.00, 5, 'Electricity bill', '2024-12-24'],
      [60.00, 1, 'Grocery shopping', '2024-12-25'],
      [30.00, 6, 'Medicine', '2024-12-19'],
      [200.00, 7, 'Online course', '2024-12-18']
    ];

    for (const [amount, category_id, description, expense_date] of sampleExpenses) {
      await connection.query(
        'INSERT INTO expenses (amount, category_id, description, expense_date) VALUES (?, ?, ?, ?)',
        [amount, category_id, description, expense_date]
      );
    }
    console.log('Sample expenses inserted');

    console.log('\n✅ Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
