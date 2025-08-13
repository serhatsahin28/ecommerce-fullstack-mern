const User = require('../models/users'); // Model ismini User olarak varsayıyoruz
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose'); // _id kontrolü için

// 1. Sadece Temel Profil Bilgilerini Güncelleme
const updateProfileController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ad, soyad, email, telefon, password } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    // Alanları güncelle
    if (ad) user.ad = ad;
    if (soyad) user.soyad = soyad;
    if (email) user.email = email;
    if (telefon) user.telefon = telefon;

    // Şifre güncelleniyorsa
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    const { password: _, ...userData } = user.toObject(); // şifreyi yanıttan çıkar
    res.status(200).json({ message: 'Profil bilgileri başarıyla güncellendi.', user: userData });

  } catch (err) {
    console.error('Profil bilgileri güncelleme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// 2. Yeni Adres Ekleme
const addAddressController = async (req, res) => {
  try {
    const userId = req.user.id;
    // Frontend'den gelen veriyi "adres_basligi" olarak alıyoruz ("Ev Adresim", "Ofis" gibi)
    const { adres_basligi, ulke, sehir, ilce, posta_kodu, adres_detay, varsayilan } = req.body;
    
    // Gerekli alanların kontrolü
    if (!adres_basligi || !sehir || !ilce || !adres_detay) {
      return res.status(400).json({ message: 'Lütfen adres başlığı, şehir, ilçe ve adres detayı alanlarını doldurun.' });
    }
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    
    const newAddress = { adres_basligi, ulke, sehir, ilce, posta_kodu, adres_detay, varsayilan };
    
    // Eğer yeni adres varsayılan olarak işaretlenmişse, diğerlerini false yap
    if (varsayilan && user.adresler && user.adresler.length > 0) {
      user.adresler.forEach(addr => addr.varsayilan = false);
    }
    
    user.adresler.push(newAddress);
    await user.save();

    const addedAddress = user.adresler[user.adresler.length - 1]; // Eklenen son adresi al (içinde _id var)

    res.status(201).json({ message: 'Adres başarıyla eklendi.', adresler: user.adresler });
  } catch (err) {
    console.error('Adres ekleme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};


// 3. Mevcut Adresi Güncelleme
const updateAddressController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { addressId } = req.params; // Route'dan adresin ID'sini alıyoruz: /profile/address/:addressId
        const { adres_basligi, ulke, sehir, ilce, posta_kodu, adres_detay, varsayilan } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

        const addressToUpdate = user.adresler.id(addressId);
        if (!addressToUpdate) return res.status(404).json({ message: 'Adres bulunamadı.' });
        
        // Eğer güncellenen adres varsayılan yapılacaksa, diğerlerini false yap
        if (varsayilan && !addressToUpdate.varsayilan) {
           user.adresler.forEach(addr => addr.varsayilan = false);
        }

        // Alanları güncelle
        Object.assign(addressToUpdate, req.body);
        
        await user.save();
        res.status(200).json({ message: 'Adres başarıyla güncellendi.', adresler: user.adresler });

    } catch (err) {
        console.error('Adres güncelleme hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

// ... Diğer controller'lar (adres silme, kart ekleme vs.) eklenebilir.

module.exports = {
  updateProfileController, // Kişisel bilgiler için
  addAddressController,
  updateAddressController,
  // deleteAddressController vb...
};