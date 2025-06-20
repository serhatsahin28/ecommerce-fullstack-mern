const express = require('express');
const loginController = require('../controllers/loginController');

const router = express.Router();
console.log("routes:");
router.get('/login',loginController);

module.exports = router;
