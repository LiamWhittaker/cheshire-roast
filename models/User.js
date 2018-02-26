const mongoose = require('mongoose');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

mongoose.Promise = global.Promise;

const userSchema = new mongoose.Schema({
  type: {
    type: String
  },
  firstName: {
    type: String,
    required: 'Please supply a first name',
    trim: true
  },
  secondName: {
    type: String,
    required: 'Please supply a surname',
    trim: true
  },
  address: {
    lineOne: {
      type: String,
      required: 'Please enter the first line of your address',
    },
    townCity: {
      type: String,
      required: 'Please enter a town or city',
    },
    county: {
      type: String,
      required: 'Please enter a county',
    },
    postcode: {
      type: String,
      required: 'Please enter a valid UK postcode',
    }
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid Email Address'],
    required: 'Please supply an email address'
  },
  accessLevel: {
    type: Number,
    required: 'You need an access level..',
    default: 10 // Regular users have access level 10, site owners will have level 20 to allow for future addition of intermediate access levels (15) like moderators etc
  }
});


// Add all pasportLocalMongoose methods to user schema and set
// email to be the account username
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

// Fix MongoDB's ugly error messages
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);
