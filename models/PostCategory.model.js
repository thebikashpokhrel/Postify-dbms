import { db } from "../config/Database.js";

class PostCategory {
  constructor(postId, categoryId) {
    this.postId = postId;
    this.categoryId = categoryId;
  }

  // Initialize the table
  static async initialize() {
    try {
      const sql = `CREATE TABLE IF NOT EXISTS post_categories (
              post_id INT,
              category_id INT,
              PRIMARY KEY (post_id, category_id),
              FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
              FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
              );`;

      await db.query(sql);
    } catch (error) {
      console.log(error);
    }
  }
}

export default PostCategory;
