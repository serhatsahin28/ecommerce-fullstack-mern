const express = require('express');
const products = require('../../models/products');
const  getProductsList  = require("../../controllers/admin/adminProductController");

const router = express.Router();

router.get('/productsList', getProductsList);

module.exports = router;
