require("dotenv").config();
const express=require("express");
const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json()); // JSON verileri işlemek için
app.use(cors()); // CORS politikalarını yönetmek için