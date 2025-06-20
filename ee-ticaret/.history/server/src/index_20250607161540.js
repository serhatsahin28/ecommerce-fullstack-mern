// index.js (ESM uyumlu)
import 'dotenv/config';
import express from 'express';
import userRoutes from './routes/userRoutes.js';
import ecommerceEnRouter from './routes/ecommerceEn.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // JSON verileri işlemek için
app.use('/api/ecommerce-en', ecommerceEnRouter);
app.use('/', userRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
