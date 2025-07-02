const FavoriteProduct = require("../model/FavoriteProduct");

exports.addFavorite = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;
    await FavoriteProduct.findOneAndUpdate(
      { user_id: userId, product_id: productId },
      { user_id: userId, product_id: productId },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;
    await FavoriteProduct.deleteOne({ user_id: userId, product_id: productId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.isFavorite = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;
    const fav = await FavoriteProduct.findOne({
      user_id: userId,
      product_id: productId,
    });
    res.json({ isFavorite: !!fav });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getWishlistByUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const wishlist = await FavoriteProduct.find({ user_id: userId });
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
