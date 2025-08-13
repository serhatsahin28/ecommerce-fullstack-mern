const express = require('express');
const home = require('../models/home');       // model import
const products = require('../models/products'); // model import

const router = express.Router();

router.get('/home', async (req, res) => {
  try {
    const homeData = await home.find().lean();
    const productData = await products.find().lean();

    if (!homeData || !productData) {
      return res.status(404).json({ message: 'No data found.' });
    }

    res.json({
      home: homeData,
      products: productData
    });
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
