const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const ReviewController = require("../controller/ReviewController");
const uploadReviewImage = require("../middleware/uploadReviewImage");

router.post(
  "/createReview",
  authMiddleware,
  uploadReviewImage.single("image"),
  ReviewController.createReview
);
router.get(
  "/getListReviewByUser",
  authMiddleware,
  ReviewController.getListReviewByUser
);
router.get(
  "/getListReviewByProduct/:productId",
  ReviewController.getListReviewByProduct
);
router.post("/:reviewId/like", authMiddleware, ReviewController.likeReview);
router.get("/:reviewId/reactions", ReviewController.getReviewReactions);
router.put(
  "/:reviewId",
  authMiddleware,
  uploadReviewImage.single("image"),
  ReviewController.updateReview
);
router.delete("/:reviewId", authMiddleware, ReviewController.deleteReview);
router.post("/:reviewId/replies", authMiddleware, ReviewController.replyReview);
router.put(
  "/:reviewId/replies/:replyId",
  authMiddleware,
  ReviewController.updateReply
);
router.delete(
  "/:reviewId/replies/:replyId",
  authMiddleware,
  ReviewController.deleteReply
);

module.exports = router;
