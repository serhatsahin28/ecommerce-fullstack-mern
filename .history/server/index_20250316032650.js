require("dotenv").config();
const express=require("express");
const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json()); // JSON verileri işlemek için
app.use(cors()); // CORS politikalarını yönetmek için



app.get("/", (req, res) => {
    res.send("API is running...");
});

// Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});


