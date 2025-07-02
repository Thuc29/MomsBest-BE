const ProductReview = require("../model/ProductReview");
const User = require("../model/User");
const UserPointsHistory = require("../model/UserPointsHistory");
const { addPointsForAction } = require("../helper/pointsHelper");
const ReviewReaction = require("../model/ReviewReaction");
const mongoose = require("mongoose");

exports.createReview = async (req, res) => {
  try {
    const { _id } = req.user;
    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/reviews/${req.file.filename}`;
    }
    const newReview = await ProductReview.create({
      ...req.body,
      user_id: _id,
      image: imagePath,
    });
    // Cộng điểm cho user khi review
    await addPointsForAction({
      userId: _id,
      actionType: "product_review",
      referenceId: newReview._id,
      referenceType: "ProductReview",
      description: "Nhận điểm khi đánh giá sản phẩm",
    });
    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getListReviewByUser = async (req, res) => {
  try {
    const { _id } = req.user;
    const reviews = await ProductReview.find({
      user_id: _id,
    });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getListReviewByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, rating } = req.query;
    const query = { product_id: productId };
    if (rating) query.rating = Number(rating);
    const reviews = await ProductReview.find(query)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await ProductReview.countDocuments(query);
    res
      .status(200)
      .json({ reviews, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Like/Dislike (toggle) review
exports.likeReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reaction_type } = req.body; // like, love, laugh, wow, sad, angry
    const userId = req.user._id;
    if (!reaction_type)
      return res.status(400).json({ error: "reaction_type is required" });
    // Tìm reaction cũ
    let reaction = await ReviewReaction.findOne({
      review_id: reviewId,
      user_id: userId,
    });
    const review = await ProductReview.findById(reviewId);
    if (!review) return res.status(404).json({ error: "Review not found" });
    // Nếu user like review của người khác thì cộng điểm cho chủ review
    if (review.user_id.toString() !== userId.toString()) {
      await addPointsForAction({
        userId: review.user_id,
        actionType: "like_received",
        referenceId: reviewId,
        referenceType: "ProductReviewReaction",
        description: `Nhận điểm khi review được bày tỏ cảm xúc (${reaction_type})`,
      });
    }
    if (reaction) {
      if (reaction.reaction_type === reaction_type) {
        // Nếu đã like kiểu này, bỏ like
        await reaction.deleteOne();
        return res.json({ status: "removed", reaction_type });
      } else {
        // Đổi loại cảm xúc
        reaction.reaction_type = reaction_type;
        await reaction.save();
        return res.json({ status: "updated", reaction_type });
      }
    } else {
      // Thêm mới
      await ReviewReaction.create({
        review_id: reviewId,
        user_id: userId,
        reaction_type,
      });
      return res.json({ status: "added", reaction_type });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy tổng hợp cảm xúc cho 1 review
exports.getReviewReactions = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const reactions = await ReviewReaction.aggregate([
      { $match: { review_id: new mongoose.Types.ObjectId(reviewId) } },
      { $group: { _id: "$reaction_type", count: { $sum: 1 } } },
    ]);
    const result = {};
    reactions.forEach((r) => {
      result[r._id] = r.count;
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Sửa review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;
    let review = await ProductReview.findById(reviewId);
    if (!review) return res.status(404).json({ error: "Review not found" });
    if (review.user_id.toString() !== userId.toString())
      return res
        .status(403)
        .json({ error: "Bạn không có quyền sửa đánh giá này" });
    let imagePath = review.image;
    if (req.file) {
      imagePath = `/uploads/reviews/${req.file.filename}`;
    }
    review.comment = req.body.comment || review.comment;
    review.rating = req.body.rating || review.rating;
    review.image = imagePath;
    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Xóa review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;
    const review = await ProductReview.findById(reviewId);
    if (!review) return res.status(404).json({ error: "Review not found" });
    if (review.user_id.toString() !== userId.toString())
      return res
        .status(403)
        .json({ error: "Bạn không có quyền xóa đánh giá này" });
    await ReviewReaction.deleteMany({ review_id: reviewId });
    await review.deleteOne();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.replyReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { comment } = req.body;
    const userId = req.user._id;
    console.log(
      "[replyReview] reviewId:",
      reviewId,
      "comment:",
      comment,
      "userId:",
      userId
    );
    if (!comment)
      return res.status(400).json({ error: "Thiếu nội dung trả lời" });
    const review = await ProductReview.findById(reviewId);
    console.log("[replyReview] review:", review);
    if (!review) return res.status(404).json({ error: "Review not found" });
    console.log("[replyReview] replies before:", review.replies.length);
    review.replies.push({ user_id: userId, comment });
    console.log("[replyReview] replies after push:", review.replies.length);
    await review.save();
    console.log("[replyReview] reply saved successfully");
    const reply = review.replies[review.replies.length - 1];
    // Cộng điểm cho user khi reply
    await addPointsForAction({
      userId,
      actionType: "comment",
      referenceId: reply._id,
      referenceType: "ReviewReply",
      description: "Nhận điểm khi trả lời đánh giá sản phẩm",
    });
    res.json(reply);
  } catch (error) {
    console.error("[replyReview] error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateReply = async (req, res) => {
  try {
    const { reviewId, replyId } = req.params;
    const { comment } = req.body;
    const userId = req.user._id;
    const review = await ProductReview.findById(reviewId);
    if (!review) return res.status(404).json({ error: "Review not found" });
    const reply = review.replies.id(replyId);
    if (!reply) return res.status(404).json({ error: "Reply not found" });
    if (reply.user_id.toString() !== userId.toString())
      return res
        .status(403)
        .json({ error: "Bạn không có quyền sửa reply này" });
    reply.comment = comment;
    await review.save();
    res.json(reply);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteReply = async (req, res) => {
  try {
    const { reviewId, replyId } = req.params;
    const userId = req.user._id;
    const review = await ProductReview.findById(reviewId);
    if (!review) return res.status(404).json({ error: "Review not found" });
    const reply = review.replies.id(replyId);
    if (!reply) return res.status(404).json({ error: "Reply not found" });
    if (reply.user_id.toString() !== userId.toString())
      return res
        .status(403)
        .json({ error: "Bạn không có quyền xóa reply này" });
    reply.remove();
    await review.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
