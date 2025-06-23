const ForumComment = require("../model/ForumComment");
const CommentLike = require("../model/CommentLike");
const mongoose = require("mongoose");
const { addUserPoints } = require("../helper/pointsHelper");

// Thêm comment hoặc reply
exports.createComment = async (req, res) => {
  try {
    const { content, parent_comment_id } = req.body;
    const thread_id = req.params.threadId;
    const user = req.user;

    if (!thread_id) {
      return res.status(400).json({ message: "thread_id is required" });
    }
    if (!content) {
      return res.status(400).json({ message: "content is required" });
    }
    if (!user || !user._id) {
      return res.status(401).json({ message: "User authentication required" });
    }

    const comment = new ForumComment({
      thread_id,
      content,
      parent_comment_id: parent_comment_id || null,
      author_id: user._id,
    });

    console.log("Comment object before saving:", comment);
    await comment.save();
    await comment.populate("author_id");
    console.log("Comment saved successfully:", comment);

    // Cộng điểm cho user khi comment
    await addUserPoints({
      userId: user._id,
      actionType: "comment",
      referenceId: comment._id,
      referenceType: "ForumComment",
      description: "Nhận điểm khi bình luận mới",
    });

    res.status(201).json(comment);
  } catch (err) {
    console.error("Error in createComment:", err.message);
    res.status(500).json({ error: "Internal server error: " + err.message });
  }
};

// Like/unlike comment/reply
exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user?.userId || req.userId;
    if (!userId) return res.status(400).json({ message: "User not found" });
    const comment_id = req.params.commentId;
    const existing = await CommentLike.findOne({ comment_id, user_id: userId });
    console.log("existing:", existing);
    console.log("comment_id:", comment_id);
    console.log("user_id:", userId);
    if (existing) {
      await existing.deleteOne();
      await ForumComment.findByIdAndUpdate(comment_id, { $inc: { likes: -1 } });
      return res.json({ liked: false });
    } else {
      await CommentLike.create({ comment_id, user_id: userId });
      await ForumComment.findByIdAndUpdate(comment_id, { $inc: { likes: 1 } });
      return res.json({ liked: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Sửa comment/reply
exports.editComment = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await ForumComment.findByIdAndUpdate(
      req.params.commentId,
      { content, updated_at: Date.now() },
      { new: true }
    );
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    res.json({ content: comment.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xóa comment/reply
exports.deleteComment = async (req, res) => {
  try {
    const comment = await ForumComment.findByIdAndDelete(req.params.commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    // Xóa luôn các reply nếu là comment cha
    await ForumComment.deleteMany({ parent_comment_id: req.params.commentId });
    // Xóa like liên quan
    await CommentLike.deleteMany({ comment_id: req.params.commentId });
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy danh sách comment cha (parent_comment_id = null) theo thread
exports.getCommentsByThread = async (req, res) => {
  try {
    const thread_id = req.params.threadId;
    const comments = await ForumComment.find({
      thread_id,
      parent_comment_id: null,
    })
      .populate("author_id")
      .sort({ created_at: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy danh sách reply theo comment cha
exports.getRepliesByComment = async (req, res) => {
  try {
    const parent_comment_id = req.params.commentId;
    const replies = await ForumComment.find({ parent_comment_id })
      .populate("author_id")
      .sort({ created_at: 1 });
    res.json(replies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
