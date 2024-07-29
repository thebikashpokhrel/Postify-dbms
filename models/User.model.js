import { db } from "../config/Database.js";

class User {
  constructor(firstname, lastname, username, email, password, id = null) {
    this.firstname = firstname;
    this.lastname = lastname;
    this.username = username;
    this.email = email;
    this.password = password;
    this.id = id;
  }

  //Table Creation Method
  static async initialize() {
    try {
      const sql = `CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            firstname VARCHAR(50) NOT NULL,
            lastname VARCHAR(50) NOT NULL,
            username VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL
            );`;

      await db.query(sql);
    } catch (error) {
      console.log(error);
    }
  }

  //User insertion / Update
  async save() {
    try {
      //If there is id just update the existing record
      if (this.id) {
        // Update existing record
        const [result] = await db.connection.query(
          "UPDATE users SET firstname = ?, lastname = ?, username = ?, email = ?, password = ? WHERE id = ?",
          [
            this.firstname,
            this.lastname,
            this.username,
            this.email,
            this.password,
            this.id,
          ]
        );

        return result;
      }

      //if there is no id create a new record
      const [result] = await db.connection.query(
        "INSERT INTO users (firstname, lastname, username, email, password) VALUES (?, ?, ?, ?, ?)",
        [
          this.firstname,
          this.lastname,
          this.username,
          this.email,
          this.password,
        ]
      );

      this.id = result.insertId;

      return result;
    } catch (error) {
      console.log(error);
    }
  }

  //Finding user by id

  static async findById(id) {
    try {
      const [rows] = await db.connection.query(
        "SELECT * FROM users WHERE id = ?",
        [id]
      );
      if (rows.length === 0) {
        return null; // No user found with the given id
      }
      const user = rows[0];
      return new User(
        user.firstname,
        user.lastname,
        user.username,
        user.email,
        user.password,
        user.id
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  //Find user by id and update it
  static async findByIdAndUpdate(id, updatedData) {
    try {
      const fields = [];
      const values = [];

      // Add fields and values based on provided data
      for (const [key, value] of Object.entries(updatedData)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
      values.push(id);

      // dynamic SQL query
      const query = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;

      const [result] = await db.connection.query(query, values);

      if (result.affectedRows === 0) {
        return null; // No user found with the given id
      }

      return await User.findById(id);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export default User;
