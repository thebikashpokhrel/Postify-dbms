import express from "express";
import {
  GetPostsController,
  CreatePostController,
  DeletePostController,
  GetPostByIdController,
} from "../controllers/post.controller.js";

const router = express.Router();

router.get("/", GetPostsController);
router.get("/:id", GetPostByIdController);
router.post("/create", CreatePostController);
router.get("/delete/:id", DeletePostController);

export default router;
