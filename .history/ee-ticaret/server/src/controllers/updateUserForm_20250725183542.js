const users = require('../models/users');
const bcrypt = require('bcryptjs');

const updateUserForm = async (req, res) => {
  try {
    const userId = req.user.id; // authMiddleware ile gelen user id
    const { ad, soyad, email, password, telefon } = req.body;

    // Kullanıcıyı bul
    const user = await users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    // Güncellenecek alanları kontrol et ve ata
    if (ad) user.ad = ad;
    if (soyad) user.soyad = soyad;
    if (email) user.email = email;
    if (telefon) user.telefon = telefon;

    // Şifre güncelleme varsa hash'le
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    // Şifreyi geri gönderme
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

module.exports = updateUserForm;