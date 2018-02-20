const mongoose = require('mongoose');
const slug = require('slugs');

const Product = mongoose.model('Product');
// const User = mongoose.model("User");
// const multer = require("multer");
// const jimp = require("jimp");
// const uuid = require("uuid");


// Renders the home page
exports.homePage = (req, res) => {
  res.render('index', { title: 'Home' });
};

// Renders the menu page
exports.showMenu = async (req, res) => {
  // Get a list of all products and total number of products in DB.
  const productsPromise = Product.find();
  const countPromise = Product.count();

  const [products, count] = await Promise.all([productsPromise, countPromise]);

  res.render('menu', { title: 'Our Menu', products, count });
};

// Renders the 'Add new product form'
exports.addNewProductForm = (req, res) => {
  res.render('addNewProduct', { title: 'Add New Product' });
};

// Middleware for sanitizing form input before we try and save it to the database
exports.sanitizeNewProduct = (req, res, next) => {
  // Split the 'tags' input into individual strings
  req.body.flavourTags = req.body.flavourTags.split(' ');

  next();
};

// Responsible for saving new products to the database
exports.addNewProduct = async (req, res) => {
  req.body.slug = slug(req.body.name);
  const product = await (new Product(req.body)).save();
  res.redirect(`/menu/${product.slug}`);
};

// Renders a specific coffee page
exports.showProduct = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  res.render('coffee', { product, title: product.name });
};
