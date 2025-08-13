const users = require('../models/users');
const bcrypt = require('bcryptjs');

const registerController = async (req, res) => {
  try {
    const { email, password, phone, first_name, last_name } = req.body;
    console.log(req.body);
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new users({
      email,
      password: hashedPassword,
      ad: first_name,
      soyad: last_name,
      telefon: phone,
      rol: 'musteri',
      durum: 'aktif',
      kayit_tarihi: new Date(),
      son_giris: null,
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




    // await newUser.save();

    return res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = registerController;
