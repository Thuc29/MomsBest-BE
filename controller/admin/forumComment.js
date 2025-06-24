const ForumComment = require("../../model/ForumComment");

// Lấy danh sách bình luận (phân trang, tìm kiếm, lọc theo thread)
exports.getComments = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "", thread_id } = req.query;
    let query = {};
    if (search) {
      query.content = { $regex: search, $options: "i" };
    }
    if (thread_id) {
      query.thread_id = thread_id;
    }
    const comments = await ForumComment.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ created_at: -1 });
    const total = await ForumComment.countDocuments(query);
    res.json({ comments, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa bình luận
exports.deleteComment = async (req, res) => {
  try {
    const comment = await ForumComment.findByIdAndDelete(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
