const express = require('express');
const products = require('../../models/products');
const  {getProductsList,updateProduct} = require("../../controllers/admin/adminProductController");

const router = express.Router();

router.get('/admin/productsList', getProductsList);
router.get('/admin/updateProduct', getProductsList);

module.exports = router;
