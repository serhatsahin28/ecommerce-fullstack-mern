const express = require('express');
const { getHomeList,updateHomeList } = require('../../controllers/admin/adminHomeController');

const router = express.Router();

router.get('/admin/homeList', getHomeList);
router.put('/admin/updateHomeList', updateHomeList);


module.exports = router;
