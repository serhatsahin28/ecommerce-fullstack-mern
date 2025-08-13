// controllers/updateProfileController.js
const users = require('../models/users');
const bcrypt = require('bcryptjs');

// === PROFİL BİLGİLERİNİ GÜNCELLEME (Değişiklik yok, zaten doğruydu) ===
const updateProfileController = async (req, res) => {
    // Bu kod bloğunuz zaten doğru çalışıyor. Olduğu gibi bırakabilirsiniz.
    try {
        const userId = req.user.id;
        const { ad, soyad, email, password, telefon } = req.body;
        const user = await users.findById(userId);
        if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        if (ad) user.ad = ad;
        if (soyad) user.soyad = soyad;
        if (email) user.email = email;
        if (telefon) user.telefon = telefon;
        if (password && password.trim() !== '') {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(password, salt);
        }
        await user.save();
        const { password: pwd, ...userData } = user.toObject();
        res.status(200).json({ message: 'Profil başarıyla güncellendi.', user: userData });
      } catch (err) {
        console.error('Profil güncelleme hatası:', err);
        // Email unique hatasını yakalama
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanımda.'});
        }
        res.status(500).json({ message: 'Sunucu hatası' });
      }
};

// === ADRES EKLEME (Mongoose Validation ile) ===
const addAddressController = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }
    
    // Gelen verilerle yeni bir adres nesnesi oluştur
    const newAddress = req.body;
    
    // Adresi kullanıcı dökümanına ekle
    user.adresler.push(newAddress);
    
    // Kaydet. Mongoose burada 'required' alanları otomatik kontrol edecektir.
    const savedUser = await user.save();
    
    // Eklenen son adresi bul ve _id'si ile birlikte geri döndür
    const addedAddress = savedUser.adresler[savedUser.adresler.length - 1];
    
    res.status(201).json({ 
      message: 'Adres başarıyla eklendi.',
      address: addedAddress 
    });

  } catch (err) {
    // Mongoose'un validation hatasını yakala ve net bir cevap dön
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ 
        message: 'Lütfen tüm zorunlu adres alanlarını doldurun.',
        errors: messages
      });
    }
    console.error('Adres ekleme hatası:', err);
    res.status(500).json({ message: 'Sunucuda bir hata oluştu.' });
  }
};

// === ADRES GÜNCELLEME (Daha Basit ve Doğru Yöntem) ===
const updateAddressController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params; // Güncellenecek adresin _id'si
    const updatedData = req.body; // Güncel veri (adres_ismi, sehir vb.)

    const user = await users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }
    
    // Güncellenecek adresi subdocument olarak bul
    const addressToUpdate = user.adresler.id(addressId);
    if (!addressToUpdate) {
      return res.status(404).json({ message: 'Adres bulunamadı.' });
    }

    // Gelen yeni veriyi mevcut adresin üzerine yaz
    addressToUpdate.set(updatedData);

    // Ana kullanıcı dökümanını kaydet
    const savedUser = await user.save();
    
    // Güncellenen adresi bul ve geri döndür
    const updatedAddress = savedUser.adresler.id(addressId);

    res.status(200).json({ 
      message: 'Adres başarıyla güncellendi.',
      address: updatedAddress
    });

  } catch (err) {
     if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ 
        message: 'Güncelleme sırasında tüm zorunlu alanlar doldurulmalıdır.',
        errors: messages
      });
    }
    console.error('Adres güncelleme hatası:', err);
    res.status(500).json({ message: 'Sunucuda bir hata oluştu.' });
  }
};


module.exports = {
  updateProfileController,
  addAddressController,
  updateAddressController
};