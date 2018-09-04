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
