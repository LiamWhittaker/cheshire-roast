const mongoose = require('mongoose');

const Order = mongoose.model('Order');
const User = mongoose.model("User");
const Product = mongoose.model("Product");


// Render the basket page
exports.showBasket = async (req, res) => { 
  // Get the current user's non-finalized orders
  const ordersPromise = Order.find({ userID: req.user._id });
  const countPromise = Order.count({ userID: req.user._id });
  const [orders, count] = await Promise.all([ordersPromise, countPromise]);


  res.render('basket', { title: 'Basket', orders, count });
};

// Add coffee to the basket
exports.addToBasket = async (req, res) => { 
  const order = await (new Order({
    userID: req.body.userId,
    itemsOrdered: [
      {
        itemID: req.body.coffeeId,
        grindType: req.body.grind,
        bagSize: req.body.size,
        qty: req.body.qty
      }
    ],
    orderFinalized: false,
  })).save();
  res.redirect('/basket');
};
