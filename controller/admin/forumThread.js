const ForumThread = require("../../model/ForumThread");

// Lấy danh sách chủ đề (phân trang, tìm kiếm, lọc)
exports.getThreads = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      category,
      thread_type,
    } = req.query;
    let query = {};
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (category) {
      query.category_id = category;
    }
    if (thread_type) {
      query.thread_type = thread_type;
    }
    const threads = await ForumThread.find(query)
      .populate("author_id", "name email")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ created_at: -1 });
    const total = await ForumThread.countDocuments(query);
    res.json({ threads, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xem chi tiết chủ đề
exports.getThreadById = async (req, res) => {
  try {
    const thread = await ForumThread.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: "Thread not found" });
    res.json(thread);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa chủ đề
exports.deleteThread = async (req, res) => {
  try {
    const thread = await ForumThread.findByIdAndDelete(req.params.id);
    if (!thread) return res.status(404).json({ message: "Thread not found" });
    res.json({ message: "Thread deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Ghim/bỏ ghim chủ đề
exports.togglePinned = async (req, res) => {
  try {
    const thread = await ForumThread.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: "Thread not found" });
    thread.is_pinned = !thread.is_pinned;
    await thread.save();
    res.json(thread);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
