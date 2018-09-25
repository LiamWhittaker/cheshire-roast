const globalFunc = require('./globalController');
const mongoose = require('mongoose');
const slug = require('slugs');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const Product = mongoose.model('Product');


// ======================================================================
// PHOTO STUFF
// ======================================================================

// Set options for multer 
const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if(isPhoto) {
      next(null, true);
    } else {
      next({ message: 'That filetype is not allowed '}, false);
    }
  }
};

exports.upload = multer(multerOptions).array('photos', 4); // Allow a max of 4 files to be uploaded per coffee

exports.resize = async (req, res, next) => {
  // Check if there is no new file to resize
  if( !req.files ) {
    next(); //Skip
    return;
  }
  const filenames = [];
  for (var i = 0; i < req.files.length; i++) {

    const ext = req.files[i].mimetype.split('/')[1]; // Get filetype
    req.files[i].filename = `${uuid.v4()}.${ext}`; // Generate a filename 
    const photo = await jimp.read(req.files[i].buffer); // Load photo from buffer
    await photo.resize(800, jimp.AUTO); // Resize to 800px width
    await photo.write(`./public/uploads/${req.files[i].filename}`); // Save to filesytem

  }

  // Now it's resized, continue...
  next();
};

// ==================== END PHOTO STUFF ==========================


// Renders the home page
exports.homePage = async (req, res) => {
  const coffee = await globalFunc.getWeightSoldPerCoffee();
  const topSix = coffee.slice(0, 6);

  // Extract the item ids to get product info
  const itemIDs = topSix.map(a => a.coffeeID);

  const productInfoPromise = Product.find({
    '_id' : { $in: itemIDs }
  });
  const productInfo = await productInfoPromise;

  res.render('index', { title: 'Home', productInfo });
};

// Renders the menu page
exports.showMenu = async (req, res) => {
  // Get a list of all products and total number of products in DB.
  const productsPromise = Product.find();
  const countPromise = Product.count();

  const [products, count] = await Promise.all([productsPromise, countPromise]);

  res.render('menu', { title: 'Our Menu', products, count });
};

// Show the add/edit products page
exports.editProductsMenu = async (req, res) => {
  // Get a list of all products
  const productsPromise = Product.find();
  const products = await productsPromise;

  res.render('editProducts', {title: 'Add/Edit Products', products});
}

// Show the edit products page
exports.editProduct = async (req, res) => {
  // Get the product we want top edit
  const productPromise = Product.findById({ _id: req.params.id });
  const product = await productPromise;

  res.render('addNewProduct', { title: 'Edit Product', product });
};

// Renders the 'Add new product form'
exports.addNewProductForm = (req, res) => {
  res.render('addNewProduct', { title: 'Add New Product' });
};


// Middleware for sanitizing form input before we try and save it to the database
exports.sanitizeNewProduct = (req, res, next) => {
  // Split the 'tags' input into individual strings
  req.body.flavourTags = req.body.flavourTags.split(' ');

  next();
};

// Responsible for saving new products and edits to the database
exports.addNewProduct = async (req, res) => {
  // If there is an ID, we know it's an update to an existing product
  if(req.body.coffeeID) {
    const productToUpdate = Product.findByIdAndUpdate({_id: req.body.coffeeID}, req.body, {
      runValidators: true // Make sure data still conforms to schema
    }).exec();
    return res.redirect('/admin/editProducts');
  } else {
    // If there isn't an ID, we know it's a new product.

    // Generate Slug
    req.body.slug = slug(req.body.name);
    
    // Add the uploaded photos 
    let photos = req.files.map(a => a.filename);
    req.body.photos = photos;


    const product = await (new Product(req.body)).save();    
    return res.redirect(`/menu/${product.slug}`);
  }
};

exports.makeCoverPhoto = async (req, res) => {
  const product = await Product.findOne({ _id: req.body.productID });
  
  // If the photo is already the cover photo, do nothing
  if (req.body.itemToMakeCover == 0) {
    req.flash('error', 'This is already the cover photo!');
    return res.redirect(`/admin/editProducts/edit/${req.body.productID}`);
  }

  [
    product.photos[0], 
    product.photos[req.body.itemToMakeCover]
  ] = 
  [
    product.photos[req.body.itemToMakeCover], 
    product.photos[0]
  ];

  const productToUpdate = Product.findByIdAndUpdate({_id: product._id}, product, {
    runValidators: true // Make sure data still conforms to schema
  }).exec();

  req.flash('success', 'Updated the cover photo!');

  return res.redirect(`/admin/editProducts/edit/${product._id}`);

};

exports.addNewProductPhotos = async (req, res) => {
  // 1. Get product from db
  const product = await Product.findOne({ _id: req.body.productID });

  // 2. Can we add more photos? (max 4)
  if(product.photos.length === 4) {
    req.flash('error', 'This product already has the maximum amount of photos.');
    return res.redirect(`/admin/editProducts/edit/${product._id}`);
  }

  const freeSlots = (4 - product.photos.length);
  if(req.files.length > freeSlots) {
    req.flash('error', `You are trying to add ${req.files.length} photos, but there are only ${freeSlots} slots available.`);
    return res.redirect(`/admin/editProducts/edit/${product._id}`);
  }

  // 3. Add photos
  let photos = req.files.map(a => a.filename);
  photos.forEach(photo => {
    product.photos.push(photo);
  });

  const productToUpdate = Product.findByIdAndUpdate({_id: product._id}, product, {
    runValidators: true // Make sure data still conforms to schema
  }).exec();

  req.flash('success', 'Successfully uploaded new photos!');

  return res.redirect(`/admin/editProducts/edit/${product._id}`);
};

exports.deletePhoto = async (req, res) => {
  const product = await Product.findOne({ _id: req.body.productID });
  
  product.photos.splice(req.body.itemToDelete, 1);

  const productToUpdate = Product.findByIdAndUpdate({_id: product._id}, product, {
    runValidators: true // Make sure data still conforms to schema
  }).exec();

  req.flash('success', 'Photo deleted.');

  return res.redirect(`/admin/editProducts/edit/${product._id}`);
};

// Renders a specific coffee page
exports.showProduct = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  res.render('coffee', { product, title: product.name });
};
