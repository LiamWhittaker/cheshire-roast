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

// Add coffee to the basket
exports.addToBasket = async (req, res) => { 
  // 1. We have to check to see if the user already has this item + grind type combo in their basket.

  // Get all the items user's basket
  const ordersPromise = Order.find({ userID: req.user._id, orderFinalized: false });
  const orders = await ordersPromise;

  // Are there any orders?
  if (orders.length != 0) {
    // If so, loop through and check if any match the coffee id && grind type we are trying to add...
    for(var i = 0; i < orders.length; i++) {
      if (orders[i].item.itemID == req.body.coffeeId && orders[i].item.grindType == req.body.grind && orders[i].item.bagSize == req.body.size) {
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