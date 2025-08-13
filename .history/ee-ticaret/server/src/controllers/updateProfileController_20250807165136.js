// controllers/updateProfileController.js
const users = require('../models/users');
const bcrypt = require('bcryptjs');

// === PROFİL BİLGİLERİNİ GÜNCELLEME (Değişiklik yok) ===
// controllers/updateProfileController.js

const updateAddressController = async (req, res) => {
  // 1. Log: Fonksiyonun tetiklendiğini görelim
  console.log("--- UPDATE ADDRESS CONTROLLER ÇALIŞTI ---");
  
  try {
    const userId = req.user.id;
    const { addressId } = req.params;

    // 2. Log: Gelen ID'leri kontrol edelim
    console.log(`Gelen User ID: ${userId}`);
    console.log(`Gelen Address ID: ${addressId}`);

    const user = await users.findById(userId);

    if (!user) {
      console.log("HATA: Kullanıcı bulunamadı.");
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }
    
    // 3. Log: Kullanıcının tüm adreslerini yazdıralım
    console.log("Kullanıcının veritabanındaki mevcut adresleri:", JSON.stringify(user.adresler, null, 2));

    const addressToUpdate = user.adresler.id(addressId);
    
    // 4. Log: Mongoose'un adresi bulup bulamadığını görelim
    console.log("Mongoose'un bulduğu adres (null ise bulunamamıştır):", addressToUpdate);

    if (!addressToUpdate) {
      console.log("HATA: Belirtilen addressId, kullanıcının adresleri arasında bulunamadı. 404 döndürülüyor.");
      return res.status(404).json({ message: 'Güncellenecek adres bulunamadı.' });
    }

    console.log("Başarılı: Adres bulundu, güncelleniyor...");
    addressToUpdate.set(req.body);
    const savedUser = await user.save();
    
    res.status(200).json({ 
        message: 'Adres başarıyla güncellendi.', 
        address: savedUser.adresler.id(addressId) 
    });

  } catch (err) {
    console.error('Adres güncelleme kritik hata:', err);
    res.status(500).json({ message: 'Sunucuda bir hata oluştu.' });
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