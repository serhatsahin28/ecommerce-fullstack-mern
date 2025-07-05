const express = require('express');
const products = require('../../models/products');
const upload = require('../../middleware/admin/upload');

const  {getProductsList,updateProduct} = require("../../controllers/admin/adminProductController");

const router = express.Router();

router.get('/admin/productsList', getProductsList);


router.put('/admin/updateProduct/:id', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]), updateProduct);

router.put('/products/:id', updateProduct);

module.exports = router;
