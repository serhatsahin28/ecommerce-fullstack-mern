const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    default: null // Null for guest users
  },
  email: {
    type: String,
    required: true
  },
  firstName: String,
  lastName: String,
  phone: String,

  cart: [
    {
      product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
      name: String,
      category: String,
      price: Number,
      quantity: Number
    }
  ],

  totalAmount: {
    type: Number,
    required: true
  },

  shippingInfo: {
    address: String,
    city: String,
    district: String,
    postalCode: String,
    notes: String
  },

  payment: {
    method: String, // e.g., 'iyzico', 'bank_transfer'
    status: { type: String, enum: ['success', 'pending', 'failed'], default: 'pending' },
    iyzicoReference: String,
    date: { type: Date, default: Date.now }
  },

  orderStatus: {
    type: String,
    enum: ['processing', 'shipped', 'delivered', 'cancelled'],
    default: 'processing'
  },

  trackingNumber: String,

  orderCode: {
    type: String,
    required: true,
    unique: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('orders', orderSchema);
