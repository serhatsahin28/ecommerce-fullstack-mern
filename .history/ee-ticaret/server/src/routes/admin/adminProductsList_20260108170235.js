const express = require('express');
const products = require('../../models/products');
const upload = require('../../middleware/admin/upload');

const { getProductsList, addProduct, updateProduct, deleteProduct } = require("../../controllers/admin/adminProductController");

const router = express.Router();

router.get('/admin/productsList', getProductsList);

// router.post('/admin/addProduct', upload.fields([
//   { name: 'mainImage', maxCount: 1 },
//   { name: 'images', maxCount: 10 }
// ]), addProduct);

// Eski upload.fields yapısını sil ve bunu kullan:
router.post('/admin/addProduct', upload.any(), addProduct);

// router.put('/admin/updateProduct/:id', upload.array('image'), updateProduct);
router.put('/updateProduct/:id', upload.any(), productController.updateProduct);


router.put('/products/:id', updateProduct);


router.delete('/admin/productsDelete/:id', deleteProduct);

module.exports = router;
