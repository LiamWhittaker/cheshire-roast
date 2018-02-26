const mongoose = require('mongoose');
const promisify = require('es6-promisify');

const User = mongoose.model('User');

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

  req.checkBody('address.county', 'You must provide county').notEmpty();
  req.sanitizeBody('address.county');

  req.checkBody('address.postcode', 'You must provide postcode').notEmpty();
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
  res.redirect('/');
};
