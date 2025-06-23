const ForumThread = require("../model/ForumThread");
const mongoose = require("mongoose");
const ThreadFollow = require("../model/ThreadFollower");
const ThreadLike = require("../model/ThreadLike");
const ForumComment = require("../model/ForumComment");
const { addUserPoints } = require("../helper/pointsHelper");

// Create a new forum thread
exports.createForumThread = async (req, res) => {
  try {
    const { title, content, category_id, author_id, thread_type, is_pinned } =
      req.body;
    const newThread = await ForumThread.create({
      title,
      content,
      category_id,
      author_id,
      thread_type,
      is_pinned,
    });
    // Cộng điểm cho user khi tạo thread
    await addUserPoints({
      userId: author_id,
      actionType: "post_thread",
      referenceId: newThread._id,
      referenceType: "ForumThread",
      description: "Nhận điểm khi đăng bài viết mới",
    });

    const thread = await ForumThread.findById(newThread._id)
      .populate("category_id")
      .populate("author_id")
      .populate("commentsCount");
    res.status(201).json(thread);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all forum threads
exports.getForumThreads = async (req, res) => {
  try {
    let threads = await ForumThread.find()
      .populate("category_id")
      .populate("author_id")
      .populate("commentsCount");
    // Tìm thread nhiều comment nhất hoặc nhiều tương tác nhất
    // (Ở đây giả sử có trường comments là số lượng comment, nếu không có thì chỉ dùng likes + views)
    let maxScore = -1;
    let pinIndex = -1;
    threads.forEach((thread, idx) => {
      const score =
        (thread.commentsCount || 0) + (thread.likes || 0) + (thread.views || 0);
      if (score > maxScore) {
        maxScore = score;
        pinIndex = idx;
      }
    });
    threads = threads.map((thread, idx) => {
      if (idx === pinIndex && maxScore > 0) {
        thread.is_pinned = true;
      } else {
        thread.is_pinned = false;
      }
      return thread;
    });
    res.json(threads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get forum thread by ID
exports.getForumThreadById = async (req, res) => {
  try {
    const thread = await ForumThread.findById(req.params.id)
      .populate("category_id")
      .populate("author_id");
    if (!thread)
      return res.status(404).json({ error: "ForumThread not found" });
    res.json(thread);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update forum thread
exports.updateForumThread = async (req, res) => {
  try {
    const { title, content, category_id, author_id, thread_type, is_pinned } =
      req.body;
    const thread = await ForumThread.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        category_id,
        author_id,
        thread_type,
        is_pinned,
        updated_at: Date.now(),
      },
      { new: true }
    );
    if (!thread)
      return res.status(404).json({ error: "ForumThread not found" });
    res.json(thread);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete forum thread
exports.deleteForumThread = async (req, res) => {
  try {
    const thread = await ForumThread.findByIdAndDelete(req.params.id);
    if (!thread)
      return res.status(404).json({ error: "ForumThread not found" });
    res.json({ message: "ForumThread deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Like thread
exports.likeThread = async (req, res) => {
  try {
    const thread_id = req.params.id;
    const user_id = req.user._id;
    const { like } = req.body;
    if (like) {
      await ThreadLike.updateOne(
        { thread_id, user_id, type: "like" },
        { $set: { thread_id, user_id, type: "like" } },
        { upsert: true }
      );
    } else {
      await ThreadLike.deleteOne({ thread_id, user_id, type: "like" });
    }
    // Đếm lại số like
    const likes = await ThreadLike.countDocuments({ thread_id, type: "like" });
    await ForumThread.findByIdAndUpdate(thread_id, { likes });
    res.json({ likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lưu thread
exports.saveThread = async (req, res) => {
  try {
    const thread_id = req.params.id;
    const user_id = req.user._id;
    const { save } = req.body;
    if (save) {
      const result = await ThreadLike.updateOne(
        { thread_id, user_id, type: "save" },
        { $set: { thread_id, user_id, type: "save" } },
        { upsert: true }
      );
    } else {
      const result = await ThreadLike.deleteOne({
        thread_id,
        user_id,
        type: "save",
      });
    }
    const saves = await ThreadLike.countDocuments({ thread_id, type: "save" });
    console.log("ThreadLike countDocuments:", saves);
    res.json({ isSaved: !!save, saves });
  } catch (err) {
    console.error("Error in saveThread:", err);
    res.status(500).json({ error: err.message });
  }
};

// Theo dõi thread
exports.followThread = async (req, res) => {
  try {
    const thread_id = req.params.id;
    const user_id = req.user._id;
    const { follow } = req.body;
    if (follow) {
      // Follow thread
      await ThreadFollow.updateOne(
        { thread_id, user_id },
        { $set: { thread_id, user_id } },
        { upsert: true }
      );
    } else {
      // Unfollow thread
      await ThreadFollow.deleteOne({ thread_id, user_id });
    }
    // Kiểm tra lại trạng thái
    const isFollowing = !!(await ThreadFollow.findOne({ thread_id, user_id }));
    res.json({ isFollowing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Báo cáo thread
exports.reportThread = async (req, res) => {
  try {
    // ... logic báo cáo thread
    res.json({ message: "Đã báo cáo" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Kiểm tra user đã like thread chưa
exports.isLiked = async (req, res) => {
  try {
    const thread_id = req.params.id;
    const user_id = req.user?._id;

    console.log("user:", user_id);

    console.log("isLiked called:", {
      thread_id,
      user_id,
      token: req.headers.authorization,
    });
    const liked = await ThreadLike.findOne({
      thread_id,
      user_id,
      type: "like",
    });
    console.log("isLiked result:", liked);
    res.json({ isLiked: !!liked });
  } catch (err) {
    console.error("Error in isLiked:", err);
    res.status(500).json({ error: err.message });
  }
};

// Kiểm tra user đã save thread chưa
exports.isSaved = async (req, res) => {
  try {
    const thread_id = req.params.id;
    const user_id = req.user?._id;
    console.log("isSaved called:", {
      thread_id,
      user_id,
      token: req.headers.authorization,
    });
    const saved = await ThreadLike.findOne({
      thread_id,
      user_id,
      type: "save",
    });
    console.log("isSaved result:", saved);
    res.json({ isSaved: !!saved });
  } catch (err) {
    console.error("Error in isSaved:", err);
    res.status(500).json({ error: err.message });
  }
};
exports.isFollowed = async (req, res) => {
  try {
    const thread_id = req.params.id;
    const user_id = req.user?._id;
    console.log("isFollowed called:", {
      thread_id,
      user_id,
      token: req.headers.authorization,
    });
    const followed = await ThreadFollow.findOne({ thread_id, user_id });
    console.log("isFollowed result:", followed);
    res.json({ isFollowing: !!followed });
  } catch (err) {
    console.error("Error in isFollowed:", err);
    res.status(500).json({ error: err.message });
  }
};

// Lấy thread theo category id
exports.getForumThreadsByCategoryId = async (req, res) => {
  try {
    const category_id = req.params.id;
    const threads = await ForumThread.find({ category_id })
      .populate("author_id")
      .populate("category_id");
    // Thêm số lượng comment và like cho từng thread
    const threadsWithCounts = await Promise.all(
      threads.map(async (thread) => {
        const commentsCount = await ForumComment.countDocuments({
          thread_id: thread._id,
        });
        return {
          ...thread.toObject(),
          commentsCount,
          likes: thread.likes || 0,
        };
      })
    );
    res.json(threadsWithCounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getForumThreadByAuthor = async (req, res) => {
  try {
    const { _id } = req.user;
    const threads = await ForumThread.find({
      author_id: _id,
    });
    res.json(threads);
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
};

exports.createThread = async (req, res) => {
  try {
    const { _id } = req.user;
    const newThread = new ForumThread({ ...req.body, author_id: _id });
    await newThread.save();
    // Cộng điểm cho user khi tạo thread
    await addUserPoints({
      userId: _id,
      actionType: "post_thread",
      referenceId: newThread._id,
      referenceType: "ForumThread",
      description: "Nhận điểm khi đăng bài viết mới",
    });
    res.status(201).json(newThread);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
