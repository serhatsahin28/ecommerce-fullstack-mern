const express = require("express");
const router = express.Router();
const app = express();
const adminController = require("../../controllers/admin/adminAuthController");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

router.post("/admin/login", adminController);

module.exports = router;