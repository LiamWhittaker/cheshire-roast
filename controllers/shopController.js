const mongoose = require('mongoose');

const Order = mongoose.model('Order');
const User = mongoose.model("User");
const Product = mongoose.model("Product");


// Render the basket page
exports.showBasket = async (req, res) => { 
  // Get the current user's non-finalized (in basket) orders
  const ordersPromise = Order
    .find({ userID: req.user._id, orderFinalized: false });

  // Count the number of items in the basket
  const countPromise = Order.count({ userID: req.user._id, orderFinalized: false });

  const [orders, count] = await Promise.all([ordersPromise, countPromise]);

  // console.log(orders[0].item[0].itemID);

  res.render('basket', { title: 'Basket', orders, count });
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
