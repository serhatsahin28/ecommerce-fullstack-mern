// index.js (düzenlenmiş hali)
import 'dotenv/config';
import express from 'express';
import ecommerceEnRouter from './routes/ecommerceEn.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/ecommerce-en', ecommerceEnRouter);
app.use('/', userRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
