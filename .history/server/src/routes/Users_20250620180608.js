const express = require('express');
const products = require('../models/users'); // model export'u da require
const loginController = require('../controllers/loginController');

const router = express.Router();
router.post('/login', loginController);

module.exports = router;
