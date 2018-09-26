const mongoose = require('mongoose');

const Order = mongoose.model('Order');
const User = mongoose.model("User");
const Product = mongoose.model("Product");
const promisify = require('es6-promisify');


// Render the basket page
exports.showBasket = async (req, res) => { 
  // Get the current user's non-finalized (in basket) orders
  const ordersPromise = Order.find({ userID: req.user._id, orderFinalized: false });
  const orders = await ordersPromise;

  // Extract the item ids so that we can grab the product information (link, price, in stock) from the database
  const itemIDs = orders.map(a => a.item.itemID);

  // Get the product info from the database
  const productInfoPromise = Product.find({
    '_id' : { $in: itemIDs }
  });
  const productInfo = await productInfoPromise;

  res.render('basket', { title: 'Basket', orders, productInfo });
};

// Middleware for checking if the product is in stock
exports.inStock = async (req, res, next) => {
  let orderWeight = (req.body.size === 'Regular') ? req.body.quantity * 250 : req.body.quantity * 1000;

  const productToCheck = await Product.findById(req.body.coffeeId);

  if(orderWeight > productToCheck.stockInGrams) {
    req.flash('error', `Sorry, we only have ${(productToCheck.stockInGrams / 1000).toLocaleString()}kg of stock remaining!`);
    return res.redirect(`/menu/${productToCheck.slug}`);
  }

  next();
};

// Add coffee to the basket
exports.addToBasket = async (req, res) => { 
  // 1. We have to check to see if the user already has this item + grind type combo in their basket.

  // Get all the items user's basket
  const ordersPromise = Order.find({ userID: req.user._id, orderFinalized: false });
  const orders = await ordersPromise;

  // Are there any orders?
  if (orders.length != 0) {
    // If so, loop through and check if any match the coffee id && grind type && bag size we are trying to add...
    for(var i = 0; i < orders.length; i++) {
      if (
        orders[i].item.itemID == req.body.coffeeId 
        && orders[i].item.grindType == req.body.grind 
        && orders[i].item.bagSize == req.body.size
        ) {
        // 2. If they do, we have to increment the quantity rather than add it as a duplicate entry in the basket.
        let newQuantity = orders[i].item.qty + parseInt(req.body.quantity);

        const orderToUpdatePromise = Order.findByIdAndUpdate(
          { _id: orders[i]._id },
          { $set: { "item.qty": newQuantity } }
        );
        const orderToUpdate = await orderToUpdatePromise;

        return res.redirect('/basket');
      }
    }
  }

  // 3. If we get here, they don't have anything in the basket, so we can add the new item. 
  const order = await (new Order({
    userID: req.body.userId,
    item: {
      itemID: req.body.coffeeId,
      itemName: req.body.coffeeName,
      grindType: req.body.grind,
      bagSize: req.body.size,
      qty: req.body.quantity
    },
    orderFinalized: false,
  })).save();
  res.redirect('/basket');
};

// Remove a coffee from the basket
exports.removeFromBasket = async (req, res) => {
  const orderToDelete = Order.findByIdAndRemove(req.params.orderID);
  await orderToDelete;

  res.redirect('/basket');
};

// Finalize order
exports.finalizeOrder = async (req, res) => {
  // 1. Get all items in user's basket
  const ordersPromise = Order.find({ userID: req.user._id, orderFinalized: false });
  const orders = await ordersPromise;

  // 1.5: Go through each item, checking if it is still in stock
  for(var i = 0; i < orders.length; i++) {
    const productToCheck = await Product.findById(orders[i].item.itemID);
    const orderWeight = (orders[i].item.bagSize === 'Regular') ? orders[i].item.qty * 250 : orders[i].item.qty * 1000;
    
    if(orderWeight > productToCheck.stockInGrams) {
      req.flash('error', `Sorry, we only have ${(productToCheck.stockInGrams / 1000).toLocaleString()}kg of ${productToCheck.name} remaining! Please modify your order before continuing.`);
      return res.redirect(`/basket`);
    }
  }

  // 1.75: If everything is in stock, decrease the products stock levels
  for(var i = 0; i < orders.length; i++) {
    const orderWeight = (orders[i].item.bagSize === 'Regular') ? orders[i].item.qty * 250 : orders[i].item.qty * 1000;
    let makeNegative = -Math.abs(orderWeight);

    const productToModify = await Product.findByIdAndUpdate(
      { _id: orders[i].item.itemID },
      { $inc: {
        stockInGrams: makeNegative
      }}
    );
  }

  // 2. Finally, update orderFinalized to true, adding orderDate, setting roasted/posted flags
  for(var i = 0; i < orders.length; i++) {
    const orderToUpdatePromise = Order.findByIdAndUpdate(
      { _id: orders[i]._id },
      { $set: { 
        "orderFinalized": true,
        "orderDate": Date.now(),
        "orderRoasted": false,
        "orderShipped": false
      } }
    );
    const orderToUpdate = await orderToUpdatePromise;
  }

  // 3. Render order completed page
  res.render('orderComplete', {title: 'Order Completed!'});
};