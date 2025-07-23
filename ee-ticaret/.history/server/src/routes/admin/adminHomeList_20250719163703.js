const express = require('express');
const { getHomeList, updateHomeList, saveHomePageData, uploadHomeImage,deleteItem,addHeroSlide} = require('../../controllers/admin/adminHomeController');
const upload = require('../../middleware/admin/upload');

const router = express.Router();

router.get('/admin/homeList', getHomeList);
router.put('/admin/updateHomeList', updateHomeList);
router.put('/admin/home/:id', saveHomePageData);
// Resim yükleme için ayrı route
router.post('/admin/home/:id/upload', upload.single('image'), uploadHomeImage);

router.delete('/admin/hero-slider/:index/:itemId',deleteItem);

module.exports = router;