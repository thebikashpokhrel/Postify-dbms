import { db } from "../config/Database.js";

class Post {
  constructor(
    user_id,
    category_id,
    title,
    content,
    post_id = null,
    created_at = null
  ) {
    this.user_id = user_id;
    this.category_id = category_id;
    this.title = title;
    this.content = content;
    this.post_id = post_id;
    this.created_at = created_at;
  }

  // Table Creation Method
  static async initialize() {
    try {
      const sql = `CREATE TABLE IF NOT EXISTS Posts (
              post_id INT AUTO_INCREMENT PRIMARY KEY,
              user_id CHAR(36) NOT NULL,
              category_id INT NOT NULL,
              title VARCHAR(255) NOT NULL,
              content TEXT NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id),
              FOREIGN KEY (category_id) REFERENCES Categories(category_id)
              );`;

      await db.query(sql);
    } catch (error) {
      console.log(error);
    }
  }

  // Insert or Update Post
  async save() {
    try {
      // If there is a post_id, update the existing record
      if (this.post_id) {
        // Update existing record
        await db.connection.query(
          "UPDATE Posts SET user_id = ?, category_id = ?, title = ?, content = ? WHERE post_id = ?",
          [
            this.user_id,
            this.category_id,
            this.title,
            this.content,
            this.post_id,
          ]
        );
      } else {
        // If there is no post_id, create a new record
        const [result] = await db.connection.query(
          "INSERT INTO Posts (user_id, category_id, title, content) VALUES (?, ?, ?, ?)",
          [this.user_id, this.category_id, this.title, this.content]
        );

        this.post_id = result.insertId;
      }

      // Retrieve the post to get the created_at timestamp
      if (this.post_id) {
        const post = await Post.findById(this.post_id);
        this.created_at = post.created_at;
      }

      return this;
    } catch (error) {
      console.log(error);
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
        return null; // No post found with the given id
      }
      const post = rows[0];
      return new Post(
        post.user_id,
        post.category_id,
        post.title,
        post.content,
        post.post_id,
        post.created_at
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Finding posts with conditions
  static async findWhere(conditions) {
    try {
      const fields = [];
      const values = [];

      // Add fields and values based on provided conditions
      for (const [key, value] of Object.entries(conditions)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }

      // Dynamic SQL query
      const query = `SELECT * FROM Posts WHERE ${fields.join(" AND ")}`;

      const [rows] = await db.connection.query(query, values);

      return rows.map(
        (row) =>
          new Post(
            row.user_id,
            row.category_id,
            row.title,
            row.content,
            row.post_id,
            row.created_at
          )
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async findOne(conditions) {
    const result = await Post.findWhere(conditions);
    return result[0];
  }

  // Find all posts
  static async find() {
    try {
      const [rows] = await db.connection.query("SELECT * FROM Posts");
      return rows.map(
        (row) =>
          new Post(
            row.user_id,
            row.category_id,
            row.title,
            row.content,
            row.post_id,
            row.created_at
          )
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Find posts with user details by joining tables
  static async findWithUser() {
    try {
      const [rows] = await db.connection.query(`
      SELECT Posts.*, Users.firstname, Users.lastname, Users.username, Users.email
      FROM Posts
      JOIN Users ON Posts.user_id = Users.id
    `);
      return rows.map((row) => ({
        post: new Post(
          row.user_id,
          row.category_id,
          row.title,
          row.content,
          row.post_id,
          row.created_at
        ),
        user: {
          firstname: row.firstname,
          lastname: row.lastname,
          email: row.email,
        },
      }));
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Count the number of posts
  static async count() {
    try {
      const [rows] = await db.connection.query(
        "SELECT COUNT(*) AS count FROM posts"
      );
      return rows[0].count;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Delete post by ID
  static async deleteById(post_id) {
    try {
      const [result] = await db.connection.query(
        "DELETE FROM posts WHERE post_id = ?",
        [post_id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export default Post;
