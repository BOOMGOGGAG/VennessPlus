const db = require('../config/database');

class Expense {
  static async getAll(filters = {}) {
    let query = `
      SELECT 
        e.id,
        e.amount,
        e.category_id,
        e.description,
        e.expense_date,
        e.receipt_image,
        e.created_at,
        e.updated_at,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE 1=1
    `;
    
    const params = [];

    if (filters.startDate) {
      query += ` AND e.expense_date >= ?`;
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      query += ` AND e.expense_date <= ?`;
      params.push(filters.endDate);
    }

    if (filters.categoryId) {
      query += ` AND e.category_id = ?`;
      params.push(filters.categoryId);
    }

    const sortBy = filters.sortBy || 'expense_date';
    const sortOrder = filters.sortOrder || 'desc';
    query += ` ORDER BY ${sortBy} ${sortOrder}`;

    const [rows] = await db.query(query, params);
    return rows;
  }

  static async getById(id) {
    const query = `
      SELECT 
        e.id,
        e.amount,
        e.category_id,
        e.description,
        e.expense_date,
        e.receipt_image,
        e.created_at,
        e.updated_at,
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
    const query = `
      INSERT INTO expenses (amount, category_id, description, expense_date, receipt_image)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query(query, [
      expenseData.amount,
      expenseData.category_id,
      expenseData.description || null,
      expenseData.expense_date,
      expenseData.receipt_image || null
    ]);
    
    return result.insertId;
  }

  static async update(id, expenseData) {
    const query = `
      UPDATE expenses
      SET amount = ?,
          category_id = ?,
          description = ?,
          expense_date = ?,
          receipt_image = ?
      WHERE id = ?
    `;
    
    const [result] = await db.query(query, [
      expenseData.amount,
      expenseData.category_id,
      expenseData.description || null,
      expenseData.expense_date,
      expenseData.receipt_image || null,
      id
    ]);
    
    return result.affectedRows;
  }

  static async delete(id) {
    const query = 'DELETE FROM expenses WHERE id = ?';
    const [result] = await db.query(query, [id]);
    return result.affectedRows;
  }

  static async getCategoryComparison(months = 6) {
    const query = `
      SELECT 
        DATE_FORMAT(e.expense_date, '%Y-%m') as month,
        c.id as category_id,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon,
        SUM(e.amount) as total_amount,
        COUNT(e.id) as transaction_count
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.expense_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
      GROUP BY DATE_FORMAT(e.expense_date, '%Y-%m'), c.id, c.name, c.color, c.icon
      ORDER BY month ASC, total_amount DESC
    `;

    const [rows] = await db.query(query, [months]);
    return rows;
  }

  static async getCategoryGrowth() {
    const query = `
      SELECT 
        c.id,
        c.name,
        c.color,
        c.icon,
        COALESCE(SUM(CASE 
          WHEN e.expense_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH) 
          THEN e.amount 
          ELSE 0 
        END), 0) as current_month,
        COALESCE(SUM(CASE 
          WHEN e.expense_date >= DATE_SUB(CURDATE(), INTERVAL 2 MONTH) 
          AND e.expense_date < DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
          THEN e.amount 
          ELSE 0 
        END), 0) as previous_month
      FROM categories c
      LEFT JOIN expenses e ON c.id = e.category_id
      GROUP BY c.id, c.name, c.color, c.icon
      HAVING current_month > 0 OR previous_month > 0
      ORDER BY current_month DESC
    `;

    const [rows] = await db.query(query);
    
    return rows.map(row => ({
      ...row,
      current_month: parseFloat(row.current_month),
      previous_month: parseFloat(row.previous_month),
      growth_amount: parseFloat(row.current_month) - parseFloat(row.previous_month),
      growth_percentage: row.previous_month > 0 
        ? ((parseFloat(row.current_month) - parseFloat(row.previous_month)) / parseFloat(row.previous_month) * 100)
        : (row.current_month > 0 ? 100 : 0)
    }));
  }
}

module.exports = Expense;