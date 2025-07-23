const express = require('express');
const { getHomeList, updateHomeList, saveHomePageData, uploadHomeImage } = require('../../controllers/admin/adminHomeController');
const upload = require('../../middleware/admin/upload');

const router = express.Router();

router.get('/admin/homeList', getHomeList);
router.put('/admin/updateHomeList', updateHomeList);
router.post('/admin/home/:id', saveHomePageData);
// Resim yükleme için ayrı route
router.post('/admin/home/:id/upload', upload.single('image'), uploadHomeImage);

module.exports = router;