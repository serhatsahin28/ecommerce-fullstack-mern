const Iyzipay = require("iyzipay");

const iyzipay = new Iyzipay({
  apiKey: process.env.IYZI_API_KEY,
  secretKey: process.env.IYZI_SECRET_KEY,
  uri: "sandbox-api.iyzipay.com" // PROD için değişecek
});

module.exports = iyzipay;
