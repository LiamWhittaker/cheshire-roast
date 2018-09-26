const express = require('express');

const router = express.Router();
const productController = require('../controllers/productController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const shopController = require('../controllers/shopController');
const adminController = require('../controllers/adminController');
// const reviewController = require("../controllers/reviewController");
const { catchErrors } = require('../handlers/errorHandlers');

// Home page
router.get('/', catchErrors(productController.homePage));

// Menu page
router.get('/menu', catchErrors(productController.showMenu));


// Show the add/edit products page
router.get('/admin/editProducts', 
  authController.isLoggedIn,
  catchErrors(productController.editProductsMenu)
);

// Edit specific product page
router.get('/admin/editProducts/edit/:id', 
  authController.isLoggedIn,
  catchErrors(productController.editProduct)
);

// Add new product
router.get('/admin/editProducts/new', 
  authController.isLoggedIn,
  productController.addNewProductForm
);

// Responsible for sanitizing new product data and storing it in the database
router.post('/admin/editProducts/add',
  productController.upload,
  catchErrors(productController.resize), 
  productController.sanitizeNewProduct,
  catchErrors(productController.addNewProduct)
);

// Changes the main product photo
router.post('/admin/editProducts/makeCoverPhoto',
  catchErrors(productController.makeCoverPhoto));

// Adds new photos to an existing product
router.post('/admin/editProducts/addNewPhotos',
  productController.upload,
  catchErrors(productController.resize), 
  catchErrors(productController.addNewProductPhotos)
);

// Deletes a photo
router.post('/admin/editProducts/deletePhoto',
  catchErrors(productController.deletePhoto));

// Individual coffee info page
router.get('/menu/:slug', catchErrors(productController.showProduct));


// ==================================================
// User accounts and authentication stuff
// ==================================================

// Show the registration form
router.get('/register', userController.registerForm);

// Sanitize user data and register the account in the database
router.post('/register',
  userController.sanitizeRegistration,
  userController.validateRegistration,
  catchErrors(userController.register));

// Render the login form
router.get('/login', userController.loginForm);

// Log the user in
router.post('/login', authController.login);

// Log the user out
router.get('/logout', authController.logout);

// Show the user's account page
router.get('/account', 
  authController.isLoggedIn, 
  userController.userAccount);

// Update account details
router.post('/account', 
  authController.isLoggedIn, 
  catchErrors(userController.updateUserAccount));


// ==================================================
// Checkout and basket stuff
// ==================================================

// Render the basket
router.get('/basket',
  authController.isLoggedIn,
  catchErrors(shopController.showBasket));

// Add coffee to the basket
router.post('/basket',
  authController.isLoggedIn,
  catchErrors(shopController.inStock),
  catchErrors(shopController.addToBasket));

// Delete coffee from basket
router.post('/basket/delete/:orderID',
  authController.isLoggedIn,
  catchErrors(shopController.removeFromBasket));

// Finalize order
router.post('/basket/buy',
  authController.isLoggedIn,
  catchErrors(shopController.finalizeOrder));


// ==================================================
// ADMIN
// ==================================================

// Show the admin control panel
router.get('/admin', 
  authController.isLoggedIn,
  catchErrors(adminController.showAdminPanel));

// Render the stock checker page
router.get('/stockCheck',   
  authController.isLoggedIn, 
  adminController.stockCheck);

// Restock product
router.post('/stockCheck',   
  authController.isLoggedIn, 
  catchErrors(adminController.restock));

// Show orders needing an action (roast / grind / post)
router.get('/openOrders',
  authController.isLoggedIn, 
  catchErrors(adminController.openOrders));

// Mark orders as roasted
router.post('/openOrders/roast',
  authController.isLoggedIn, 
  catchErrors(adminController.roast));


// Show orders ready for grinding and posting
router.get('/grindAndPost',
  authController.isLoggedIn,
  catchErrors(adminController.ordersToGrindAndPost));

// Show generated shipping label
router.post('/shippingLabel',
  authController.isLoggedIn,
  catchErrors(adminController.generateShippingLabel));

// Mark order as posted
router.post('/orderShipped',
  authController.isLoggedIn,
  catchErrors(adminController.orderShipped));


// Export Router
module.exports = router;
