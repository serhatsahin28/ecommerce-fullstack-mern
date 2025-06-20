// index.js (ESM uyumlu)
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes.js';
import ecommerceEnRouter from './routes/ecommerceEn.js';

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI; // .env'den alınacak

// ✅ MongoDB bağlantısı
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB bağlantısı başarılı'))
.catch((err) => {
  console.error('❌ MongoDB bağlantı hatası:', err.message);
  process.exit(1); // Bağlantı yoksa sunucu açılmasın
});

app.use(express.json());
app.use('/api/ecommerce-en', ecommerceEnRouter);
app.use('/', userRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
