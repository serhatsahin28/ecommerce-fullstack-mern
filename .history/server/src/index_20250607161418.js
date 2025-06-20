require("dotenv").config();
const express=require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const userRoutes=require("./routes/userRoutes");


const ecommerceEnRouter = './routes/ecommerceEn.js';
app.use('/api/ecommerce-en', ecommerceEnRouter);
app.use(express.json()); // JSON verileri işlemek için
app.use("/",userRoutes);



// Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});


