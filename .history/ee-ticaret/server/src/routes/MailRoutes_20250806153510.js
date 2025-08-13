const express = require('express');
const router = express.Router();

// Controller'dan ilgili fonksiyonu import et
const { sendOrderLink } = require('../controllers/mailController');

// POST isteği için rotayı tanımla
// URL: /api/mail/send-order-link (ana server.js'deki kullanıma göre)
router.post('/send-order-link', sendOrderLink);

// Router'ı dışa aktar
module.exports = router;