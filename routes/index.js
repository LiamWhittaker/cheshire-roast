const express = require('express');

const router = express.Router();
const productController = require('../controllers/productController');
// const userController = require("../controllers/userController");
// const authController = require("../controllers/authController");
// const reviewController = require("../controllers/reviewController");
const { catchErrors } = require('../handlers/errorHandlers');

// Home page
router.get('/', productController.homePage);

// Menu page
router.get('/menu', catchErrors(productController.showMenu));

// Add new product page
router.get('/menu/add', productController.addNewProductForm);

router.post(
'/menu/add',
  productController.sanitizeNewProduct,
  catchErrors(productController.addNewProduct)
);

router.get('/menu/:slug', catchErrors(productController.showProduct));


// Export Router
module.exports = router;

