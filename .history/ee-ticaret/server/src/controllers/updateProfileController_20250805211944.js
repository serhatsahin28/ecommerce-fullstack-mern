const users = require('../models/users');
const bcrypt = require('bcryptjs');
const users = require('../models/users');
const bcrypt = require('bcryptjs');

const updateProfileController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ad, soyad, email, password, telefon, adres_detay, sehir, ilce, posta_kodu, adres_ismi } = req.body;

    const user = await users.findById(userId);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    if (ad) user.ad = ad;
    if (soyad) user.soyad = soyad;
    if (email) user.email = email;
    if (telefon) user.telefon = telefon;

    // ✅ Adres güncelle (adres_ismi dahil)
    if (adres_detay || sehir || ilce || posta_kodu || adres_ismi) {
      user.adresler = [
        {
          adres_ismi: adres_ismi || '',
          adres_detay: adres_detay || '',
          sehir: sehir || '',
          ilce: ilce || '',
          posta_kodu: posta_kodu || ''
        }
      ];
    }

    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    const { password: pwd, ...userData } = user.toObject();
    res.status(200).json({
      message: 'Profil başarıyla güncellendi.',
      user: userData
    });
  } catch (err) {
    console.error('Profil güncelleme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// ✅ Yeni adres ekleme controller'ı
const addAddressController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { adres_ismi, adres_detay, sehir, ilce, posta_kodu } = req.body;

    // Validation
    if (!adres_ismi || !adres_detay || !sehir || !ilce || !posta_kodu) {
      return res.status(400).json({
        message: 'Tüm adres alanları doldurulmalıdır.'
      });
    }

    const user = await users.findById(userId);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    // Yeni adresi ekle
    const newAddress = {
      adres_ismi: adres_ismi.trim(),
      adres_detay: adres_detay.trim(),
      sehir: sehir.trim(),
      ilce: ilce.trim(),
      posta_kodu: posta_kodu.trim()
    };

    // Eğer adresler array'i yoksa oluştur
    if (!user.adresler) {
      user.adresler = [];
    }

    user.adresler.push(newAddress);
    await user.save();

    res.status(200).json({
      message: 'Adres başarıyla eklendi.',
      address: newAddress
    });
  } catch (err) {
    console.error('Adres ekleme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// ✅ Adres silme controller'ı
const deleteAddressController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressIndex } = req.params;

    const user = await users.findById(userId);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    if (!user.adresler || user.adresler.length === 0) {
      return res.status(404).json({ message: 'Silinecek adres bulunamadı.' });
    }

    const index = parseInt(addressIndex);
    if (index < 0 || index >= user.adresler.length) {
      return res.status(400).json({ message: 'Geçersiz adres indexi.' });
    }

    user.adresler.splice(index, 1);
    await user.save();

    res.status(200).json({
      message: 'Adres başarıyla silindi.',
      addresses: user.adresler
    });
  } catch (err) {
    console.error('Adres silme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

module.exports = {
  updateProfileController,
  addAddressController,
  deleteAddressController
};