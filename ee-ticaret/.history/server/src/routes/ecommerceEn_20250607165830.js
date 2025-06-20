const express = require('express');
const CommonEn = require('../models/ecommerceEn');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await CommonEn.findOne().lean();
    if (!data) return res.status(404).json({ message: 'No data found.' });
    res.json(data);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
