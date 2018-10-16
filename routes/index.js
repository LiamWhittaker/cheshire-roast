const express = require('express');

const router = express.Router();
const productController = require('../controllers/productController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const shopController = require('../controllers/shopController');
const adminController = require('../controllers/adminController');
const reviewController = require('../controllers/reviewController');
const globalController = require('../controllers/globalController');
const { catchErrors } = require('../handlers/errorHandlers');

// Home page
router.get('/', catchErrors(productController.homePage));

// Menu page
router.get('/menu', catchErrors(productController.showMenu));

// About us page
router.get('/about', globalController.aboutUs);

// Contact page
router.get('/contact', globalController.contact);


// Show the add/edit products page
router.get('/admin/editProducts', 
  authController.isLoggedIn,
  authController.isAdmin,
  catchErrors(productController.editProductsMenu)
);

// Edit specific product page
router.get('/admin/editProducts/edit/:id', 
  authController.isLoggedIn,
  authController.isAdmin,
  catchErrors(productController.editProduct)
);

// Delete a product
router.get('/admin/editProducts/delete/:id', 
  authController.isLoggedIn,
  authController.isAdmin,
  catchErrors(productController.deleteProduct)
);

// Add new product
router.get('/admin/editProducts/new', 
  authController.isLoggedIn,
  authController.isAdmin,
  productController.addNewProductForm
);

// Responsible for sanitizing new product data and storing it in the database
router.post('/admin/editProducts/add',
  authController.isLoggedIn,
  authController.isAdmin,
  productController.upload,
  catchErrors(productController.resize), 
  productController.sanitizeNewProduct,
  catchErrors(productController.addNewProduct)
);

// Changes the main product photo
router.post('/admin/editProducts/makeCoverPhoto',
  authController.isLoggedIn,
  authController.isAdmin,
  catchErrors(productController.makeCoverPhoto));

// Adds new photos to an existing product
router.post('/admin/editProducts/addNewPhotos',
  authController.isLoggedIn,
  authController.isAdmin,
  productController.upload,
  catchErrors(productController.resize), 
  catchErrors(productController.addNewProductPhotos)
);

// Deletes a photo
router.post('/admin/editProducts/deletePhoto',
  authController.isLoggedIn,
  authController.isAdmin,
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
  userController.updateUserAccount);


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
// SUBSCRIPTIONS
// ==================================================
router.get('/subscription',
  shopController.subscription);

router.post('/subscription',
  authController.isLoggedIn,
  shopController.confirmSubscription
)

// ==================================================
// Reviews
// ==================================================

// Render 'add a new review' page
router.get('/menu/:slug/review',
  authController.isLoggedIn,
  catchErrors(reviewController.verifyPurchase),
  reviewController.showReviewForm
  );

// Add new review to database
router.post('/menu/:slug/review',
  authController.isLoggedIn,
  catchErrors(reviewController.verifyPurchase),
  catchErrors(reviewController.postNewReview)
  );


// ==================================================
// ADMIN
// ==================================================

// Show the admin control panel
router.get('/admin', 
  authController.isLoggedIn,
  authController.isAdmin,
  catchErrors(adminController.showAdminPanel));

// Render the stock checker page
router.get('/stockCheck',   
  authController.isLoggedIn, 
  authController.isAdmin,
  adminController.stockCheck);

// Restock product
router.post('/stockCheck',   
  authController.isLoggedIn, 
  authController.isAdmin,
  catchErrors(adminController.restock));

// Show orders needing an action (roast / grind / post)
router.get('/openOrders',
  authController.isLoggedIn, 
  authController.isAdmin,
  catchErrors(adminController.openOrders));

// Mark orders as roasted
router.post('/openOrders/roast',
  authController.isLoggedIn, 
  authController.isAdmin,
  catchErrors(adminController.roast));


// Show orders ready for grinding and posting
router.get('/grindAndPost',
  authController.isLoggedIn,
  authController.isAdmin,
  catchErrors(adminController.ordersToGrindAndPost));

// Show generated shipping label
router.post('/shippingLabel',
  authController.isLoggedIn,
  authController.isAdmin,
  catchErrors(adminController.generateShippingLabel));

// Mark order as posted
router.post('/orderShipped',
  authController.isLoggedIn,
  authController.isAdmin,
  catchErrors(adminController.orderShipped));


// Export Router
module.exports = router;
