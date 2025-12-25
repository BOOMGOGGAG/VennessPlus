const Category = require('../models/Category');

class CategoryController {
  static async getAllCategories(req, res) {
    try {
      const categories = await Category.getAll();
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching categories',
        error: error.message
      });
    }
  }

  static async getCategoryById(req, res) {
    try {
      const category = await Category.getById(req.params.id);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching category',
        error: error.message
      });
    }
  }

  static async createCategory(req, res) {
    try {
      const { name, color, icon } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Category name is required'
        });
      }

      const category = await Category.create({ name, color, icon });

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
      });
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating category',
        error: error.message
      });
    }
  }

  static async updateCategory(req, res) {
    try {
      const { name, color, icon } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Category name is required'
        });
      }

      const category = await Category.update(req.params.id, { name, color, icon });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: category
      });
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating category',
        error: error.message
      });
    }
  }

  static async deleteCategory(req, res) {
    try {
      const deleted = await Category.delete(req.params.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting category (may be in use by expenses)',
        error: error.message
      });
    }
  }
}

module.exports = CategoryController;
