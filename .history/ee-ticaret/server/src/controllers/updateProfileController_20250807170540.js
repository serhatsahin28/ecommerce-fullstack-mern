// controllers/updateProfileController.js
const users = require('../models/users');
const bcrypt = require('bcryptjs');

// === PROFİL BİLGİLERİNİ GÜNCELLEME (Değişiklik yok) ===
// controllers/updateProfileController.js

const updateAddressController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const user = await users.findById(userId);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    
    // ObjectId'ye çevirerek ara
    const addressToUpdate = user.adresler.id(addressId);
    if (!addressToUpdate) {
      return res.status(404).json({ message: 'Adres bulunamadı.' });
    }

    // Yeni verileri ata
    addressToUpdate.set(req.body);
    
    // Varsayılan adres güncellemesi
    if (req.body.varsayilan) {
      user.adresler.forEach(adr => {
        adr.varsayilan = adr._id.equals(addressToUpdate._id);
      });
    }

    await user.save();
    
    // Frontend için id alanını ekleyerek dön
    const updatedAddress = {
      ...addressToUpdate.toObject(),
      id: addressToUpdate._id.toString() // Kritik düzeltme!
    };

    res.status(200).json({ 
      message: 'Adres başarıyla güncellendi.',
      address: updatedAddress
    });

  } catch (err) {
    // Hata işleme...
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