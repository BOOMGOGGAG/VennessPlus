const db = require('../config/database');

class Expense {
  static async getAll(filters = {}) {
    let query = `
      SELECT 
        e.id,
        e.amount,
        e.description,
        e.expense_date,
        e.created_at,
        e.updated_at,
        c.id as category_id,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE 1=1
    `;
    
    const params = [];

    // Filter by date range
    if (filters.startDate) {
      query += ' AND e.expense_date >= ?';
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      query += ' AND e.expense_date <= ?';
      params.push(filters.endDate);
    }

    // Filter by category
    if (filters.categoryId) {
      query += ' AND e.category_id = ?';
      params.push(filters.categoryId);
    }

    // Sorting
    const validSortFields = ['expense_date', 'amount', 'category_name'];
    const sortBy = validSortFields.includes(filters.sortBy) ? filters.sortBy : 'expense_date';
    const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';
    
    if (sortBy === 'category_name') {
      query += ` ORDER BY c.name ${sortOrder}`;
    } else {
      query += ` ORDER BY e.${sortBy} ${sortOrder}`;
    }

    const [rows] = await db.query(query, params);
    return rows;
  }

  static async getById(id) {
    const query = `
      SELECT 
        e.id,
        e.amount,
        e.description,
        e.expense_date,
        e.created_at,
        e.updated_at,
        c.id as category_id,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.id = ?
    `;
    
    const [rows] = await db.query(query, [id]);
    return rows[0];
  }

  static async create(expenseData) {
    const { amount, category_id, description, expense_date } = expenseData;
    const query = `
      INSERT INTO expenses (amount, category_id, description, expense_date)
      VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await db.query(query, [amount, category_id, description, expense_date]);
    return this.getById(result.insertId);
  }

  static async update(id, expenseData) {
    const { amount, category_id, description, expense_date } = expenseData;
    const query = `
      UPDATE expenses
      SET amount = ?, category_id = ?, description = ?, expense_date = ?
      WHERE id = ?
    `;
    
    await db.query(query, [amount, category_id, description, expense_date, id]);
    return this.getById(id);
  }

  static async delete(id) {
    const query = 'DELETE FROM expenses WHERE id = ?';
    const [result] = await db.query(query, [id]);
    return result.affectedRows > 0;
  }

  static async getSummary(filters = {}) {
    let query = `
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(AVG(amount), 0) as average_amount,
        COALESCE(MAX(amount), 0) as highest_expense
      FROM expenses
      WHERE 1=1
    `;
    
    const params = [];

    if (filters.startDate) {
      query += ' AND expense_date >= ?';
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      query += ' AND expense_date <= ?';
      params.push(filters.endDate);
    }

    const [rows] = await db.query(query, params);
    return rows[0];
  }

  static async getCategoryBreakdown(filters = {}) {
    let query = `
      SELECT 
        c.id,
        c.name,
        c.color,
        c.icon,
        COUNT(e.id) as transaction_count,
        COALESCE(SUM(e.amount), 0) as total_amount,
        ROUND(COALESCE(SUM(e.amount), 0) / (
          SELECT SUM(amount) FROM expenses WHERE 1=1
    `;
    
    const params = [];

    if (filters.startDate) {
      query += ' AND expense_date >= ?';
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      query += ' AND expense_date <= ?';
      params.push(filters.endDate);
    }

    query += `) * 100, 2) as percentage
      FROM categories c
      LEFT JOIN expenses e ON c.id = e.category_id
    `;

    if (filters.startDate || filters.endDate) {
      query += ' WHERE 1=1';
      if (filters.startDate) {
        query += ' AND e.expense_date >= ?';
        params.push(filters.startDate);
      }
      if (filters.endDate) {
        query += ' AND e.expense_date <= ?';
        params.push(filters.endDate);
      }
    }

    query += `
      GROUP BY c.id, c.name, c.color, c.icon
      HAVING total_amount > 0
      ORDER BY total_amount DESC
    `;

    const [rows] = await db.query(query, params);
    return rows;
  }

  static async getMonthlyTrend(months = 6) {
    const query = `
      SELECT 
        DATE_FORMAT(expense_date, '%Y-%m') as month,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount
      FROM expenses
      WHERE expense_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
      GROUP BY DATE_FORMAT(expense_date, '%Y-%m')
      ORDER BY month ASC
    `;

    const [rows] = await db.query(query, [months]);
    return rows;
  }
}

module.exports = Expense;
