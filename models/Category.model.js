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

  // Find a category by ID along with its posts
  static async findByIdWithPosts(categoryId) {
    try {
      const query = `
      SELECT 
        c.category_id, c.name, 
        p.post_id, p.user_id, p.title, p.content, p.created_at,
        u.firstname, u.lastname, u.username, u.email,
        (SELECT COUNT(*) FROM comments WHERE comments.post_id = p.post_id) AS comment_count
      FROM categories c
      LEFT JOIN post_categories pc ON c.category_id = pc.category_id
      LEFT JOIN posts p ON pc.post_id = p.post_id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE c.category_id = ?
    `;
      const [rows] = await db.connection.query(query, [categoryId]);

      if (rows.length === 0) {
        return null;
      }

      const category = {
        category_id: rows[0].category_id,
        name: rows[0].name,
        posts: [],
      };

      rows.forEach((row) => {
        if (row.post_id) {
          category.posts.push({
            post_id: row.post_id,
            user_id: row.user_id,
            title: row.title,
            content: row.content,
            created_at: row.created_at,
            user: {
              id: row.user_id,
              firstname: row.firstname,
              lastname: row.lastname,
              username: row.username,
              email: row.email,
            },
            comment_count: row.comment_count,
          });
        }
      });

      return category;
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
