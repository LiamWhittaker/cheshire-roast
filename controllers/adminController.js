const mongoose = require('mongoose');
const groupArray = require('group-array');

const Product = mongoose.model('Product');
const Order = mongoose.model('Order');

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
    { $inc: { "stockInGrams": amountToAdd } }
  );
  const productToRestock = await productToRestockPromise;

  res.redirect('/stockCheck');
};

// Get the open orders
exports.openOrders = async (req, res) => {
  // Get completed orders that have not been roasted or posted
  const ordersPromise = Order.find({ 
    orderFinalized: true, 
    orderRoasted: false, 
    orderShipped: false 
  });
  const orders = await ordersPromise;

  // Extract the item ids to get product name
  const itemIDs = orders.map(a => a.item.itemID);

  // Get the product info from the database
  const productInfoPromise = Product.find({
    '_id' : { $in: itemIDs }
  });
  const productInfo = await productInfoPromise;

  // Find the coffees that need to be roasted
  const orderArray = await itemsToRoast();

  // res.json(orderArray)
  res.render('openOrders', { title: 'Open Orders', orders, orderArray, productInfo });
};

// Mark orders as roasted
exports.roast = async (req, res) => {
  const orderToUpdatePromise = Order.updateMany(
    { 'item.itemID': req.body.coffeeID },
    { $set: { "orderRoasted": true } }
  );
  const orderToUpdate = await orderToUpdatePromise;

  res.redirect('/openOrders');
};




// ===================
// Helper functions
// ===================

// Find the coffees that need to be roasted
async function itemsToRoast() {
  const itemsToRoastPromise = Order.distinct('item.itemID',
  { 
    orderFinalized: true, 
    orderRoasted: false, 
    orderShipped: false 
  });
  const itemsToRoast = await itemsToRoastPromise;
  let orderArray = [];

  // Group all the coffees that need to be roasted
  for (var i = 0; i < itemsToRoast.length; i++) {
    const orderPromise = Order.find({ 
      'item.itemID': itemsToRoast[i],
      orderRoasted: false 
    });
    const order = await orderPromise;
    orderArray.push(order);
  };
  
  return orderArray;
}
