import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { db } from "./config/Database.js";
import User from "./models/User.model.js";
import Post from "./models/Post.model.js";

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 5000;
const allowedOrigins = ["https://localhost:5173"];
app.use(
  cors({
    origin: allowedOrigins,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/", async (req, res) => {
  res.send("API Root");
});

app.listen(PORT, () => {
  (async () => {
    await db.connect();
    await User.initialize();

    const user = await User.findByIdAndUpdate(14, {
      firstname: "Bkkkk",
    });

    console.log(user);
  })();

  console.log(`Server Started at ${PORT}`);
});
