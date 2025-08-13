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
  favoriler: { type: [mongoose.Schema.Types.ObjectId], ref: "Product", default: [] },
  sepet: { type: [mongoose.Schema.Types.Mixed], default: [] }, // ürünler ve adetler yer alabilir
  odeme_yontemleri: { type: [mongoose.Schema.Types.Mixed], default: [] },
  bildirim_tercihleri: { type: bildirimTercihleriSchema, default: () => ({}) },
  guvenlik: { type: guvenlikSchema, default: () => ({}) }
});
const addressSchema = new mongoose.Schema({
  adres_ismi: { type: String, required: true },
  adres_detay: { type: String, required: true },
  sehir: { type: String, required: true },
  ilce: { type: String, required: true },
  posta_kodu: { type: String, required: true }
});
const Users = mongoose.model("Users", userSchema);

module.exports = Users;
