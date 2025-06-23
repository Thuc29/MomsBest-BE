const express = require("express");
const Product = require("../model/Product");
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const products = await Product.find()
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params
    const product = await Product.findById(productId)
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

module.exports = router;