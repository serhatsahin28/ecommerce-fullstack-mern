const express=require("express");

const PORT = process.env.PORT || 5000;
const router = express.Router();
router.get("/",(req,res)=>{
res.end("iiiii");

});

