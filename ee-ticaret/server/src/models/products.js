const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema({
  name: String,
  description: String,
  features: [String],
  reviews: [String]
}, { _id: false });

const productSchema = new mongoose.Schema({
  category_key: { type: String, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  image: { type: String },
  images: [String],
  translations: {
    tr: translationSchema,
    en: translationSchema
    // Diğer diller eklenecekse burada genişletilebilir
  }
}, {
  timestamps: true, // createdAt & updatedAt otomatik eklenir
  collection: 'products' // Koleksiyon adı açık şekilde belirtiliyor
});

module.exports = mongoose.model('Product', productSchema);
