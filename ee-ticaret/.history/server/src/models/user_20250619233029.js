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
  ad: { type: String, required: true },
  soyad: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  telefon: { type: String },
  rol: { type: String, enum: ["musteri", "admin"], default: "musteri" },
  durum: { type: String, enum: ["aktif", "pasif", "askida"], default: "aktif" },
  kayit_tarihi: { type: Date, default: Date.now },
  son_giris: { type: Date, default: null },
  adresler: { type: [mongoose.Schema.Types.Mixed], default: [] }, // İleri aşamada ayrı şema olabilir
  favoriler: { type: [mongoose.Schema.Types.ObjectId], ref: "Product", default: [] },
  sepet: { type: [mongoose.Schema.Types.Mixed], default: [] }, // ürünler ve adetler yer alabilir
  odeme_yontemleri: { type: [mongoose.Schema.Types.Mixed], default: [] },
  bildirim_tercihleri: { type: bildirimTercihleriSchema, default: () => ({}) },
  guvenlik: { type: guvenlikSchema, default: () => ({}) }
});

const User = mongoose.model("Users", userSchema);

module.exports = User;
