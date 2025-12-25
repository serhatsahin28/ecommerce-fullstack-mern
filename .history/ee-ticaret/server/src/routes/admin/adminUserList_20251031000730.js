const express = require('express');
const userAll=require();
const router = express.Router();

router.get("/admin/userAll",userAll);

module.exports = router;