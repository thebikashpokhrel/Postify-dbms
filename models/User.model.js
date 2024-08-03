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
              id CHAR(36) PRIMARY KEY,
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
        await db.connection.query(
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
      }

      //if there is no id create a new record
      await db.connection.query(
        "INSERT INTO users (firstname, lastname, username, email, password) VALUES (?, ?, ?, ?, ?)",
        [
          this.firstname,
          this.lastname,
          this.username,
          this.email,
          this.password,
        ]
      );

      const user = await User.findByEmailAndPassword(this.email, this.password);

      this.id = user.id;
      this.password = user.password;
      return this;
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

  //Findwhere method
  static async findWhere(conditions) {
    try {
      const fields = [];
      const values = [];

      // Add fields and values based on provided conditions
      for (const [key, value] of Object.entries(conditions)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }

      // dynamic SQL query
      const query = `SELECT * FROM users WHERE ${fields.join(" AND ")}`;

      const [rows] = await db.connection.query(query, values);

      return rows.map(
        (row) =>
          new User(
            row.firstname,
            row.lastname,
            row.username,
            row.email,
            row.password,
            row.id
          )
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async findOne(conditions) {
    const result = await User.findWhere(conditions);
    return result[0];
  }

  static async findByEmailAndPassword(email, password) {
    try {
      const [rows] = await db.connection.query(
        "CALL SelectUserWithHashedPassword(?, ?)",
        [email, password]
      );

      if (rows.length === 0 || rows[0].length === 0) {
        return null; // No user found with the given email and password
      }

      const user = rows[0][0]; // Accessing the first result set and the first row
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
}

export default User;
