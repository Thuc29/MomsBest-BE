const express = require("express");
const router = express.Router();
const {
  addFavorite,
  removeFavorite,
  isFavorite,
  getWishlistByUser,
} = require("../controller/FavoriteController");
const auth = require("../middleware/authMiddleware");

router.post("/add", auth, addFavorite);
router.post("/remove", auth, removeFavorite);
router.get("/isFavorite/:productId", auth, isFavorite);
router.get("/getWishlistByUser", auth, getWishlistByUser);
module.exports = router;
