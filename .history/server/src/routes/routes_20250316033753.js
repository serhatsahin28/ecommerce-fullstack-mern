const express=require("express");

const app = express();
const PORT = process.env.PORT || 5000;
const router = express.Router();
router.get("/",(req,res)=>{
res.end("iiiii");

});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});