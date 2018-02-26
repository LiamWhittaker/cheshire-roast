const mongoose = require('mongoose');
const promisify = require('es6-promisify');

const User = mongoose.model('User');

// Render the registration form
exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register' });
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
