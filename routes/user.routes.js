import express from "express";
import { SignUpController } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/signup", SignUpController);

export default router;
