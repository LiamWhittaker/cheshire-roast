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

exports.subscription = async (req, res) => {
  const alreadySubbed = await Subscription.count({ userID: req.user._id });
  if (alreadySubbed) {
    req.flash('error', 'You already have an active subscription!');
    return res.redirect('/manageSubscription');
  }

  res.render('subscribe', {title: 'Subscribe'});
}

exports.manageSubscription = async (req, res) => {
  const subInfo = await Subscription.findOne({userID: req.user._id}).populate('history.coffeeID');
  res.render('manageSubscription', { title: 'Manage Subscription', subInfo });
}

exports.editSubscription = async (req, res) => {
  const currentSub = await Subscription.findOne({userID: req.user._id});

  // If there's no change, redirect the user back to the subscription page
  if (currentSub.coffeeType === req.body.coffeeType &&
      currentSub.grindType === req.body.grindType &&
      currentSub.bagSize === req.body.bagSize &&
      currentSub.deliveryInterval === parseInt(req.body.deliveryInterval)) {
        req.flash('info', 'There was nothing to update');
        return res.redirect('/manageSubscription');
      }

  // If the delivery interval has changed we need to generate a new value for 'next delivery'
  if (currentSub.deliveryInterval !== req.body.deliveryInterval) {
    // If the sub is currently paused, we need to reset it!
    // We are doing today + 1 day because subs get processed at 00:01 so if we just set it to today it will never
    // be processed.
    if(currentSub.deliveryInterval === 999999999) {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 1);
      req.body.nextDelivery = newDate;
    } else {
      // If the user wants to pause their subscription, set the next delivery to the year 3000
      if(parseInt(req.body.deliveryInterval) === 999999999) {
        // req.body.deliveryInterval = 999999999;
        req.body.nextDelivery = new Date(3000, 1, 1);
      } else {
        // If the user is changing delivery interval, set the next delivery date to tomorrow.
        const newDate = new Date();
        newDate.setDate(newDate.getDate() + 1);
        req.body.nextDelivery = newDate;
      }
    }
  }

  const updateSub = await Subscription.findOneAndUpdate(
    { userID: req.user._id }, 
    {
      coffeeType: req.body.coffeeType,
      grindType: req.body.grindType,
      bagSize: req.body.bagSize,
      deliveryInterval: req.body.deliveryInterval,
      nextDelivery: req.body.nextDelivery
    });

  req.flash('success', 'Updated your subscription!');
  res.redirect('/manageSubscription');
}

exports.confirmSubscription = (req, res) => {
  let today = new Date();
  let interval = parseInt(req.body.interval);
  let nextDelivery = new Date()
  nextDelivery.setDate(today.getDate() + interval);

  res.render('confirmSubscription', { title: 'Confirm Subscription', details: req.body, today, nextDelivery } )
}

exports.saveSubscription = async (req, res) => {
  // 0. Check if already subbed
  const alreadySubbed = await Subscription.count({ userID: req.user._id });
  if (alreadySubbed) {
    req.flash('error', 'You already have an active subscription!');
    return res.redirect('/manageSubscription');
  }

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
  const coffeeChoice = await Product.find({coffeeType: subType});
  return coffeeChoice[Math.floor(Math.random() * coffeeChoice.length)];
}
