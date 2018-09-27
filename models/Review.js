const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const reviewSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: 'You must supply a user ID.',
  },
  itemID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  review: {
    reviewDate: Date,
    reviewTitle: String,
    reviewBody: String,
    reviewScore: {
      type: Number,
      min: 1,
      max: 5
    }
  }
});

module.exports = mongoose.model('Review', reviewSchema);
