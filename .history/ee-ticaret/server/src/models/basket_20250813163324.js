// models/Basket.js
import mongoose from "mongoose";

const basketItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  name: {
    tr: { type: String, required: true },
    en: { type: String, required: true }
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  image: { // ürüne ait görsel URL'si
    type: String
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const basketSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true // her kullanıcıya 1 sepet
  },
  items: [basketItemSchema],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Basket", basketSchema);
