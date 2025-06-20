const users = require('../models/users');
const bcrypt = require('bcryptjs');

const registerController = async (req, res) => {
  try {
    const { email, password, ad, soyad, telefon } = req.body;

    // Zorunlu alanları kontrol et
    if (!email || !password || !ad || !soyad) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Email zaten kayıtlı mı kontrol et
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 12);

    // Yeni kullanıcı oluştur
    const newUser = new users({
      ad,
      soyad,
      email,
      password: hashedPassword,
      telefon: telefon || '',
      rol: 'musteri',
      durum: 'aktif',
      kayit_tarihi: new Date(),
      son_giris: new Date(),
      adresler: [],
      favoriler: [],
      sepet: [],
      odeme_yontemleri: [],
      bildirim_tercihleri: {
        email_bildirim: true,
        sms_bildirim: false,
        kampanya_bildirimi: true
      },
      guvenlik: {
        '2fa_aktif': false,
        giris_deneme_sayisi: 0,
        hesap_kilidi: false
      }
    });

    await newUser.save();

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = registerController;
