import { db } from "../config/Database.js";

class Category {
  constructor(category_id, name) {
    this.category_id = category_id;
    this.name = name;
  }

  // Table Creation Method
  static async initialize() {
    try {
      const sql = `
        CREATE TABLE IF NOT EXISTS categories (
          category_id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL
        );`;

      await db.connection.query(sql);
    } catch (error) {
      console.log(error);
    }
  }

  // Find a category by ID
  static async findById(categoryId) {
    try {
      const [rows] = await db.connection.query(
        "SELECT * FROM categories WHERE category_id = ?",
        [categoryId]
      );
      if (rows.length === 0) {
        return null;
      }
      const category = rows[0];
      return new Category(category.category_id, category.name);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Find all categories
  static async findAll() {
    try {
      const [rows] = await db.connection.query("SELECT * FROM categories");
      return rows.map((row) => new Category(row.category_id, row.name));
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export default Category;
