import express from 'express';
import EcommerceEn from '../models/ecommerceEn.js'; // model dosyan doğruysa

const router = express.Router();

// GET /api/ecommerce-en
router.get('/', async (req, res) => {
  const data = await CommonEn.findOne().lean();
  if (!data) return res.status(404).json({ message: 'Veri bulunamadı' });
  res.json(data);
});

export default router;
