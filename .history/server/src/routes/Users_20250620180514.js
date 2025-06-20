const express = require('express');
const products = require('../models/users'); // model export'u da require

const router = express.Router();
const loginController ='../controllers/loginController.js';
router.post('/login', loginController);

module.exports = router;
