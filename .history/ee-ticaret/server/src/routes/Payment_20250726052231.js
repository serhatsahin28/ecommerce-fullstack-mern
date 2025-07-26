const express = require('express');
const router = express.Router();
const iyzico = require('../services/iyzico');

router.post('/initialize', async (req, res) => {
  try {
    const checkoutForm = await iyzico.createCheckoutForm(req.body);
    res.json({ htmlContent: checkoutForm.checkoutFormContent });
  } catch (error) {
    console.error('Ödeme başlatma hatası:', error.message);
    res.status(500).json({ message: error.message || 'Ödeme başlatılamadı.' });
  }
});

router.post('/pay', async (req, res) => {


});


module.exports = router;
