import express from "express";
import {
  GetCategoriesController,
  GetCategoryByIdController,
} from "../controllers/category.controller.js";

const router = express.Router();

router.get("/", GetCategoriesController);
router.get("/:id", GetCategoryByIdController);

export default router;
