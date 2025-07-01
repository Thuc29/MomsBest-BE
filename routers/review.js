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

module.exports = router;
