const express = require('express');
const { getHomeList } = require('../../controllers/admin/adminHomeController');

const router = express.Router();

router.get('/admin/homeList', getHomeList);


module.exports = router;
