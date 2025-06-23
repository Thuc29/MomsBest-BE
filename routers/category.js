const express = require("express");
const router = express.Router();
const CategoryController = require("../controller/CategoryController");
const authMiddleware = require("../middleware/authMiddleware");

// Create category
router.post("/", authMiddleware, CategoryController.createCategory);
// Get all categories
router.get("/", CategoryController.getCategories);
// Get category by id
router.get("/getDetailCategory/:id", CategoryController.getCategoryById);
// Update category
router.put("/:id", authMiddleware, CategoryController.updateCategory);
// Delete category
router.delete("/:id", authMiddleware, CategoryController.deleteCategory);

router.get(
  "/getCategoryByAuthor",
  authMiddleware,
  CategoryController.getCategoryByAuthor
);

module.exports = router;
