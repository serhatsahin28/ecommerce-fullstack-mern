const express = require('express');
const {createOrder} = require('../controllers/orderController');       // model import

const router = express.Router();

router.post("/orders",createOrder);
router.get('/view', viewOrders);

module.exports = router;
