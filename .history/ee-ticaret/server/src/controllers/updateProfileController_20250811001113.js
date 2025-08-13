// controllers/userActionsController.js
const users = require('../models/users');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const crypto = require('crypto');


const IYZICO_API_KEY = process.env.IYZI_API_KEY;
const IYZICO_SECRET_KEY = process.env.IYZI_SECRET_KEY;
const IYZICO_BASE_URL = "https://sandbox-api.iyzipay.com";


// İyzico imza üretme (simplified)
function generateSignature(payload) {
  const payloadString = Buffer.from(JSON.stringify(payload)).toString('base64');
  return crypto.createHmac('sha1', IYZICO_SECRET_KEY).update(payloadString).digest('base64');
}



// === Yardımcı Fonksiyonlar ===
const setOnlyOneDefault = (list, targetId) => {
  list.forEach(item => {
    item.varsayilan = item._id.equals(targetId);
  });
};

const maskCardNumber = (cardNumber) => {
  return `**** **** **** ${cardNumber.slice(-4)}`;
};

// === 1. TEMEL PROFİL BİLGİLERİNİ GÜNCELLEME ===
const updateProfileController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ad, soyad, email, telefon, password } = req.body;

    const user = await users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    if (typeof ad === 'string' && ad.trim() && ad !== user.ad) user.ad = ad;
    if (typeof soyad === 'string' && soyad.trim() && soyad !== user.soyad) user.soyad = soyad;

    if (email && email !== user.email) {
      const emailExists = await users.findOne({ email });
      if (emailExists) return res.status(400).json({ message: 'Bu e-posta zaten kayıtlı.' });
      user.email = email;
    }

    if (telefon && telefon !== user.telefon) {
      const phoneExists = await users.findOne({ telefon });
      if (phoneExists) return res.status(400).json({ message: 'Bu telefon numarası zaten kayıtlı.' });
      user.telefon = telefon;
    }

    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();
    if (!updatedUser) return res.status(500).json({ message: 'Profil güncellenemedi.' });

    res.status(200).json({ message: 'Profil bilgileri başarıyla güncellendi.' });

  } catch (err) {
    console.error('Profil güncelleme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası: Profil güncellenemedi.' });
  }
};

// === 2. ADRES EKLEME ===
const addAddressController = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await users.findById(userId);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    if (req.body.varsayilan) {
      user.adresler.forEach(adr => adr.varsayilan = false);
    }

    user.adresler.push(req.body);
    const addedAddress = user.adresler[user.adresler.length - 1];

    const savedUser = await user.save();
    if (!savedUser) return res.status(500).json({ message: 'Adres kaydedilemedi.' });

    res.status(201).json({
      message: 'Adres başarıyla eklendi.',
      address: { ...addedAddress.toObject(), id: addedAddress._id }
    });

  } catch (err) {
    console.error('Adres ekleme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// === 3. ADRES GÜNCELLEME ===
const updateAddressController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const user = await users.findById(userId);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    const addressToUpdate = user.adresler.id(addressId);
    if (!addressToUpdate) {
      return res.status(404).json({ message: 'Adres bulunamadı.' });
    }

    if (req.body.varsayilan) {
      setOnlyOneDefault(user.adresler, addressId);
    }

    addressToUpdate.set(req.body);

    const savedUser = await user.save();
    if (!savedUser) return res.status(500).json({ message: 'Adres güncellenemedi.' });

    const updatedAddress = user.adresler.id(addressId);

    res.status(200).json({
      message: 'Adres başarıyla güncellendi.',
      address: { ...updatedAddress.toObject(), id: updatedAddress._id }
    });

  } catch (err) {
    console.error('Adres güncelleme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// === 4. ADRES SİLME ===
const deleteAddressController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const user = await users.findById(userId);

    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    user.adresler.pull({ _id: addressId });

    const savedUser = await user.save();
    if (!savedUser) return res.status(500).json({ message: 'Adres silinemedi.' });

    res.status(200).json({ message: 'Adres başarıyla silindi.' });
  } catch (err) {
    console.error('Adres silme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// === 5. ÖDEME YÖNTEMİ EKLEME Veritabanına ===
// const addPaymentMethod = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { kart_numarasi, ...rest } = req.body;

//     if (!kart_numarasi || kart_numarasi.length < 4) {
//       return res.status(400).json({ message: 'Geçersiz kart numarası.' });
//     }

//     const user = await users.findById(userId);
//     if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

//     const maskedCard = maskCardNumber(kart_numarasi);

//     const newPaymentMethod = {
//       ...rest,
//       kart_numarasi: maskedCard,
//     };

//     user.odeme_yontemleri.push(newPaymentMethod);
//     const addedPayment = user.odeme_yontemleri[user.odeme_yontemleri.length - 1];

//     const savedUser = await user.save();
//     if (!savedUser) return res.status(500).json({ message: 'Ödeme yöntemi eklenemedi.' });

//     res.status(201).json({
//       message: 'Ödeme yöntemi başarıyla eklendi.',
//       payment: { ...addedPayment.toObject(), id: addedPayment._id }
//     });

//   } catch (err) {
//     console.error('Ödeme yöntemi ekleme hatası:', err);
//     res.status(500).json({ message: 'Sunucu hatası' });
//   }
// };



async function addPaymentMethod(req, res) {
  try {
    const userId = req.user.id;
    const { kart_numarasi, son_kullanma, kart_ismi } = req.body;

    // Kullanıcıyı bul
    const user = await users.findById(userId);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    // İyzico API isteği
    const iyzicoPayload = {
      locale: "tr",
      conversationId: String(Date.now()),
      email: user.email,
      externalId: userId,
      card: {
        cardAlias: kart_ismi || "Kayıtlı Kart",
        cardHolderName: kart_ismi || "Ad Soyad",
        cardNumber: kart_numarasi,
        expireMonth: son_kullanma.split('/')[0],
        expireYear: son_kullanma.split('/')[1]
      }
    };

    const iyzicoResponse = await axios.post(
      `${IYZICO_BASE_URL}/cardstorage/card`,
      iyzicoPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `IYZWS ${IYZICO_API_KEY}:${generateSignature(iyzicoPayload)}`,
        }
      }
    );

    if (iyzicoResponse.data.status !== "success") {
      return res.status(400).json({ message: 'İyzico kart kaydı başarısız.' });
    }

    // İyzico’dan gelen token’ları sakla
    const { cardUserKey, cardToken, cardAlias } = iyzicoResponse.data;

    user.odeme_yontemleri.push({
      kart_tipi: "tokenized",
      kart_ismi: cardAlias,
      kart_token: cardToken,
      card_user_key: cardUserKey,
      masked_number: maskCardNumber(kart_numarasi) // sadece mask tut
    });

    await user.save();

    res.status(201).json({
      message: 'Kart başarıyla İyzico’ya kaydedildi.',
      payment: { cardAlias, cardToken, cardUserKey }
    });

  } catch (err) {
    console.error('İyzico kart ekleme hatası:', err.response?.data || err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
}



// İyzico imza üretme (simplified)
function generateSignature(payload) {
  const payloadString = Buffer.from(JSON.stringify(payload)).toString('base64');
  return crypto.createHmac('sha1', IYZICO_SECRET_KEY).update(payloadString).digest('base64');
}


// === 6. ÖDEME YÖNTEMİ SİLME ===
// ... diğer fonksiyonlar

// controllers/userActionsController.js - Güncellenmiş deletePaymentMethod
const deletePaymentMethod = async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentId } = req.params;

    const user = await users.findById(userId);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    const initialLength = user.odeme_yontemleri.length;

    user.odeme_yontemleri = user.odeme_yontemleri.filter(payment => {
      const pid = String(payment.id || payment._id);
      return pid !== String(paymentId);
    });


    if (user.odeme_yontemleri.length === initialLength) {
      return res.status(404).json({ message: 'Ödeme yöntemi bulunamadı.' });
    }

    await user.save();
    res.status(200).json({ message: 'Ödeme yöntemi başarıyla silindi.' });
  } catch (err) {
    console.error('Ödeme yöntemi silme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// ... diğer fonksiyonlar

// === Export ===
module.exports = {
  updateProfileController,
  addAddressController,
  updateAddressController,
  deleteAddressController,
  addPaymentMethod,
  deletePaymentMethod
};
