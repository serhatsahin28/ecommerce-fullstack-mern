const express = require('express');
const products = require('../models/users'); // model export'u da require

const router = express.Router();
const loginController =require('../controllers/loginController');
router.post('/login', loginController);

module.exports = router;
