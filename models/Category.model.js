import { db } from "../config/Database.js";

class Category {
  constructor(category_id, name) {
    this.category_id = category_id;
    this.name = name;
  }

  // Table creation method
  static async initialize() {
    try {
      const sql = `CREATE TABLE IF NOT EXISTS categories (
        category_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );`;

      await db.query(sql);
    } catch (error) {
      console.log(error);
    }
  }

  // Save category
  async save() {
    try {
      const [result] = await db.connection.query(
        "INSERT INTO categories (name) VALUES (?)",
        [this.name]
      );

      this.category_id = result.insertId;
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Find all categories
  static async find() {
    try {
      const [rows] = await db.connection.query("SELECT * FROM categories");
      return rows.map((row) => new Category(row.category_id, row.name));
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Find category by ID
  static async findById(category_id) {
    try {
      const [rows] = await db.connection.query(
        "SELECT * FROM categories WHERE category_id = ?",
        [category_id]
      );
      if (rows.length === 0) {
        return null; // No category found with the given id
      }
      const category = rows[0];
      return new Category(category.category_id, category.name);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Count the number of posts in a category
  static async countPosts(category_id) {
    try {
      const [rows] = await db.connection.query(
        "SELECT COUNT(*) AS postCount FROM posts WHERE category_id = ?",
        [category_id]
      );
      return rows[0].postCount;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export default Category;
