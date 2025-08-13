const users = require('../models/users');
const bcrypt = require('bcryptjs');

const updateProfileController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ad, soyad, email, password, telefon, adres_detay, sehir, ilce, posta_kodu } = req.body;

    const user = await users.findById(userId);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    if (ad) user.ad = ad;
    if (soyad) user.soyad = soyad;
    if (email) user.email = email;
    if (telefon) user.telefon = telefon;

    // ✅ Adres güncelle
    if (adres_detay || sehir || ilce || posta_kodu) {
      user.adresler = [
        {
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
    res.status(200).json({ message: 'Profil başarıyla güncellendi.', user: userData });
  } catch (err) {
    console.error('Profil güncelleme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

module.exports = updateProfileController;
