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

app.use(cors());
app.use('/', Products);
app.use('/', Home);
app.use('/', Users);
app.use('/', AdminProductList);
app.use('/', AdminHomeList);
app.use('/', Payment);
app.use('/', Order);
app.use("/mail", MailRoutes);


// Server başladığında
app.listen(5000, () => {
  console.log('Server 5000 portunda çalışıyor');
  console.log('🔍 Kayıtlı routes:');
  app._router.stack.forEach((r, i) => {
    if (r.route) {
      console.log(`${i}: ${r.route.path}`);
    } else if (r.name === 'router') {
      console.log(`${i}: Router middleware`);
      if (r.handle && r.handle.stack) {
        r.handle.stack.forEach((nested) => {
          if (nested.route) {
            console.log(`  - ${nested.route.path}`);
          }
        });
      }
    }
  });
});