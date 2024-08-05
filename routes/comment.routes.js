import express from "express";
import {
  CreateComment,
  GetCommentsByPostId,
} from "../controllers/comment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/:postId", GetCommentsByPostId);
router.post("/create", authenticate, CreateComment);

export default router;
