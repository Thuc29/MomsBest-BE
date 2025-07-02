const CategoryProduct = require("../../model/CategoryProduct");

// Lấy tất cả categoryProducts
exports.getAll = async (req, res) => {
  try {
    const categories = await CategoryProduct.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy categoryProduct theo id
exports.getById = async (req, res) => {
  try {
    const category = await CategoryProduct.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Not found" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tạo mới categoryProduct
exports.create = async (req, res) => {
  try {
    const category = new CategoryProduct(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Cập nhật categoryProduct
exports.update = async (req, res) => {
  try {
    const category = await CategoryProduct.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!category) return res.status(404).json({ message: "Not found" });
    res.json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Xóa categoryProduct
exports.delete = async (req, res) => {
  try {
    const category = await CategoryProduct.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
