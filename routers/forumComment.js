const express = require("express");
const router = express.Router();
const ForumCommentController = require("../controller/ForumCommentController");
const authMiddleware = require("../middleware/authMiddleware");
// Tạo comment cha (theo thread)
router.post(
  "/thread/:threadId",
  authMiddleware,
  ForumCommentController.createComment
);
// Tạo reply (giữ lại route cũ nếu cần)
router.post("/", authMiddleware, ForumCommentController.createComment);
// Like/unlike comment/reply
router.post(
  "/:commentId/like",
  authMiddleware,
  ForumCommentController.toggleLike
);
// Sửa comment/reply
router.put("/:commentId", ForumCommentController.editComment);
// Xóa comment/reply
router.delete("/:commentId", ForumCommentController.deleteComment);
// Lấy danh sách comment cha theo thread
router.get("/thread/:threadId", ForumCommentController.getCommentsByThread);
// Lấy danh sách reply theo comment cha
router.get("/:commentId/replies", ForumCommentController.getRepliesByComment);

module.exports = router;
