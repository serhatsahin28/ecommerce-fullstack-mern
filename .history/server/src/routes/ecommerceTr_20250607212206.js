const express = require('express');
const EcommerceTr = require('../models/ecommerceTr');

const router = express.Router();

router.get('/', async (_, res) => {
  try {
    const doc = await EcommerceTr.findOne().lean();
    if (!doc) return res.status(404).json({ message: 'Veri bulunamadı.' });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: 'Veritabanı hatası', error: e.message });
  }
});

module.exports = router;
