const express = require('express');
const loginController = require('../controllers/loginController');
const registerController = require('../controllers/registerController');
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');
const updateProfileController = require('../controllers/updateProfileController');
const updateUserForm = require('../controllers/updateUserForm');

const router = express.Router();
console.log("routes:");
router.post('/register',registerController);
router.post('/login',loginController);
router.get('/profile',authMiddleware,profileController);
router.put('/profile/update',authMiddleware,updateProfileController);
router.put('/update-info',authMiddleware,updateUserForm);
module.exports = router;
