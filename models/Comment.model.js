import { db } from "../config/Database.js";

class Comment {
  constructor(post_id, user_id, content, created_at = null, comment_id = null) {
    this.post_id = post_id;
    this.user_id = user_id;
    this.content = content;
    this.created_at = created_at;
    this.comment_id = comment_id;
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

  // Finding comment by ID
  static async findById(commentId) {
    try {
      const [rows] = await db.connection.query(
        "SELECT * FROM comments WHERE comment_id = ?",
        [commentId]
      );
      if (rows.length === 0) {
        return null; // No comment found with the given ID
      }
      const comment = rows[0];
      return new Comment(
        comment.user_id,
        comment.post_id,
        comment.content,
        comment.created_at,
        comment.comment_id
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  // Find comments by postId with user info and count of comments
  static async findByPostId(postId) {
    try {
      const query = `
      SELECT c.*, 
             u.firstname, u.lastname, u.username, u.email,
             COUNT(*) OVER() AS total_comments
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC`;

      const [rows] = await db.connection.query(query, [postId]);

      if (rows.length === 0) {
        return { comments: [], totalComments: 0 }; // No comments found for the given postId
      }

      const comments = rows.map((row) => ({
        comment_id: row.comment_id,
        user_id: row.user_id,
        post_id: row.post_id,
        content: row.content,
        created_at: row.created_at,
        user: {
          id: row.user_id,
          firstname: row.firstname,
          lastname: row.lastname,
          username: row.username,
          email: row.email,
        },
      }));

      return {
        comments,
        totalComments: rows[0].total_comments,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Save or update a comment
  async save() {
    try {
      if (this.commentId) {
        // Update existing comment
        await db.connection.query(
          "UPDATE comments SET content = ? WHERE comment_id = ?",
          [this.content, this.commentId]
        );
      } else {
        // Insert new comment
        const [result] = await db.connection.query(
          "INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)",
          [this.user_id, this.post_id, this.content]
        );
        this.comment_id = result.insertId;

        const comment = await Comment.findById(this.comment_id);
        this.created_at = comment.created_at;
      }

      return this;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export default Comment;
