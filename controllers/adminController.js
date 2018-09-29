const mongoose = require('mongoose');


const Product = mongoose.model('Product');
const Order = mongoose.model('Order');



// Render the admin control panel
exports.showAdminPanel = async (req, res) => {
  const completedOrders = await getCompletedOrders();
  const ordersRequiringAction = await getOrdersRequiringAction();
  const totalOrderValue = await getTotalValueOfOrders();
  const totalWeightSold = await getWeightSoldPerCoffee();
  const topFive = totalWeightSold.slice(0, 5);

  res.render('admin', { 
    title: 'Admin Panel', 
    completedOrders, 
    ordersRequiringAction,
    totalOrderValue,
    totalWeightSold,
    topFive
  });
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

exports.ordersToGrindAndPost = async (req, res) => {
  // 1. Find all orders that are roasted and ready for grinding and posting
  // 2. We also need the user's name and address so we know where to send the package
  const ordersToPostPromise = Order.find({
    orderFinalized: true, 
    orderRoasted: true, 
    orderShipped: false 
  }).populate('userID');
  const ordersToPost = await ordersToPostPromise;

  res.render('ordersToPost', { title: 'Orders to Post', ordersToPost });
};

exports.generateShippingLabel = async (req, res) => {
  const labelPromise = Order.findById({ _id: req.body.orderID }).populate('userID');
  const label = await labelPromise;

  res.render('shippingLabel', { title: 'Shipping Label', label } );
}

exports.orderShipped = async (req, res) => {
  const orderToUpdatePromise = Order.findByIdAndUpdate(
    { _id:  req.body.orderID },
    { $set: { 
      "orderShipped": true
    } }
  );
  const orderToUpdate = await orderToUpdatePromise;

  res.redirect('/grindAndPost');
}

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

// Gets all completed orders
async function getCompletedOrders() {
  const completedOrdersPromise = Order.find({
    orderFinalized: true,
    orderRoasted: true,
    orderShipped: true
  });
  const completedOrders = await completedOrdersPromise;
  
  return completedOrders;
}

// Number of orders that require some admin action
async function getOrdersRequiringAction() {
  // Get orders that have not been roasted OR orders that have been roasted but not ground/posted
  const ordersRequiringActionPromise = Order.find({ 
    $or: [ 
      { 
        orderFinalized: true,
        orderRoasted: false,
        orderShipped: false
      }, 
      { 
        orderFinalized: true,
        orderRoasted: true,
        orderShipped: false
      }
    ] 
  });
  const ordersRequiringAction = await ordersRequiringActionPromise;
  
  return ordersRequiringAction.length;
}

// Get the total value of all completed orders
async function getTotalValueOfOrders() {
  // Get all completed orders
  const allOrders = await getAllOrders();

  // Go through them and add up the total value
  let totalValue = 0;
  for (var i = 0; i < allOrders.length; i++) {  
    if(allOrders[i].item.bagSize == 'Regular') {
      // If an item that has been ordered has been deleted from the database, 
      // price information will return null, which breaks stuff. 
      totalValue += ((allOrders[i].item.itemID.price.smallBag || 0) * allOrders[i].item.qty);
    } else {
      totalValue += ((allOrders[i].item.itemID.price.largeBag || 0) * allOrders[i].item.qty);
    }
  }

  return totalValue;
}

// Return all completed orders
async function getAllOrders() {
  const getAllOrdersPromise = Order.find({
    orderFinalized: true,
    orderRoasted: true,
    orderShipped: true
  }).populate({
    path: 'item.itemID',
    model: 'Product'
  });
  const getAllOrders = await getAllOrdersPromise;

  return getAllOrders;
}

// Return total weight of each coffee sold
async function getWeightSoldPerCoffee() {
  const allCoffeesPromise = Product.find().select({ _id: 1, name: 1 });
  const allCoffees = await allCoffeesPromise;

  // Group all the coffees
  let orderArray = [];
  for (var i = 0; i < allCoffees.length; i++) {
    const orderPromise = Order.find({ 
      'item.itemID': allCoffees[i]._id,
      orderFinalized: true,
      orderRoasted: true,
      orderShipped: true
    }).select({ item: 1, _id: 0 });
    const order = await orderPromise;

    orderArray.push(order);
  };

  // Filter out the items that have no orders
  const filteredArray = orderArray.filter(val => {
    return val.length >= 1;
  });
    
  let grouped = []
  
  // Work out the amount of each coffee sold
  for (var i = 0; i < filteredArray.length; i++) {
    // Initialize/Reset the counter
    let totalWeight = 0;
    for (var j = 0; j < filteredArray[i].length; j++) {
      if(filteredArray[i][j].item.bagSize === 'Regular') {
        totalWeight += (250 * filteredArray[i][j].item.qty); // Grams
      } else {
        totalWeight += (1000 * filteredArray[i][j].item.qty); // Grams
      } 
    }

    // If there are orders, add them to an array
    let coffeeName = filteredArray[i][0].item.itemName;
    grouped.push(new Object ({ coffeeName, totalWeight}));
  }
  
  // Sort descending
  const sorted = grouped.sort(function (a, b) {
    return b.totalWeight - a.totalWeight;
  });
  
  return sorted;
  // Delicious spaghetti :)
}