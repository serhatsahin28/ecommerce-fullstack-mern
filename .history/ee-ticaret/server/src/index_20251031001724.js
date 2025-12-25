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
const UsersAllAdmin=require('./routes/admin/adminUserList');

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
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use('/', Products);
app.use('/', Home);
app.use('/', Users);
app.use('/', AdminProductList);
app.use('/', AdminHomeList);
app.use('/', Payment);
app.use('/', Order);
app.use("/mail", MailRoutes);


app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
