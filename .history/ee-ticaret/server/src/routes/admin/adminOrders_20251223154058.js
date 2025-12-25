const express = require('express');
const {OrdersAll,OrdersStatusUpdate,OrdersCancelRequest} = require('../../controllers/admin/adminOrderController');       // model import

const router = express.Router();

router.get("/admin/ordersAll", OrdersAll);
router.put("/admin/OrdersStatusUpdate", OrdersStatusUpdate);

module.exports = router;
