import express from 'express';
import EcommerceEn from '../models/ecommerceEn.js'; // model dosyan doğruysa

const router = express.Router();

// GET /api/ecommerce-en
router.get('/', async (req, res) => {
  try {
    const ecommerceData = await EcommerceEn.findOne().lean(); // ilk belgeyi al
    if (!ecommerceData) return res.status(404).json({ message: 'No data found.' });

    res.json(ecommerceData);
  } catch (error) {
    console.error('Error fetching ecommerceEn:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

export default router;
