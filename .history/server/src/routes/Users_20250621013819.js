const express = require('express');
const loginController = require('../controllers/loginController');
const registerController = require('../controllers/registerController');
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');
const updateProfileController = require('../controllers/updateProfileController');

const router = express.Router();
console.log("routes:");
router.post('/register',registerController);
router.post('/login',loginController);
router.get('/profile',authMiddleware,profileController);
router.get('/updateProfile',authMiddleware,updateProfileController);

module.exports = router;
