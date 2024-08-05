import Category from "../models/Category.model.js";

export const GetCategoriesController = async function (req, res) {
  try {
    const categories = await Category.findAll();
    return res.status(200).json({
      categories,
      message: "Categories fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const GetCategoryByIdController = async function (req, res) {
  try {
    const category = await Category.findByIdWithPosts(req.params.id);
    return res.status(200).json({
      category,
      message: "Categories fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
