const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    default: null
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
      image: String,
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
    method: String,
    status: { type: String, enum: ['success', 'pending', 'failed'], default: 'pending' },
    transactionId: String,   // ✅ Yeni: paymentResponse.paymentId buraya gelecek
    referenceId: String,     // ✅ Yeni: paymentResponse.conversationId buraya gelecek
    savedCardUsed: Boolean,  // İstersen bunu da ekleyebilirsin
    date: { type: Date, default: Date.now }
  },

  orderStatus: {
    type: String,
    enum: ['processing', 'shipped', 'delivered', 'cancel_pending', 'cancelled'],
    default: 'processing'
  },


  // ✅ BURAYA EKLİYORSUN
  cancel: {
    reason: {
      type: String,
      default: null
    },
    cancelledBy: {
      type: String,
      enum: ['ADMIN', 'CUSTOMER', 'SYSTEM'],
      default: null
    },
    cancelledAt: {
      type: Date,
      default: null
    }
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
