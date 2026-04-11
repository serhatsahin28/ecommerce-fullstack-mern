const express = require('express');
const {OrdersAll,OrdersStatusUpdate,OrdersCancelRequest,OrdersCancelApprove} = require('../../controllers/admin/adminOrderController');       // model import
const verifyAdmin = require('../../middleware/admin/adminMiddleware');

const router = express.Router();

router.get("/admin/ordersAll", verifyAdmin,OrdersAll);
router.put("/admin/OrdersStatusUpdate",verifyAdmin, OrdersStatusUpdate);
router.post("/admin/OrdersCancelRequest",verifyAdmin, OrdersCancelRequest);
router.post("/admin/OrdersCancelApprove", verifyAdmin,OrdersCancelApprove );

module.exports = router;
