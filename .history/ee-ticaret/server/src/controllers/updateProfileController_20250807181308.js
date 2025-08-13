// controllers/userActionsController.js
const users = require('../models/users');
const bcrypt = require('bcryptjs');

// === 1. TEMEL PROFİL BİLGİLERİNİ GÜNCELLEME ===
const updateProfileController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ad, soyad, email, telefon, password } = req.body;

    const user = await users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    user.ad = ad || user.ad;
    user.soyad = soyad || user.soyad;
    user.email = email || user.email;
    user.telefon = telefon || user.telefon;

    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
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
    
    await user.save();
    
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
        user.adresler.forEach(adr => {
            if (!adr._id.equals(addressToUpdate._id)) {
                adr.varsayilan = false;
            }
        });
    }

    addressToUpdate.set(req.body);
    
    await user.save();
    // Güncellenmiş adresi tekrar bulup göndermek en sağlıklısı
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

// === 4. ADRES SİLME (HATA DÜZELTİLDİ) ===
const deleteAddressController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { addressId } = req.params;
        const user = await users.findById(userId);

        if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

        // DÜZELTME: .remove() metodu yerine sub-document'ı array'den çıkarmak için .pull() kullanılır.
        // Bu, Mongoose'un bu işlem için sunduğu doğru ve güvenli yöntemdir.
        user.adresler.pull({ _id: addressId });

        await user.save();
        
        res.status(200).json({ message: 'Adres başarıyla silindi.' });
    } catch (err) {
        console.error('Adres silme hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

// === 5. ÖDEME YÖNTEMİ EKLEME (HATA DÜZELTİLDİ) ===
const addPaymentMethod = async (req, res) => {
  try {
    const userId = req.user.id;
    const { kart_numarasi, ...rest } = req.body;
    
    const user = await users.findById(userId);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    
    const maskedCard = `**** **** **** ${kart_numarasi.slice(-4)}`;
    
    const newPaymentMethod = {
      ...rest,
      kart_numarasi: maskedCard,
    };

    user.odeme_yontemleri.push(newPaymentMethod);
    
    // DÜZELTME: Referansı, save() işleminden ÖNCE alıyoruz.
    // Bu sayede 'addedPayment' bir Mongoose sub-document olur ve .toObject() gibi metotlara sahip olur.
    const addedPayment = user.odeme_yontemleri[user.odeme_yontemleri.length - 1];

    await user.save();
    
    res.status(201).json({ 
      message: 'Ödeme yöntemi başarıyla eklendi.',
      payment: { ...addedPayment.toObject(), id: addedPayment._id }
    });
  } catch (err) {
    console.error('Ödeme yöntemi ekleme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// === 6. ÖDEME YÖNTEMİ SİLME (İyileştirildi) ===
const deletePaymentMethod = async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentId } = req.params;
    
    const user = await users.findById(userId);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    
    // İYİLEŞTİRME: Adres silmede olduğu gibi, tutarlılık için .pull() metodu kullanıyoruz.
    user.odeme_yontemleri.pull({ _id: paymentId });

    await user.save();
    res.status(200).json({ message: 'Ödeme yöntemi başarıyla silindi.' });
  } catch (err) {
    console.error('Ödeme yöntemi silme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Tüm fonksiyonları export et
module.exports = {
  updateProfileController,
  addAddressController,
  updateAddressController,
  deleteAddressController,
  addPaymentMethod,
  deletePaymentMethod
};