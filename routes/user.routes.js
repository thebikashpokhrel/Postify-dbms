import express from "express";
import {
  SignInController,
  SignUpController,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/signup", SignUpController);
router.post("/signin", SignInController);

export default router;
