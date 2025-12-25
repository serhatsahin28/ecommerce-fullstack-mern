const express = require('express');

const router = express.Router();

router.get("/admin/userAll",userAll);

module.exports = router;