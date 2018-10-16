const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

mongoose.Promise = global.Promise;

const subscriptionSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: 'You must supply a user ID.',
  },
  coffeeType: String,
  grindType: String,
  bagSize: String,
  deliveryInterval: Number,
  startDate: Date,
  nextDelivery: Date,
  history: [
    {
      coffeeID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      deliveryDate: Date
    }
  ]
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
