const Product = require("../../model/Product");

// Lấy danh sách sản phẩm (phân trang, tìm kiếm, lọc)
exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      category,
      is_active,
    } = req.query;
    let query = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (category) {
      query.category_ids = { $in: [category] };
    }
    if (is_active !== undefined) {
      query.is_active = is_active === "true";
    }
    const products = await Product.find(query)
      .populate("category_ids")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ created_at: -1 });
    const total = await Product.countDocuments(query);
    res.json({ products, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xem chi tiết sản phẩm
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category_ids"
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Thêm sản phẩm mới
exports.createProduct = async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      category_ids: (req.body.category_ids || []).map((id) =>
        id && id._id ? id._id : id
      ),
    });
    await product.save();
    await product.populate("category_ids");
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      category_ids: (req.body.category_ids || []).map((id) =>
        id && id._id ? id._id : id
      ),
    };
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).populate("category_ids");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Đổi trạng thái hoạt động
exports.toggleActive = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    product.is_active = !product.is_active;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Đổi trạng thái nổi bật
exports.toggleFeatured = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    product.is_featured = !product.is_featured;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
