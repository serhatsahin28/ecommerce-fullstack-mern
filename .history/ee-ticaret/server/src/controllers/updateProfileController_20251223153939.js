// controllers/userActionsController.js
const users = require('../models/users');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const crypto = require('crypto');
const Iyzipay = require('iyzipay');
const iyzipay = new Iyzipay({
  apiKey: process.env.IYZI_API_KEY,
  secretKey: process.env.IYZI_SECRET_KEY,
  uri: 'https://sandbox-api.iyzipay.com'
});

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



async function addPaymentMethod(req, res) {
  try {

    // console.log("Gelen req.body:", req.body);
    // console.log("Kart numarası:", req.body.kart_numarasi);


    const user = await users.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    const [month, yearShort] = req.body.son_kullanma.split('/');
    const year = "20" + yearShort;


    iyzipay.card.create({
      locale: Iyzipay.LOCALE.TR,
      conversationId: String(Date.now()),
      email: user.email,
      externalId: req.user.id,
      card: {
        cardAlias: req.body.kart_ismi,
        cardHolderName: `${user.ad} ${user.soyad}`,  // gerçek kart sahibi adı
        cardNumber: req.body.kart_numarasi.replace(/\s+/g, ''),

        expireMonth: month.trim(),
        expireYear: year.trim()
      }
    }, async (err, result) => {
      console.log("İyzico raw response:", { err, result });
      if (err) {
        console.error("İyzico API hatası:", err);
        return res.status(500).json({ message: 'İyzico API hatası', detail: err });
      }

      if (result.status !== "success") {
        return res.status(400).json({
          message: 'İyzico kart kaydı başarısız.',
          detail: result.errorMessage || null
        });
      }

      user.odeme_yontemleri.push({
        kart_tipi: "tokenized",
        kart_ismi: result.cardAlias,
        kart_token: result.cardToken || "1",
        card_user_key: result.cardUserKey,
        masked_number: maskCardNumber(req.body.kart_numarasi)
      });


      // console.log("result: ", result);

      await user.save();
      res.status(201).json({
        message: 'Kart başarıyla İyzico’ya kaydedildi.',
        payment: {
          kart_tipi: "tokenized",  // veya Visa, MasterCard gibi
          kart_ismi: result.cardAlias,
          kart_token: result.cardToken,
          card_user_key: result.cardUserKey,
          masked_number: maskCardNumber(req.body.kart_numarasi),
          varsayilan: false
        }
      });

    });
  } catch (err) {
    console.error('Sunucu hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
}




// İyzico imza üretme (simplified)
function generateSignature(payload) {
  const payloadString = Buffer.from(JSON.stringify(payload)).toString('base64');
  return crypto.createHmac('sha1', IYZICO_SECRET_KEY).update(payloadString).digest('base64');
}


// === 6. ÖDEME YÖNTEMİ SİLME ===

const deletePaymentMethod = async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentId } = req.params;

    // Kullanıcıyı bul
    const user = await users.findById(userId);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    // Ödeme yöntemini bul
    const paymentMethod = user.odeme_yontemleri.find(payment => {
      const pid = String(payment.id || payment._id);
      return pid === String(paymentId);
    });

    console.log("paymentMethod",paymentMethod);
    if (!paymentMethod || !paymentMethod.kart_token || !paymentMethod.card_user_key) {
      return res.status(400).json({ message: 'Silmek için geçerli kart token ve user key bulunamadı.' });
    }

    console.log("paymentMetho", paymentMethod);

    // İyzico'dan sil
    iyzipay.card.delete({
      locale: Iyzipay.LOCALE.TR,
      conversationId: String(Date.now()),
      cardToken: paymentMethod.kart_token,
      cardUserKey: paymentMethod.card_user_key
    }, async (err, result) => {
      console.log("İyzico Delete Response:", { err, result });

      if (err) {
        return res.status(500).json({ message: 'İyzico API hatası', detail: err });
      }

      if (result.status !== "success") {
        return res.status(400).json({
          message: 'İyzico kart silme başarısız.',
          detail: result.errorMessage || null
        });
      }

      // DB'den sil
      user.odeme_yontemleri = user.odeme_yontemleri.filter(payment => {
        const pid = String(payment.id || payment._id);
        return pid !== String(paymentId);
      });

      await user.save();
      res.status(200).json({ message: 'Kart başarıyla silindi.' });
    });
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
