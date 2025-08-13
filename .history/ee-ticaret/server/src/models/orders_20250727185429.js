const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    default: null // Misafir kullanıcılar için null olabilir
  },
  email: {
    type: String,
    required: true
  },
  ad: String,
  soyad: String,
  telefon: String,

  sepet: [
    {
      product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
      name: String,
      category: String,
      price: Number,
      quantity: Number
    }
  ],

  toplamTutar: {
    type: Number,
    required: true
  },

  kargoBilgisi: {
    adres: String,
    il: String,
    ilce: String,
    postaKodu: String,
    aciklama: String
  },

  odeme: {
    yontem: String, // örn: 'iyzico', 'havale'
    durum: { type: String, enum: ['basarili', 'beklemede', 'basarisiz'], default: 'beklemede' },
    iyzicoReferansNo: String,
    tarih: { type: Date, default: Date.now }
  },

  siparisDurumu: {
    type: String,
    enum: ['hazirlaniyor', 'kargoda', 'teslim edildi', 'iptal edildi'],
    default: 'hazirlaniyor'
  },

  takipNo: String,

  siparisKodu: {
    type: String,
    required: true,
    unique: true
  },

  olusturmaTarihi: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('orders', orderSchema);
