const db = require('../config/database');

class Category {
  static async getAll() {
    const query = 'SELECT * FROM categories ORDER BY name ASC';
    const [rows] = await db.query(query);
    return rows;
  }

  static async getById(id) {
    const query = 'SELECT * FROM categories WHERE id = ?';
    const [rows] = await db.query(query, [id]);
    return rows[0];
  }

  static async create(categoryData) {
    const { name, color, icon } = categoryData;
    const query = 'INSERT INTO categories (name, color, icon) VALUES (?, ?, ?)';
    const [result] = await db.query(query, [name, color || '#3B82F6', icon || '💰']);
    return this.getById(result.insertId);
  }

  static async update(id, categoryData) {
    const { name, color, icon } = categoryData;
    const query = 'UPDATE categories SET name = ?, color = ?, icon = ? WHERE id = ?';
    await db.query(query, [name, color, icon, id]);
    return this.getById(id);
  }

  static async delete(id) {
    const query = 'DELETE FROM categories WHERE id = ?';
    const [result] = await db.query(query, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Category;
