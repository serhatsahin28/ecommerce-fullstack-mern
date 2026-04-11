const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Users = require("../../models/users");

const adminAuthControl = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. kullanıcıyı bul
    const user = await Users.findOne({ email, rol: "admin" });

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // 2. şifre kontrol
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Şifre yanlış" });
    }

    // 3. TOKEN OLUŞTUR
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        rol: user.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 4. RESPONSE
    return res.status(200).json({
      message: "Giriş başarılı",
      token: token,
      user: {
        id: user._id,
        email: user.email,
        rol: user.rol
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

module.exports = adminAuthControl;