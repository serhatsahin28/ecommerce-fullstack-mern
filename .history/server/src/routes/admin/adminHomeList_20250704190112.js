const express = require('express');
const products = require('../../models/products');
const {getHomeList}=require('../../controllers/admin/adminHomeController');

const router = express.Router();

router.get('/admin/homeList', getHomeList);


module.exports = router;
