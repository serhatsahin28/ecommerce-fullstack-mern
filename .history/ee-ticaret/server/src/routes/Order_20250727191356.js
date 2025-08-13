const express = require('express');
const orders = require('../models/orders');       // model import

const router = express.Router();

router.post("/orders",orderController);

module.exports = router;
