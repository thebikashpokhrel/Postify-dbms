import express from "express";
import {
  GetPostsController,
  CreatePostController,
  DeletePostController,
  GetPostByIdController,
  GetPostsByUserIdController,
} from "../controllers/post.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", GetPostsController);
router.get("/:id", GetPostByIdController);
router.post("/create", authenticate, CreatePostController);
router.get("/delete/:id", authenticate, DeletePostController);
router.post("/update", authenticate, CreatePostController);
router.get("/user/:id", GetPostsByUserIdController);

export default router;
