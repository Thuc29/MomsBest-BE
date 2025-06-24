const Article = require("../../model/article");

// Lấy danh sách bài viết (phân trang, tìm kiếm, lọc)
exports.getArticles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      category,
      is_published,
    } = req.query;
    let query = {};
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (category) {
      query.category_id = category;
    }
    if (is_published !== undefined) {
      query.is_published = is_published === "true";
    }
    const articles = await Article.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ created_at: -1 });
    const total = await Article.countDocuments(query);
    res.json({ articles, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xem chi tiết bài viết
exports.getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Thêm bài viết mới
exports.createArticle = async (req, res) => {
  try {
    const article = new Article(req.body);
    await article.save();
    res.status(201).json(article);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Cập nhật bài viết
exports.updateArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json(article);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Xóa bài viết
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json({ message: "Article deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Đổi trạng thái xuất bản
exports.togglePublished = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    article.is_published = !article.is_published;
    await article.save();
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
