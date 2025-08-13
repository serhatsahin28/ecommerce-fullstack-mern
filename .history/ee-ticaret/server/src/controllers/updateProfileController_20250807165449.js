const users = require('../models/users');
const bcrypt = require('bcryptjs');

const updateProfileController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ad, soyad, email, password, telefon } = req.body;

    const user = await users.findById(userId);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    if (ad) user.ad = ad;
    if (soyad) user.soyad = soyad;
    if (email) user.email = email;
    if (telefon) user.telefon = telefon;

    // Kaldırılan: Adres güncelleme kısmı (artık sadece addAddressController kullanılacak)

    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    const { password: pwd, ...userData } = user.toObject();
    res.status(200).json({ message: 'Profil başarıyla güncellendi.', user: userData });
  } catch (err) {
    console.error('Profil güncelleme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

const addAddressController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { adres_ismi, adres_detay, sehir, ilce, posta_kodu } = req.body;

    if (!adres_ismi || !adres_detay || !sehir || !ilce || !posta_kodu) {
      return res.status(400).json({
        message: 'Tüm adres alanları doldurulmalıdır.'
      });
    }

    const user = await users.findById(userId);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    const newAddress = {
      adres_ismi: adres_ismi.trim(),
      adres_detay: adres_detay.trim(),
      sehir: sehir.trim(),
      ilce: ilce.trim(),
      posta_kodu: posta_kodu.trim()
    };

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
const updateAddressController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const { adres_ismi, adres_detay, sehir, ilce, posta_kodu } = req.body;

    const user = await users.findById(userId);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    // _id kontrolü ekleyin ve düzeltme
    const addressIndex = user.adresler.findIndex(addr => 
      addr._id ? addr._id.toString() === addressId : false
    );

    if (addressIndex === -1) return res.status(404).json({ message: 'Adres bulunamadı.' });

    // Güncelleme mantığı
    const updatedFields = {};
    if (adres_ismi) updatedFields['adresler.$[elem].adres_ismi'] = adres_ismi;
    if (adres_detay) updatedFields['adresler.$[elem].adres_detay'] = adres_detay;
    if (sehir) updatedFields['adresler.$[elem].sehir'] = sehir;
    if (ilce) updatedFields['adresler.$[elem].ilce'] = ilce;
    if (posta_kodu) updatedFields['adresler.$[elem].posta_kodu'] = posta_kodu;

    // Düzgün güncelleme için findOneAndUpdate kullanın
    const result = await users.findOneAndUpdate(
      { _id: userId, "adresler._id": addressId },
      { $set: updatedFields },
      { 
        arrayFilters: [{ "elem._id": addressId }],
        new: true 
      }
    );

    if (!result) return res.status(404).json({ message: 'Adres güncellenemedi.' });

    res.status(200).json({ 
      message: 'Adres başarıyla güncellendi.',
      address: result.adresler.find(a => a._id.toString() === addressId)
    });
  } catch (err) {
    console.error('Adres güncelleme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

module.exports = {
  updateProfileController,
  addAddressController,
  updateAddressController
};