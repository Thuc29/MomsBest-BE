const ProductReview = require("../model/ProductReview");
const User = require("../model/User");
const UserPointsHistory = require("../model/UserPointsHistory");
const { addUserPoints } = require("../helper/pointsHelper");

exports.createReview = async (req, res) => {
  try {
    const { _id } = req.user;
    const newReview = await ProductReview.create({
      ...req.body,
      user_id: _id,
    });
    // Cộng điểm cho user khi review
    await addUserPoints({
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
    const reviews = await ProductReview.find({
      product_id: productId,
    });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
