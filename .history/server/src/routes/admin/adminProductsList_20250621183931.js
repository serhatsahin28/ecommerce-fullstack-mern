const express = require('express');
const products = require('../../models/products');

const router = express.Router();

router.get('/admin/productsList', async (req, res) => {
  try {
    const data = await products.find().lean();
    if (!data) return res.status(404).json({ message: 'No data found.' });
    res.json(data);
    console.log(data);
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
