import { db } from "../config/Database.js";

class Post {
  constructor(user_id, category_id, title, content, post_id = null) {
    this.user_id = user_id;
    this.category_id = category_id;
    this.title = title;
    this.content = content;
    this.post_id = post_id;
  }

  // Table Creation Method
  static async initialize() {
    try {
      const sql = `CREATE TABLE IF NOT EXISTS Posts (
        post_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        category_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id),
        FOREIGN KEY (category_id) REFERENCES Categories(category_id)
      );`;

      await db.query(sql);
    } catch (error) {
      console.log(error);
    }
  }

  // Post insertion / Update
  async save() {
    try {
      if (this.post_id) {
        // Update existing record
        const [result] = await db.connection.query(
          "UPDATE Posts SET user_id = ?, category_id = ?, title = ?, content = ? WHERE post_id = ?",
          [
            this.user_id,
            this.category_id,
            this.title,
            this.content,
            this.post_id,
          ]
        );

        return result;
      }

      // Insert new record
      const [result] = await db.connection.query(
        "INSERT INTO Posts (user_id, category_id, title, content) VALUES (?, ?, ?, ?)",
        [this.user_id, this.category_id, this.title, this.content]
      );

      this.post_id = result.insertId;

      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Finding post by id
  static async findById(post_id) {
    try {
      const [rows] = await db.connection.query(
        "SELECT * FROM Posts WHERE post_id = ?",
        [post_id]
      );
      if (rows.length === 0) {
        return null; // No post found with the given post_id
      }
      const post = rows[0];
      return new Post(
        post.user_id,
        post.category_id,
        post.title,
        post.content,
        post.post_id
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Find post by id and update it
  static async findByIdAndUpdate(post_id, updatedData) {
    try {
      const fields = [];
      const values = [];

      // Add fields and values based on provided data
      for (const [key, value] of Object.entries(updatedData)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
      values.push(post_id);

      // dynamic SQL query
      const query = `UPDATE Posts SET ${fields.join(", ")} WHERE post_id = ?`;

      const [result] = await db.connection.query(query, values);

      if (result.affectedRows === 0) {
        return null; // No post found with the given post_id
      }

      return await Post.findById(post_id);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export default Post;
