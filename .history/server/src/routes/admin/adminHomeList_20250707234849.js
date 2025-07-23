const express = require('express');
const { getHomeList, updateHomeList, saveHomePageData } = require('../../controllers/admin/adminHomeController');
const home = require('../../middleware/admin/upload');

const router = express.Router();

router.get('/admin/homeList', getHomeList);
router.put('/admin/updateHomeList', updateHomeList);
router.put('/admin/home/:id', upload.single('image'), saveHomePageData);



module.exports = router;
