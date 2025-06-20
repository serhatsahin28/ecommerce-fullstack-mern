import express from 'express';
import EcommerceEn from '../models/ecommerceEn.js';

const router = express.Router();

/*  GET  /api/ecommerce-en  ► tek konfig döner          */
router.get('/', async (_, res) => {
  try {
    const doc = await EcommerceEn.findOne().lean();
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: 'DB error', error: e.message });
  }
});

export default router;
