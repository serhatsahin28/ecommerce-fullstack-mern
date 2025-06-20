const express = require('express');
const products = require('../models/users'); // model export'u da require

const router = express.Router();

router.get('/users', async (req, res) => {
  try {
    const data = await products.find().lean();
    if (!data) return res.status(404).json({ message: 'No data found.' });
    res.json(data);
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
