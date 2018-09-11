const mongoose = require('mongoose');
const promisify = require('es6-promisify');

const Product = mongoose.model('Product');

// Render the admin control panel
exports.showAdminPanel = (req, res) => {
  res.render('admin', { title: 'Admin Panel' });
};

// Render the stock checker page
exports.stockCheck = async (req, res) => {
  // Get a list of all products and total number of products in DB, sorted by stock level
  const productsPromise = Product.find().sort({ stockInGrams: 'ascending' });
  const products = await productsPromise;

  res.render('stockCheck', { title: 'Stock Checker', products });
};

// Restock an item
exports.restock = async (req, res) => {
  const amountToAdd = parseInt(req.body.amount);
  const productToRestockPromise = Product.findByIdAndUpdate(
    { _id: req.body.productid },
    { $inc: { 
      "stockInGrams": amountToAdd
    } }
  );
  const productToRestock = await productToRestockPromise;

  res.redirect('/stockCheck');
};

