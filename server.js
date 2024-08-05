import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { db } from "./config/Database.js";
import User from "./models/user.model.js";
import Post from "./models/Post.model.js";
import Category from "./models/Category.model.js";
import Comment from "./models/Comment.model.js";
import PostCategory from "./models/PostCategory.model.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import { authenticate } from "./middlewares/auth.middleware.js";

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

app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/comment", commentRoutes);

app.listen(PORT, () => {
  (async () => {
    await db.connect();
    await User.initialize();
    await Category.initialize();
    await Post.initialize();
    await Comment.initialize();
    await PostCategory.initialize();
  })();

  console.log(`Server Started at ${PORT}`);
});
