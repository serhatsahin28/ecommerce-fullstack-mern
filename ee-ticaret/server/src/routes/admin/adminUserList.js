const express = require('express');
const userAll=require("../../controllers/admin/adminUserController");
const router = express.Router();

router.get("/admin/userAll",userAll);

module.exports = router;