const express = require('express');
const loginController = require('../controllers/loginController');
const registerController = require('../controllers/registerController');

const router = express.Router();
console.log("routes:");
router.post('/login',loginController);
router.post('/register',registerController);

module.exports = router;
