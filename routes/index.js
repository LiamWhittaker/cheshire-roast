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
router.get('/', productController.homePage);

// Menu page
router.get('/menu', catchErrors(productController.showMenu));

// Add new product page
router.get('/menu/add', productController.addNewProductForm);

// Responsible for sanitizing new product data and storing it in the database
router.post('/menu/add',
  productController.sanitizeNewProduct,
  catchErrors(productController.addNewProduct)
);

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
  adminController.showAdminPanel);

// Render the stock checker page
router.get('/stockCheck',   
  authController.isLoggedIn, 
  adminController.stockCheck);

// Restock product
router.post('/stockCheck',   
  authController.isLoggedIn, 
  catchErrors(adminController.restock));

router.get('/openOrders',
  authController.isLoggedIn, 
  catchErrors(adminController.openOrders));

// Export Router
module.exports = router;
