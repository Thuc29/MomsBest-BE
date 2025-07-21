const express = require("express");
const Product = require("../model/Product");
const CategoryProduct = require("../model/CategoryProduct");
const router = express.Router();
const categoryProductController = require("../controller/admin/categoryProduct");
router.get("/categories", categoryProductController.getAll);

router.get("/", async (req, res) => {
  try {
    const { category_id, brand, is_featured, sort } = req.query;
    let query = {};

    // Filter theo category_id (hỗ trợ cả category_id cũ và category_ids mới)
    if (category_id) {
      query.$or = [{ category_ids: { $in: [category_id] } }];
    }

    // Filter theo brand
    if (brand) {
      query.brand = { $regex: brand, $options: "i" };
    }

    // Filter theo featured
    if (is_featured !== undefined) {
      query.is_featured = is_featured === "true";
    }

    // Sort options
    let sortOption = { created_at: -1 };
    if (sort === "-createdAt") {
      sortOption = { created_at: -1 };
    } else if (sort === "createdAt") {
      sortOption = { created_at: 1 };
    } else if (sort === "price") {
      sortOption = { price: 1 };
    } else if (sort === "-price") {
      sortOption = { price: -1 };
    }

    console.log("Query:", query);
    const products = await Product.find(query)
      .populate("category_ids")
      .sort(sortOption);

    console.log("First product category_ids:", products[0]?.category_ids);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error in products API:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    console.log("Getting product by ID:", productId);

    const product = await Product.findById(productId).populate("category_ids");

    console.log("Product category_ids:", product?.category_ids);

    res.status(200).json(product);
  } catch (error) {
    console.error("Error in product detail API:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
