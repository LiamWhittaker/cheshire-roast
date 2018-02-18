const mongoose = require('mongoose');

const Product = mongoose.model('Product');
// const User = mongoose.model("User");
// const multer = require("multer");
// const jimp = require("jimp");
// const uuid = require("uuid");

exports.homePage = (req, res) => {
  res.render('index', { title: 'Home' });
};

exports.showMenu = async (req, res) => {
  // Get a list of all products and total number of products in DB.
  const productsPromise = Product.find();
  const countPromise = Product.count();

  const [products, count] = await Promise.all([productsPromise, countPromise]);

  res.render('menu', { title: 'Our Menu', products, count });
};
