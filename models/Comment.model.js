import { db } from "../config/Database.js";

class Comment {
  constructor(comment_id, post_id, user_id, content, created_at) {
    this.comment_id = comment_id;
    this.post_id = post_id;
    this.user_id = user_id;
    this.content = content;
    this.created_at = created_at;
  }

  // Table creation method
  static async initialize() {
    try {
      const sql = `CREATE TABLE IF NOT EXISTS comments (
        comment_id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        user_id CHAR(36) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES Posts(post_id),
        FOREIGN KEY (user_id) REFERENCES Users(id)
      );`;

      await db.query(sql);
    } catch (error) {
      console.log(error);
    }
  }

  // Save comment
  async save() {
    try {
      const [result] = await db.connection.query(
        "INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)",
        [this.post_id, this.user_id, this.content]
      );

      this.comment_id = result.insertId;
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Find all comments
  static async find() {
    try {
      const [rows] = await db.connection.query("SELECT * FROM comments");
      return rows.map(
        (row) =>
          new Comment(
            row.comment_id,
            row.post_id,
            row.user_id,
            row.content,
            row.created_at
          )
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Find comments with user and post details by joining tables
  static async findWithUserAndPost() {
    try {
      const [rows] = await db.connection.query(`
        SELECT Comments.*, Users.firstname, Users.lastname, Posts.title
        FROM Comments
        JOIN Users ON Comments.user_id = Users.id
        JOIN Posts ON Comments.post_id = Posts.post_id
      `);
      return rows.map((row) => ({
        comment: new Comment(
          row.comment_id,
          row.post_id,
          row.user_id,
          row.content,
          row.created_at
        ),
        user: {
          firstname: row.firstname,
          lastname: row.lastname,
        },
        post: {
          title: row.title,
        },
      }));
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export default Comment;
