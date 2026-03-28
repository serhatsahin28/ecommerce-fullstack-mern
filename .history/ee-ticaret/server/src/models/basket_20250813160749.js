const mongoose = require('mongoose');

const basketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, default: 1 },
      price: Number, // eklemek iyi olur, ürün fiyatı değişirse eski fiyat kaybolmaz
    }
  ],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Basket', basketSchema);
