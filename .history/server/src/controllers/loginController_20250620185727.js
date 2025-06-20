const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Secret key .env'den okunmalı
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Giriş verilerini kontrol et
    if (!email || !password) {
      return res.status(400).json({ message: 'Lütfen e-posta ve şifre girin.' });
    }

    // 2. Kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // 3. Şifre karşılaştır
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // 4. JWT token oluştur
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        rol: user.rol,
      },
      JWT_SECRET,
      { expiresIn: '7d' } // 7 gün geçerli
    );

    // 5. Başarılı yanıt
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        ad: user.ad,
        rol: user.rol,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Sunucu hatası. Lütfen tekrar deneyin.' });
  }
};

module.exports = loginController;
