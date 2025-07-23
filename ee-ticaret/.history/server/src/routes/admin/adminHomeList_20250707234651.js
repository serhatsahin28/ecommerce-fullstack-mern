const express = require('express');
const { getHomeList,updateHomeList,saveHomePageData } = require('../../controllers/admin/adminHomeController');

const router = express.Router();

router.get('/admin/homeList', getHomeList);
router.put('/admin/updateHomeList', updateHomeList);
router.put('/admin/home/:id',saveHomePageData);



module.exports = router;
