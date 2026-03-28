const users = require('../models/users');
const bcrypt = require('bcryptjs');

const updateUserForm = async (req, res) => {
 const { ad, soyad, email, telefon, tcKimlikNo, adres_detay, sehir, ilce, posta_kodu } = req.body;

  try {
    await User.findByIdAndUpdate(req.user.id, {
      ad,
      soyad,
      email,
      telefon,
      tcKimlikNo,
      $set: {
        'adresler.0.adres_detay': adres_detay,
        'adresler.0.sehir': sehir,
        'adresler.0.ilce': ilce,
        'adresler.0.posta_kodu': posta_kodu
      }
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Bilgi güncelleme başarısız.' });
  }
};

module.exports = updateUserForm;