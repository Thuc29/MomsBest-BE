const express = require("express");
const Product = require("../model/Product");
const CategoryProduct = require("../model/CategoryProduct");
const router = express.Router();
const categoryProductController = require("../controller/admin/categoryProduct");
router.get("/categories", categoryProductController.getAll);

// Test route để kiểm tra populate
router.get("/test/populate", async (req, res) => {
  try {
    console.log("Testing populate...");

    // Lấy một sản phẩm với populate
    const product = await Product.findById("6843eda16b72cc3599b97db6")
      .populate("category_ids")
      .populate("category_id");

    console.log("Product with populate:", JSON.stringify(product, null, 2));

    // Lấy tất cả categories
    const categories = await CategoryProduct.find();
    console.log(
      "All categories:",
      categories.map((c) => ({ id: c._id, name: c.name }))
    );

    res.json({
      product,
      categories,
      message: "Test completed",
    });
  } catch (error) {
    console.error("Test error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { category_id, brand, is_featured, sort } = req.query;
    let query = {};

    // Filter theo category_id (hỗ trợ cả category_id cũ và category_ids mới)
    if (category_id) {
      query.$or = [
        { category_ids: { $in: [category_id] } },
        { category_id: category_id },
      ];
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
      .populate("category_id")
      .sort(sortOption);

    console.log("First product category_ids:", products[0]?.category_ids);
    console.log("First product category_id:", products[0]?.category_id);

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

    const product = await Product.findById(productId)
      .populate("category_ids")
      .populate("category_id");

    console.log("Product category_ids:", product?.category_ids);
    console.log("Product category_id:", product?.category_id);

    res.status(200).json(product);
  } catch (error) {
    console.error("Error in product detail API:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
