const mongoose = require("mongoose");

const bildirimTercihleriSchema = new mongoose.Schema({
  email_bildirim: { type: Boolean, default: true },
  sms_bildirim: { type: Boolean, default: false },
  kampanya_bildirimi: { type: Boolean, default: true }
}, { _id: false });

const addressSchema = new mongoose.Schema({
  adres_ismi: { type: String, required: [true, 'Adres ismi zorunludur.'] },
  adres_detay: { type: String, required: [true, 'Adres detayı zorunludur.'] },
  sehir: { type: String, required: [true, 'Şehir bilgisi zorunludur.'] },
  ilce: { type: String, required: [true, 'İlçe bilgisi zorunludur.'] },
  posta_kodu: { type: String, required: [true, 'Posta kodu zorunludur.'] },
  // Frontend'den gelen 'varsayilan' alanını da ekleyelim 
  varsayilan: { type: Boolean, default: false }
});


const paymentSchema = new mongoose.Schema({
  kart_tipi: String,
  kart_numarasi: String,
  kart_ismi: String,
  son_kullanma: String,
  masked_number: String,
  kart_token: String,          // burada token saklanacak
  card_user_key: String,       // iyzico'dan dönen user key
  varsayilan: { type: Boolean, default: false }
}, { _id: true });


const sepetSchema = new mongoose.Schema({



});



const guvenlikSchema = new mongoose.Schema({
  "2fa_aktif": { type: Boolean, default: false },
  giris_deneme_sayisi: { type: Number, default: 0 },
  hesap_kilidi: { type: Boolean, default: false }
}, { _id: false });

const userSchema = new mongoose.Schema({
  ad: { type: String },
  soyad: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  telefon: { type: String },
  rol: { type: String, enum: ["musteri", "admin"], default: "musteri" },
  durum: { type: String, enum: ["aktif", "pasif", "askida"], default: "aktif" },
  kayit_tarihi: { type: Date, default: Date.now },
  son_giris: { type: Date, default: null },
  favoriler: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  sepet: [{ type: mongoose.Schema.Types.Mixed }],
  odeme_yontemleri: [paymentSchema],


  // 2. ADRESLER ALANI YENİ ŞEMA İLE DEĞİŞTİRİLDİ (En Kritik Düzeltme)
  adresler: [addressSchema],

  bildirim_tercihleri: { type: bildirimTercihleriSchema, default: () => ({}) },
  guvenlik: { type: guvenlikSchema, default: () => ({}) }
});

const Users = mongoose.model("Users", userSchema);

module.exports = Users;
