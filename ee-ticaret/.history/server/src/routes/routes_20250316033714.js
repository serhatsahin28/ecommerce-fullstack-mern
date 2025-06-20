const express=require("express");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const router = express.Router();
router.get("/",(req,res)=>{
res.end("iiiii");

});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});