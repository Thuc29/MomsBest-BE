const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const ReviewController = require("../controller/ReviewController")

router.post("/createReview", authMiddleware, ReviewController.createReview)
router.get("/getListReviewByUser", authMiddleware, ReviewController.getListReviewByUser)
router.get("/getListReviewByProduct/:productId", ReviewController.getListReviewByProduct)

module.exports = router;