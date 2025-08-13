// controllers/userActionsController.js
const users = require('../models/users');
const bcrypt = require('bcryptjs');

// === 1. TEMEL PROFİL BİLGİLERİNİ GÜNCELLEME (YENİ VE DOĞRU FONKSİYON) ===
const updateProfileController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ad, soyad, email, telefon, password } = req.body;

    const user = await users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    // Alanları güncelle
    user.ad = ad || user.ad;
    user.soyad = soyad || user.soyad;
    user.email = email || user.email;
    user.telefon = telefon || user.telefon;

    // Eğer yeni bir şifre gönderildiyse, hash'leyip güncelle
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

// === 2. ADRES EKLEME (DÜZELTİLDİ: Dönen adreste ID var) ===
const addAddressController = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await users.findById(userId);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    // Eğer yeni adres varsayılan olarak işaretlendiyse, diğerlerini false yap
    if (req.body.varsayilan) {
        user.adresler.forEach(adr => adr.varsayilan = false);
    }
    
    user.adresler.push(req.body);
    const savedUser = await user.save();
    
    // Frontend'in kullanabilmesi için ID'si olan son adresi gönder
    const addedAddress = savedUser.adresler[savedUser.adresler.length - 1];
    
    res.status(201).json({ 
      message: 'Adres başarıyla eklendi.', 
      address: { ...addedAddress.toObject(), id: addedAddress._id } // ÖNEMLİ DÜZELTME
    });

  } catch (err) {
    console.error('Adres ekleme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// === 3. ADRES GÜNCELLEME (DÜZELTİLDİ: ID'yi doğru buluyor) ===
const updateAddressController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params; // addressId artık URL'den gelecek
    const user = await users.findById(userId);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    // Mongoose'un sub-document bulma özelliğini kullan
    const addressToUpdate = user.adresler.id(addressId);
    if (!addressToUpdate) {
      return res.status(404).json({ message: 'Adres bulunamadı.' });
    }

    // Eğer güncellenen adres varsayılan yapılıyorsa, diğerlerini false yap
    if (req.body.varsayilan) {
        user.adresler.forEach(adr => {
            // .equals() metodu ObjectId karşılaştırması için en güvenli yoldur
            if (!adr._id.equals(addressToUpdate._id)) {
                adr.varsayilan = false;
            }
        });
    }

    // Gelen yeni verileri adrese ata
    addressToUpdate.set(req.body);
    
    const savedUser = await user.save();
    const updatedAddress = savedUser.adresler.id(addressId);

    res.status(200).json({
      message: 'Adres başarıyla güncellendi.',
      address: { ...updatedAddress.toObject(), id: updatedAddress._id } // ÖNEMLİ DÜZELTME
    });

  } catch (err) {
    console.error('Adres güncelleme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// === 4. ADRES SİLME (MEVCUT KODUNUZ DOĞRU, BURAYA TAŞINDI) ===
const deleteAddressController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { addressId } = req.params;
        const user = await users.findById(userId);

        if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

        // Adresin varlığını kontrol et ve kaldır
        const address = user.adresler.id(addressId);
        if (!address) {
            return res.status(404).json({ message: 'Adres bulunamadı.' });
        }
        address.remove(); // Mongoose'un kendi metodu ile silme

        await user.save();
        res.status(200).json({ message: 'Adres başarıyla silindi.' });
    } catch (err) {
        console.error('Adres silme hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};


// === 5. ÖDEME YÖNTEMİ EKLEME (YENİ FONKSİYON) ===
const addPaymentMethod = async (req, res) => {
  try {
    const userId = req.user.id;
    const { kart_numarasi, ...rest } = req.body;
    
    const user = await users.findById(userId);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    
    // Kart numarasını maskele (Sadece son 4 hane saklanır)
    const maskedCard = `**** **** **** ${kart_numarasi.slice(-4)}`;
    
    const newPaymentMethod = {
      ...rest,
      kart_numarasi: maskedCard,
    };

    user.odeme_yontemleri.push(newPaymentMethod);
    const savedUser = await user.save();
    const addedPayment = savedUser.odeme_yontemleri[savedUser.odeme_yontemleri.length - 1];

    res.status(201).json({ 
      message: 'Ödeme yöntemi başarıyla eklendi.',
      payment: { ...addedPayment.toObject(), id: addedPayment._id }
    });
  } catch (err) {
    console.error('Ödeme yöntemi ekleme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// === 6. ÖDEME YÖNTEMİ SİLME (YENİ FONKSİYON) ===
const deletePaymentMethod = async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentId } = req.params;
    
    const user = await users.findById(userId);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    
    const payment = user.odeme_yontemleri.id(paymentId);
    if (!payment) {
        return res.status(404).json({ message: 'Ödeme yöntemi bulunamadı.' });
    }
    payment.remove();

    await user.save();
    res.status(200).json({ message: 'Ödeme yöntemi başarıyla silindi.' });
  } catch (err) {
    console.error('Ödeme yöntemi silme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};


module.exports = {
  updateProfileController,
  addAddressController,
  updateAddressController,
  deleteAddressController,
  addPaymentMethod,
  deletePaymentMethod
};