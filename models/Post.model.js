import { db } from "../config/Database.js";

class Post {
  constructor(user_id, title, content, post_id = null, created_at = null) {
    this.user_id = user_id;
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
          "UPDATE Posts SET user_id = ?, title = ?, content = ? WHERE post_id = ?",
          [this.user_id, this.title, this.content, this.post_id]
        );
      } else {
        // If there is no post_id, create a new record
        const [result] = await db.connection.query(
          "INSERT INTO Posts (user_id,title, content) VALUES (?, ?, ?)",
          [this.user_id, this.title, this.content]
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

  // Find post by id with details
  static async findByIdWithDetails(postId) {
    try {
      const query = `
    SELECT p.*, 
           u.firstname, u.lastname, u.username, u.email, 
           c.comment_id, c.user_id AS comment_user_id, c.content AS comment_content, c.created_at AS comment_created_at,
           pc.category_id, cat.name AS category_name,
           (SELECT COUNT(*) FROM comments WHERE comments.post_id = p.post_id) AS comment_count
    FROM posts p 
    JOIN users u ON p.user_id = u.id 
    LEFT JOIN comments c ON p.post_id = c.post_id
    LEFT JOIN post_categories pc ON p.post_id = pc.post_id
    LEFT JOIN categories cat ON pc.category_id = cat.category_id
    WHERE p.post_id = ?`;

      const [rows] = await db.connection.query(query, [postId]);

      if (rows.length === 0) {
        return null; // No post found with the given id
      }

      const post = {
        post_id: rows[0].post_id,
        user_id: rows[0].user_id,
        title: rows[0].title,
        content: rows[0].content,
        created_at: rows[0].created_at,
        comment_count: rows[0].comment_count,
        user: {
          id: rows[0].user_id,
          firstname: rows[0].firstname,
          lastname: rows[0].lastname,
          username: rows[0].username,
          email: rows[0].email,
        },
        comments: [],
        categories: [],
      };

      rows.forEach((row) => {
        if (row.comment_id) {
          post.comments.push({
            comment_id: row.comment_id,
            user_id: row.comment_user_id,
            content: row.comment_content,
            created_at: row.comment_created_at,
          });
        }

        if (
          row.category_id &&
          !post.categories.some((cat) => cat.category_id === row.category_id)
        ) {
          post.categories.push({
            category_id: row.category_id,
            name: row.category_name,
          });
        }
      });

      return post;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  //Find the posts with given user id
  static async findWithUserId(user_id) {
    try {
      const query = `
        SELECT 
          p.*, 
          u.firstname, u.lastname, u.username, u.email,
          c.comment_id, c.user_id AS comment_user_id, c.content AS comment_content, c.created_at AS comment_created_at,
          (SELECT COUNT(*) FROM comments WHERE comments.post_id = p.post_id) AS comment_count
        FROM posts p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN comments c ON p.post_id = c.post_id
        WHERE u.id = ?`;

      const [rows] = await db.connection.query(query, [user_id]);

      const posts = {};

      rows.forEach((row) => {
        if (!posts[row.post_id]) {
          posts[row.post_id] = {
            post: new Post(
              row.user_id,
              row.title,
              row.content,
              row.post_id,
              row.created_at
            ),
            comment_count: row.comment_count,
            user: {
              firstname: row.firstname,
              lastname: row.lastname,
              username: row.username,
              email: row.email,
            },
            comments: [],
          };
        }

        if (row.comment_id) {
          posts[row.post_id].comments.push({
            comment_id: row.comment_id,
            user_id: row.comment_user_id,
            content: row.comment_content,
            created_at: row.comment_created_at,
          });
        }
      });

      return Object.values(posts);
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

  //Find one method
  static async findOne(conditions) {
    const result = await Post.findWhere(conditions);
    return result[0];
  }

  // Find all posts
  static async findAll() {
    try {
      const [rows] = await db.connection.query("SELECT * FROM Posts");
      return rows.map(
        (row) =>
          new Post(
            row.user_id,
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

  // Find all posts with user details by joining tables
  static async findAllWithDetails() {
    try {
      const [rows] = await db.connection.query(`
        SELECT 
          p.*, 
          u.firstname, u.lastname, u.username, u.email,
          (SELECT COUNT(*) FROM comments WHERE comments.post_id = p.post_id) AS comment_count,
          pc.category_id, cat.name AS category_name
        FROM posts p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN post_categories pc ON p.post_id = pc.post_id
        LEFT JOIN categories cat ON pc.category_id = cat.category_id
      `);

      const posts = {};

      rows.forEach((row) => {
        if (!posts[row.post_id]) {
          posts[row.post_id] = {
            post: new Post(
              row.user_id,
              row.title,
              row.content,
              row.post_id,
              row.created_at
            ),
            user: {
              firstname: row.firstname,
              lastname: row.lastname,
              username: row.username,
              email: row.email,
            },
            comment_count: row.comment_count,
            categories: [],
          };
        }

        if (row.category_id) {
          posts[row.post_id].categories.push({
            category_id: row.category_id,
            name: row.category_name,
          });
        }
      });

      return Object.values(posts);
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

  // Add categories to a post
  async addCategories(categoryIds) {
    try {
      // Insert categories into the post_categories table
      const query = `
          INSERT INTO post_categories (post_id, category_id)
          VALUES ${categoryIds.map(() => "(?, ?)").join(", ")}
        `;

      const values = categoryIds.flatMap((categoryId) => [
        this.post_id,
        categoryId,
      ]);

      const [result] = await db.connection.query(query, values);
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Update categories for a post
  async updateCategories(categoryIds) {
    try {
      // First delete existing categories for the post
      await db.connection.query(
        "DELETE FROM post_categories WHERE post_id = ?",
        [this.post_id]
      );

      // Insert new categories
      await this.addCategories(categoryIds);

      return { message: "Categories updated successfully" };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export default Post;
