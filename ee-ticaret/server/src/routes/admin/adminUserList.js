const express = require('express');
const userAll=require("../../controllers/admin/adminUserController");
const router = express.Router();
const verifyAdmin = require('../../middleware/admin/adminMiddleware');

router.get("/admin/userAll",verifyAdmin,userAll);

module.exports = router;