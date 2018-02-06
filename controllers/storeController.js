const mongoose = require('mongoose');
// const Store = mongoose.model("Store");
// const User = mongoose.model("User");
// const multer = require("multer");
// const jimp = require("jimp");
// const uuid = require("uuid");

// const multerOptions = {
//   storage: multer.memoryStorage(),
//   fileFilter(req, file, next) {
//     const isPhoto = file.mimetype.startsWith("image/");
//     if (isPhoto) {
//       next(null, true);
//     } else {
//       next({ message: "That filetype is not allowed " }, false);
//     }
//   }
// };

exports.homePage = (req, res) => {
  res.render('index', { title: 'Home' });
};
