const express = require('express');
const { getHomeList, updateHomeList, saveHomePageData, uploadHomeImage,deleteItem,addHeroSlider } = require('../../controllers/admin/adminHomeController');
const upload = require('../../middleware/admin/upload');
const verifyAdmin = require('../../middleware/admin/adminMiddleware');

const router = express.Router();

router.get('/admin/homeList',getHomeList);
router.put('/admin/updateHomeList',verifyAdmin, updateHomeList);
router.put('/admin/home/:id', verifyAdmin,saveHomePageData);
// Resim yükleme için ayrı route
// router.post('/admin/home/upload/:id', upload.single('image'), uploadHomeImage);
router.post('/admin/home/upload-image',verifyAdmin,upload.single('image'), uploadHomeImage); // YENİ HALİ

// Router'a yeni endpoint ekle (adminHomeList.js)
router.post('/admin/hero-slider',verifyAdmin,addHeroSlider);
router.delete('/admin/hero-slider/:index/:itemId',verifyAdmin,deleteItem);

module.exports = router;