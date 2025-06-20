const express = require('express');
const EcommerceEn = require('../models/ecommerceEn');

const router = express.Router();

/*  GET  /api/ecommerce-en  ► tek konfig döner */
router.get('/', async (_, res) => {
  try {
    const doc = await EcommerceEn.findOne().lean();
    if (!doc) {
      return res.status(404).json({ message: 'No data found' });
    }
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: 'DB error', error: e.message });
  }
});

module.exports = router;
