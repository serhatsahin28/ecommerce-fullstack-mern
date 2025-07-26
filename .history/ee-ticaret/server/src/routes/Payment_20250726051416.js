const express = require('express');
const router = express.Router();
const iyzico = require('../services/iyzico'); // API fonksiyonları burada olacak

router.post('/payment/initialize', async (req, res) => {
  try {
    const checkoutForm = await iyzico.createCheckoutForm(req.body);
    res.json({ htmlContent: checkoutForm.checkoutFormContent });
  } catch (err) {
    res.status(500).json({ message: 'Ödeme başlatılamadı.' });
  }
});

module.exports = router;
