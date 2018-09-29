const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

mongoose.Promise = global.Promise;

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'You must supply a product name.',
  },
  slug: String,
  shortDescription: {
    type: String,
    trim: true,
    required: 'Please provide a short description to be displayed on the coffee card',
  },
  longDescription: {
    type: String,
    trim: true,
    required: 'Please provide a detailed description to be displayed on the coffee information page',
  },
  location: {
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: [
      {
        type: Number,
        required: 'You must supply coordinates!',
      },
    ],
    country: {
      type: String,
      required: 'You must provide a country',
    },
    region: {
      type: String,
      required: 'You must provide a region',
    },
    altitude: {
      type: Number,
      required: 'You must provide an altitude',
    },
  },
  coffeeType: {
    type: String,
    required: 'You must provide a coffee type - microlot, blend etc',
  },
  flavourTags: [String],
  roastLevel: {
    type: String,
    required: 'You must provide a Roast level',
  },
  varietal: {
    type: String,
    required: 'You must provide a varietal',
  },
  washingProcess: {
    type: String,
    required: 'You must provide a washing process',
  },
  photos: [String],
  price: {
    smallBag: {
      type: Number,
      required: 'You must provide a price!',
    },
    largeBag: {
      type: Number,
      required: 'You must provide a price!',
    },
  },
  stockInGrams: Number
});

module.exports = mongoose.model('Product', productSchema);
