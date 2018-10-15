const mongoose = require('mongoose');
const promisify = require('es6-promisify');
const mail = require('../handlers/email');


const User = mongoose.model('User');
const Order = mongoose.model('Order');

// ==========================================
// Registration stuff
// ==========================================

// Render the registration form
exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register' });
};

// Check info exists and then sanitize it before we try and validate it
exports.sanitizeRegistration = (req, res, next) => {
  req.checkBody('firstName', 'You must enter a first name').notEmpty();
  req.sanitizeBody('firstName');

  req.checkBody('secondName', 'You must enter a second name').notEmpty();
  req.sanitizeBody('secondName');

  req.checkBody('address.lineOne', 'You must provide an address').notEmpty();
  req.sanitizeBody('address.lineOne');

  req.checkBody('address.townCity', 'You must provide town or city').notEmpty();
  req.sanitizeBody('address.townCity');

  req.checkBody('address.county', 'You must provide a county').notEmpty();
  req.sanitizeBody('address.county');

  req.checkBody('address.postcode', 'You must provide a postcode').notEmpty();
  req.sanitizeBody('address.postcode');

  req.checkBody('email', 'You must provide an email address').notEmpty();
  req.sanitizeBody('email').normalizeEmail();

  req.checkBody('password', 'Password field cannot be blank').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('register', {
      title: 'Register',
      body: req.body,
      flashes: req.flash()
    });
    return;
  }

  next();
};

// Now validate the sanitized info...
exports.validateRegistration = (req, res, next) => {
  req
    .checkBody('confirmPassword', 'Password confirmation field cannot be blank')
    .notEmpty();

  req
    .checkBody('confirmPassword', 'Passwords do not match!')
    .equals('password');

  const errors = req.validationErrors();

  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('register', {
      title: 'Register',
      body: req.body,
      flashes: req.flash()
    });
    return;
  }

  next();
};

// Register a new account
exports.register = async (req, res) => {
  const user = new User({
    firstName: req.body.firstName,
    secondName: req.body.secondName,
    address: {
      lineOne: req.body.address.lineOne,
      townCity: req.body.address.townCity,
      county: req.body.address.county,
      postcode: req.body.address.postcode
    },
    email: req.body.email
  });

  const register = promisify(User.register, User);
  await register(user, req.body.password);

  await mail.send({
    user,
    filename: 'registrationComplete',
    subject: 'Welcome to Cheshire Roast',
  });

  req.flash('success', 'Account successfully created! You may now log in.');
  res.redirect('/login');
};

// ==========================================
// Login stuff
// ==========================================

// Render the login form
exports.loginForm = (req, res) => {
  res.render('login', { title: 'Log in' });
};


// =========================================
// User Account page
// =========================================

exports.userAccount = async (req, res) => {
  const openOrdersPromise = Order
  .find({
    userID: req.user._id,
    orderFinalized: true,
    orderShipped: false
  })
  .sort({orderDate: 'descending'});

  const orderHistoryPromise = Order
  .find({
    userID: req.user._id,
    orderFinalized: true,
    orderShipped: true
  })
  .sort({orderDate: 'descending'})
  .limit(10);

  const [openOrders, orderHistory] = await Promise.all([openOrdersPromise, orderHistoryPromise]);

  res.render('account', {title: 'User Account', openOrders, orderHistory});
};

exports.updateUserAccount = (req, res) => {
  const accountToUpdate = User.findByIdAndUpdate({_id: req.user._id}, req.body, {
    runValidators: true // Make sure data still conforms to schema
  }).exec();
  
  req.flash('success', 'Account details successfully updated');
  return res.redirect('/account');
};