const express = require('express');

const router = express.Router();
const storeController = require('../controllers/storeController');
// const userController = require("../controllers/userController");
// const authController = require("../controllers/authController");
// const reviewController = require("../controllers/reviewController");
const { catchErrors } = require('../handlers/errorHandlers');

// Home page
router.get('/', storeController.homePage);


// Export Router
module.exports = router;

