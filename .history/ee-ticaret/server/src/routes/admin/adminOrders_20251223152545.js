const express = require('express');
const {OrdersAll,OrdersStatusUpdate} = require('../../controllers/admin/adminOrderController');       // model import

const router = express.Router();

router.get("/admin/ordersAll", OrdersAll);
router.put("/admin/OrdersStatusUpdate", OrdersStatusUpdate);
router.put("/admin/OrdersCancelRequest", OrdersCancelRequest);

module.exports = router;
