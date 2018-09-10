const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const orderSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: 'You must supply a user ID.',
  },
  item: {
    itemID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    itemName: String,
    grindType: String,
    bagSize: String,
    qty: Number
  },
  orderFinalized: Boolean,
  orderDate: Date,
  orderRoasted: Boolean,
  orderShipped: Boolean
});

module.exports = mongoose.model('Order', orderSchema);
