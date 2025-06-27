const { default: mongoose } = require("mongoose");
const Product = require("../models/Product");
const asyncHandler = require("express-async-handler");

const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).populate("category").exec();
  console.log(products);
  res.json(products);
});
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId).populate(
    "category"
  );
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, price, description, category, countInStock } = req.body;
  const user = req.user;

  const product = new Product({
    user: user._id, // Assuming req.user is populated with the authenticated user's info
    name,
    price,
    description,
    category: new mongoose.Types.ObjectId(category),
    countInStock,
  });
  const host = req.get("host");
  const protocol = req.protocol;
  const baseUrl = `${protocol}://${host}/uploads/`;
  if (req.files && req.files.images.length > 0) {
    product.image = req.files.images.map((file) => baseUrl + file.filename);
  }
  if (req.files && req.files.poster && req.files.poster.length > 0) {
    product.thumbnail = baseUrl + req.files.poster[0].filename;
  }
  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  console.log(product);
  if (!product.user._id.equals(req.user._id)) {
    res.status(401).json({ message: "Not authorized to delete this product" });
    return;
  }
  if (product) {
    await product.deleteOne();
    res.json({ message: "Product removed" });
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

const getProductByAdmin = asyncHandler(async (req, res) => {
  const products = await Product.find({ user: req.user._id });
  if (!products || products.length === 0) {
    return res.status(404).json({ message: "No products found for this user" });
  }
  res.json(products);
});

const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, category, countInStock } = req.body;
  const product = await Product.findById(req.params.productId);
  const host = req.get("host");
  const protocol = req.protocol;
  const baseUrl = `${protocol}://${host}/uploads/`;
  if (req.files && req.files.length > 0) {
    product.image = req.files.map((file) => baseUrl + file.filename);
  }
  console.log(product.image);
  if (product) {
    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.image = image || product.image;
    product.category = category || product.category;
    product.countInStock = countInStock || product.countInStock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  deleteProduct, // Exporting deleteProduct for use in routes
  getProductByAdmin,
  updateProduct, // Exporting updateProduct for use in routes

  // You can add more exports for updateProduct and deleteProduct if needed
};
