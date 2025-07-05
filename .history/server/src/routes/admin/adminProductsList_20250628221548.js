const express = require('express');
const products = require('../../models/products');
const upload = require('../../middleware/admin/upload');

const  {getProductsList,updateProduct,updateProductImg} = require("../../controllers/admin/adminProductController");

const router = express.Router();

router.get('/admin/productsList', getProductsList);


router.put('/admin/updateProduct/:id', upload.single('image'), updateProductImg);

router.put('/products/:id', updateProduct);

module.exports = router;
