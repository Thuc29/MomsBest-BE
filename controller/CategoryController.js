const Category = require("../model/Category");
const User = require("../model/User");
const ForumThread = require("../model/ForumThread");
const { addUserPoints } = require("../helper/pointsHelper");

// Create a new category
exports.createCategory = async (req, res) => {
  console.log("------ Create Category Start ------");
  try {
    console.log("Request User:", req.user);
    if (!req.user || !req.user._id) {
      console.log("Authentication failed: User not found in request.");
      return res.status(401).json({ message: "User authentication required" });
    }
    const { _id } = req.user;
    console.log("Author ID:", _id);
    console.log("Request Body:", req.body);
    const category = new Category({ ...req.body, author_id: _id });
    await category.save();
    console.log("Category saved successfully:", category);
    // Cộng điểm cho user khi tạo category
    await addUserPoints({
      userId: _id,
      actionType: "create_category",
      referenceId: category._id,
      referenceType: "Category",
      description: "Nhận điểm khi tạo chuyên mục mới",
    });
    console.log("Points added for user:", _id);
    res.status(201).json(category);
  } catch (error) {
    console.error("Error in createCategory:", error);
    res.status(400).json({ error: error.message });
  } finally {
    console.log("------ Create Category End ------");
  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, is_active } = req.body;
    const categoryToUpdate = await Category.findById(req.params.id);

    if (!categoryToUpdate) {
      return res.status(404).json({ error: "Category not found" });
    }

    if (categoryToUpdate.author_id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "User not authorized to update this category" });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, is_active },
      { new: true }
    );
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    if (category.author_id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "User not authorized to delete this category" });
    }

    await Category.findByIdAndDelete(req.params.id);
    await ForumThread.deleteMany({ category_id: req.params.id });
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCategoryByAuthor = async (req, res) => {
  try {
    const { _id } = req.user;
    const categories = await Category.find({
      author_id: _id,
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};
