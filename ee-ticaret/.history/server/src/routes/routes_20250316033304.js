const express=require("express");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.get("/",(req,res)=>{
res.end("routes çalışıyor...");

});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});