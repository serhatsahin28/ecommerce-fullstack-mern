// controllers/updateProfileController.js
const users = require('../models/users');
const bcrypt = require('bcryptjs');

// === PROFİL BİLGİLERİNİ GÜNCELLEME (Değişiklik yok) ===
const updateProfileController = async (req, res) => {
    // Bu kod bloğu doğru, aynı kalabilir.
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
        const savedUser = await user.save();
        const { password: pwd, ...userData } = savedUser.toObject();
        res.status(200).json({ message: 'Profil başarıyla güncellendi.', user: userData });
      } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanımda.'});
        }
        console.error('Profil güncelleme hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası' });
      }
};

// === ADRES EKLEME (Değişiklik yok) ===
const addAddressController = async (req, res) => {
    // Bu kod bloğu doğru, aynı kalabilir.
    try {
        const userId = req.user.id;
        const user = await users.findById(userId);
        if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        user.adresler.push(req.body);
        const savedUser = await user.save();
        const addedAddress = savedUser.adresler[savedUser.adresler.length - 1];
        res.status(201).json({ message: 'Adres başarıyla eklendi.', address: addedAddress });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ message: 'Lütfen tüm zorunlu adres alanlarını doldurun.', errors: messages });
        }
        console.error('Adres ekleme hatası:', err);
        res.status(500).json({ message: 'Sunucuda bir hata oluştu.' });
    }
};

// === ADRES GÜNCELLEME (Değişiklik yok, ama doğruluğunu teyit edin) ===
const updateAddressController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { addressId } = req.params;
        const user = await users.findById(userId);
        if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        
        const addressToUpdate = user.adresler.id(addressId);
        if (!addressToUpdate) {
            // Adres bulunamadığında bu 404 hatası döner!
            return res.status(404).json({ message: 'Güncellenecek adres bulunamadı.' });
        }
        addressToUpdate.set(req.body);
        const savedUser = await user.save();
        const updatedAddress = savedUser.adresler.id(addressId);
        res.status(200).json({ message: 'Adres başarıyla güncellendi.', address: updatedAddress });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: 'Tüm zorunlu alanlar doldurulmalıdır.' });
        }
        console.error('Adres güncelleme hatası:', err);
        res.status(500).json({ message: 'Sunucuda bir hata oluştu.' });
    }
};

// === YENİ: ADRES SİLME CONTROLLER'I ===
const deleteAddressController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { addressId } = req.params;
        const user = await users.findById(userId);
        if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        
        const addressToDelete = user.adresler.id(addressId);
        if (!addressToDelete) {
             return res.status(404).json({ message: 'Silinecek adres bulunamadı.' });
        }
        
        // Mongoose 7 ve üstü için remove()
        await addressToDelete.deleteOne();

        // Ana dökümanı kaydet
        await user.save();

        res.status(200).json({ message: 'Adres başarıyla silindi.' });

    } catch(err) {
        console.error('Adres silme hatası:', err);
        res.status(500).json({ message: 'Sunucuda bir hata oluştu.'});
    }
};

module.exports = {
  updateProfileController,
  addAddressController,
  updateAddressController,
  deleteAddressController // YENİ FONKSİYONU EXPORT EDİN
};