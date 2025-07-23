const express = require('express');
const { getHomeList, updateHomeList, saveHomePageData, uploadHomeImage,deleteItem,addHeroSlider } = require('../../controllers/admin/adminHomeController');
const upload = require('../../middleware/admin/upload');

const router = express.Router();

router.get('/admin/homeList', getHomeList);
router.put('/admin/updateHomeList', updateHomeList);
router.put('/admin/home/:id', saveHomePageData);
// Resim yükleme için ayrı route
// router.post('/admin/home/upload/:id', upload.single('image'), uploadHomeImage);
router.post('/admin/home/upload/:id', upload.single('image'), uploadHomeImage);


// Router'a yeni endpoint ekle (adminHomeList.js)
router.post('/admin/hero-slider', addHeroSlider);
router.delete('/admin/hero-slider/:index/:itemId',deleteItem);

module.exports = router;