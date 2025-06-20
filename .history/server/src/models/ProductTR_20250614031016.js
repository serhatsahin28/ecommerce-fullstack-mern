const mongoose = require('mongoose');

const productTRSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category_key: String,
  image: String,
  features: [String],
  rating: Number,
  reviews: [String],
  images: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('ProductTR', productTRSchema);
