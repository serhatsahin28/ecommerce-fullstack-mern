const express = require('express');
const products = require('../../models/products');
const upload = require('../../middleware/admin/upload');

const  {getProductsList,addProduct,updateProduct} = require("../../controllers/admin/adminProductController");

const router = express.Router();

router.get('/admin/productsList', getProductsList);

router.put('/admin/addProduct', upload.array('image'), addProduct);

router.put('/admin/updateProduct/:id', upload.array('image'), updateProduct);

router.put('/products/:id', updateProduct);

module.exports = router;
