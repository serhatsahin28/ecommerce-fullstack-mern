require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Products = require('./routes/Products');
const Home = require('./routes/Home');
const Users = require('./routes/Users');
const AdminProductList = require('./routes/admin/adminProductsList');
const AdminHomeList = require('./routes/admin/adminHomeList');
const Payment = require('./routes/Payment');
const Order = require('./routes/Order');
const MailRoutes = require("./routes/MailRoutes");
const UsersAllAdmin = require('./routes/admin/adminUserList');
const OrdersAllAdmin = require('./routes/admin/adminOrders');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;



mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(cors());

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://ecommerce-fullstack-mern-qiyl.vercel.app',
      'http://localhost:5173' // Yerelde çalışırken lazım olur
    ];

    // Eğer gelen istek izin verilen listedeyse VEYA .vercel.app ile bitiyorsa izin ver
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Tüm yakalanmamış hataları logla
process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception:', err);
  process.exit(1); // süreci durdur, Render bunu status 1 olarak görecek
});

// Promise reddedilmelerini logla
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

app.use('/', Products);
app.use('/', Home);
app.use('/', Users);
app.use('/', AdminProductList);
app.use('/', AdminHomeList);
app.use('/', Payment);
app.use('/', Order);
app.use("/mail", MailRoutes);
app.use("/", UsersAllAdmin);
app.use("/", OrdersAllAdmin);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
