const express = require('express');
const products = require('../../models/products');


const router = express.Router();

router.get('/admin/productsList', getProductsList);


module.exports = router;
