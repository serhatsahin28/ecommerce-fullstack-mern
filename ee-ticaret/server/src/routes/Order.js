const express = require('express');
const {createOrder,viewOrders} = require('../controllers/orderController');       // model import

const router = express.Router();

router.post("/orders",createOrder);
router.get('/view-orders', viewOrders);

module.exports = router;
