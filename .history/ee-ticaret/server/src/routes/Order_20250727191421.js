const express = require('express');
const orders = require('../controllers/orderController');       // model import

const router = express.Router();

router.post("/orders",orders);

module.exports = router;
