// routes/ecommerceEn.js
import express from 'express';
import CommonEn from '../models/ecommerceEn.js'; // ✅ doğru model adı

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const ecommerceData = await CommonEn.findOne(); // ✅ CommonEn olarak kullan
    if (!ecommerceData) {
      return res.status(404).json({ message: 'No data foundRoutesss.' });
    }
    res.json(ecommerceData);
  } catch (error) {
    console.error('Error fetching commonEn:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

export default router;
