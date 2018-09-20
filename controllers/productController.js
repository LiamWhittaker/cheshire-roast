const globalFunc = require('./globalController');
const mongoose = require('mongoose');
const slug = require('slugs');

const Product = mongoose.model('Product');
// const User = mongoose.model("User");
// const multer = require("multer");
// const jimp = require("jimp");
// const uuid = require("uuid");


// Renders the home page
exports.homePage = async (req, res) => {
  const coffee = await globalFunc.getWeightSoldPerCoffee();
  const topSix = coffee.slice(0, 5);

  // Extract the item ids to get product info
  const itemIDs = topSix.map(a => a.coffeeID);

  const productInfoPromise = Product.find({
    '_id' : { $in: itemIDs }
  });
  const productInfo = await productInfoPromise;

  res.render('index', { title: 'Home', productInfo });
};

// Renders the menu page
exports.showMenu = async (req, res) => {
  // Get a list of all products and total number of products in DB.
  const productsPromise = Product.find();
  const countPromise = Product.count();

  const [products, count] = await Promise.all([productsPromise, countPromise]);

  res.render('menu', { title: 'Our Menu', products, count });
};

// Show the add/edit products page
exports.editProductsMenu = async (req, res) => {
  // Get a list of all products
  const productsPromise = Product.find();
  const products = await productsPromise;

  res.render('editProducts', {title: 'Add/Edit Products', products});
}

// Show the edit products page
exports.editProduct = async (req, res) => {
  // Get the product we want top edit
  const productPromise = Product.findById({ _id: req.params.id });
  const product = await productPromise;

  res.render('addNewProduct', { title: 'Edit Product', product });
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

// Responsible for saving new products and edits to the database
exports.addNewProduct = async (req, res) => {
  // If there is an ID, we know it's an update to an existing product
  if(req.body.coffeeID) {
    const productToUpdate = Product.findByIdAndUpdate({_id: req.body.coffeeID}, req.body, {
      runValidators: true // Make sure data still conforms to schema
    }).exec();
    return res.redirect('/admin/editProducts');
  } else {
    // If there isn't an ID, we know it's a new product.
    req.body.slug = slug(req.body.name);
    const product = await (new Product(req.body)).save();    
    return res.redirect(`/menu/${product.slug}`);
  }
};

// Renders a specific coffee page
exports.showProduct = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  res.render('coffee', { product, title: product.name });
};
