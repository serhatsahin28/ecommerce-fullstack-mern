const express = require('express');
const userAll=require("../admin/adminUserList");
const router = express.Router();

router.get("/admin/userAll",userAll);

module.exports = router;