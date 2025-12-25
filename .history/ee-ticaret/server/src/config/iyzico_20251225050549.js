const Iyzipay = require("iyzipay");

const iyzipay = new Iyzipay({
  apiKey: process.env.IYZI_API_KEY,
  secretKey: process.env.IYZICO_SECRET_KEY,
  uri: "https://sandbox-api.iyzipay.com" // PROD için değişecek
});

module.exports = iyzipay;
