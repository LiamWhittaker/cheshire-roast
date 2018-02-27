const passport = require('passport');
const mongoose = require('mongoose');
const promisify = require('es6-promisify');

const User = mongoose.model('User');

// Log the user in
exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login!',
  successRedirect: '/',
  successFlash: 'Successfully logged in!'
});

// Log user out
exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out');
  res.redirect('/');
};
