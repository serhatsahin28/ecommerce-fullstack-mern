const express = require('express');
const products = require('../../models/products');
const upload = require('../middlewares/upload');

const  {getProductsList,updateProduct} = require("../../controllers/admin/adminProductController");

const router = express.Router();

router.get('/admin/productsList', getProductsList);
router.put('/admin/updateProduct/:id', updateProduct);

router.put('/products/:id', upload.single('image'), updateProduct);
module.exports = router;
