const mongoose = require('mongoose');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = (new JSDOM('')).window;
const DOMPurify = createDOMPurify(window);

const Product = mongoose.model('Product');
const User = mongoose.model('User');
const Order = mongoose.model('Order');
const Review = mongoose.model('Review');


// Middleware for checking if the user has purchased the item they are trying to review
exports.verifyPurchase = async (req, res, next) => {
  // Get the product
  const product = await Product.findOne({slug: req.params.slug});

  // Check if the user has ordered it
  const checkForOrders = await Order.find({
    'item.itemID': product._id,
    userID: req.user._id,
    orderFinalized: true
  });

  // If they haven't, throw an error
  if(checkForOrders.length < 1) {
    req.flash('error', `You haven't purchased this item so you can't review it yet!`);
    return res.redirect(`/menu/${req.params.slug}`);
  };

  // Also, we need to check if the user has already reviewed the product
  const alreadyReviewed = await Review.find({
    itemID: product._id,
    userID: req.user._id
  });

  if(alreadyReviewed.length > 0) {
    req.flash('error', `You have already reviewed this product!`);
    return res.redirect(`/menu/${req.params.slug}`);
  }

  // If all is ok, pass the product along to the review form
  res.locals.product = product;
  next()
};

// Render the 'add new review' form
exports.showReviewForm = (req, res) => {
  res.render('review', {title: 'New Review', product: res.locals.product});
};

// Add a new review to the database
exports.postNewReview = async (req, res) => {
  req.body.userID = req.user._id;
  req.body.review.reviewDate = new Date;
  req.body.review.reviewTitle = DOMPurify.sanitize(req.body.review.reviewTitle)
  req.body.review.reviewBody = DOMPurify.sanitize(req.body.review.reviewBody)

  const newReview = await (new Review(req.body)).save();

  req.flash('success', `Thanks for the review!`);
  return res.redirect(`/menu/${req.params.slug}`);
};
