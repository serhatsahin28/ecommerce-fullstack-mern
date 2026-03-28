// routes/mailRoutes.js
const express = require("express");
const router = express.Router();
const { sendMagicLink } = require("../controllers/mailController");

router.post("/send-magic-link", sendMagicLink);

module.exports = router;
