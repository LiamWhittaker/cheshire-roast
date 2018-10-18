const mongoose = require('mongoose');

const Order = mongoose.model('Order');
const User = mongoose.model("User");
const Product = mongoose.model("Product");
const Subscription = mongoose.model("Subscription");
const promisify = require('es6-promisify');
const mail = require('../handlers/email');


// ============================
// SUBSCRIPTIONS
// ============================

exports.subscription = (req, res) => {
  res.render('subscribe', {title: 'Subscribe'});
}

exports.confirmSubscription = (req, res) => {
  console.log(req.body)

  let today = new Date();
  let interval = parseInt(req.body.interval);
  let nextDelivery = new Date()
  nextDelivery.setDate(today.getDate() + interval);

  res.render('confirmSubscription', { title: 'Confirm Subscription', details: req.body, today, nextDelivery } )
}

exports.saveSubscription = async (req, res) => {
  // 1. Decide which coffee to send them based on their chosen subscription type
  const firstCoffee = await chooseACoffee(req.body.coffeeType);

  // 2. Save Subscription
  const subscription = await (new Subscription({
    userID: req.body.userID,
    coffeeType: req.body.coffeeType,
    grindType: req.body.grindType,
    bagSize: req.body.bagSize,
    deliveryInterval: Number(req.body.deliveryInterval),
    startDate: req.body.startDate,
    nextDelivery: req.body.nextDelivery,
    history: [
      {
        coffeeID: firstCoffee._id,
        deliveryDate: req.body.startDate
      }
    ]
  })).save();

  // 3. Add first order to the DB
  const firstOrder = await (new Order({
    userID: req.body.userID,
    item: {
      itemID: firstCoffee._id,
      itemName: firstCoffee.name,
      grindType: req.body.grindType,
      bagSize: req.body.bagSize,
      qty: 1
    },
    orderFinalized: true,
    orderDate: new Date(),
    orderType: 'Subscription'
  })).save();

  req.flash('success', 'Subscription confirmed');
  res.redirect('/');
}

// =======================
// Helper functions
// =======================

exports.getTodaysSubscriptions = async () => {
  // Initialize dates
  const todayStart = new Date();
  const todayEnd = new Date();
  // HRS, MINS, SECS, MS
  todayStart.setHours(0, 0, 0, 0);
  todayEnd.setHours(23, 59, 59, 999);

  const todaysSubscriptions = await Subscription.find({
    nextDelivery: {
      $gte: todayStart,
      $lt: todayEnd
    }
  });

  return todaysSubscriptions;
}

exports.processSubscriptions = async (subs) => {
  for (var i = 0; i < subs.length; i++) {
    // 1. Get a random coffee that matches the subscription type
    const selected = await chooseACoffee(subs[i].coffeeType);
  
    // 2. Add the new order to the database
    const addSubOrder = await (new Order({
      userID: subs[i].userID,
      item: {
        itemID: selected._id,
        itemName: selected.name,
        grindType: subs[i].grindType,
        bagSize: subs[i].bagSize,
        qty: 1
      },
      orderFinalized: true,
      orderDate: new Date(),
      orderType: 'Subscription'
    })).save();
  
    // 3. Update the subscription history
    const nextDelivery = new Date();
    nextDelivery.setDate(nextDelivery.getDate() + subs[i].deliveryInterval);

    const updateSubscription = await Subscription.findByIdAndUpdate(
      { _id: subs[i]._id },
      { 
        $set: { nextDelivery },
        $push: {
          history: { 
            coffeeID: selected._id, 
            deliveryDate: new Date() 
          }
        }
      }
    );
  }
  console.log(`${subs.length} subscriptions successfully processed.`);
}

chooseACoffee = async (subType) => {
  if (subType === 'Any') {
    const coffeeChoice = await Product.find();
  } else {
    const coffeeChoice = await Product.find({coffeeType: subType});
  }

  const selected = coffeeChoice[Math.floor(Math.random() * coffeeChoice.length)];

  return selected;
}
