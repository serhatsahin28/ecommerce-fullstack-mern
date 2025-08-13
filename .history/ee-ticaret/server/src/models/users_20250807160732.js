const mongoose = require("mongoose");

const bildirimTercihleriSchema = new mongoose.Schema({
  email_bildirim: { type: Boolean, default: true },
  sms_bildirim: { type: Boolean, default: false },
  kampanya_bildirimi: { type: Boolean, default: true }
}, { _id: false });

const guvenlikSchema = new mongoose.Schema({
  "2fa_aktif": { type: Boolean, default: false },
  giris_deneme_sayisi: { type: Number, default: 0 },
  hesap_kilidi: { type: Boolean, default: false }
}, { _id: false });

const userSchema = new mongoose.Schema({
  ad: { type: String, required: false },
  soyad: { type: String, required: false },
  email: { type: String, required: false, unique: true },
  password: { type: String, required: false },
  telefon: { type: String },
  rol: { type: String, enum: ["musteri", "admin"], default: "musteri" },
  durum: { type: String, enum: ["aktif", "pasif", "askida"], default: "aktif" },
  kayit_tarihi: { type: Date, default: Date.now },
  son_giris: { type: Date, default: null },
  adresler: [{
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Bu satırı ekleyin
    adres_ismi: String,
    adres_detay: String,
    sehir: String,
    ilce: String,
    posta_kodu: String
  }]
  favoriler: { type: [mongoose.Schema.Types.ObjectId], ref: "Product", default: [] },
  sepet: { type: [mongoose.Schema.Types.Mixed], default: [] }, // ürünler ve adetler yer alabilir
  odeme_yontemleri: { type: [mongoose.Schema.Types.Mixed], default: [] },
  bildirim_tercihleri: { type: bildirimTercihleriSchema, default: () => ({}) },
  guvenlik: { type: guvenlikSchema, default: () => ({}) }
});

const Users = mongoose.model("Users", userSchema);

module.exports = Users;
