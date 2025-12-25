const express = require('express');
const {OrdersAll,OrdersStatusUpdate,OrdersCancelRequest,OrdersCancelApprove} = require('../../controllers/admin/adminOrderController');       // model import

const router = express.Router();

router.get("/admin/ordersAll", OrdersAll);
router.put("/admin/OrdersStatusUpdate", OrdersStatusUpdate);
router.post("/admin/OrdersCancelRequest", OrdersCancelRequest);
router.post("/admin/OrdersCancelApprove", approveCancelOrder );

module.exports = router;
