const express = require("express");
const router = express.Router();
const ForumThreadController = require("../controller/ForumThreadController");
const authMiddleware = require("../middleware/authMiddleware");

// Create forum thread
router.post("/", ForumThreadController.createForumThread);
// Get all forum threads
router.get("/", ForumThreadController.getForumThreads);
// Get forum thread by id
router.get("/getDetail/:id", ForumThreadController.getForumThreadById);
// Update forum thread
router.put("/:id", ForumThreadController.updateForumThread);
// Delete forum thread
router.delete("/:id", ForumThreadController.deleteForumThread);
// Get all forum threads by category id
router.get("/category/:id", ForumThreadController.getForumThreadsByCategoryId);

router.post("/:id/save", authMiddleware, ForumThreadController.saveThread);
router.post("/:id/follow", authMiddleware, ForumThreadController.followThread);
router.post("/:id/report", ForumThreadController.reportThread);
// Like/unlike thread
router.post("/:id/like", authMiddleware, ForumThreadController.likeThread);
router.get("/:id/isliked", authMiddleware, ForumThreadController.isLiked);
router.get("/:id/issaved", authMiddleware, ForumThreadController.isSaved);
router.get("/:id/isfollowed", authMiddleware, ForumThreadController.isFollowed);

router.get("/:id/isfollowed", authMiddleware, ForumThreadController.isFollowed);

router.get("/getForumThreadByAuthor", authMiddleware, ForumThreadController.getForumThreadByAuthor);

module.exports = router;
