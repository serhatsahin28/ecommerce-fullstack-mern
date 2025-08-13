// controllers/mailController.js
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { saveToken } = require("../utils/token"); // DB'ye token kaydetmek için
require("dotenv").config();

exports.sendMagicLink = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "E-posta gerekli" });

  try {
    // Token üret (isteğe bağlı: JWT de olabilir)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 1000 * 60 * 15; // 15 dakika geçerli

    // DB’ye kaydet
    await saveToken({ email, token, expiresAt });

    // Magic Link URL
    const link = `${process.env.FRONTEND_URL}/siparis-takip?token=${token}`;

    // E-posta gönderimi
    const transporter = nodemailer.createTransport({
      service: "gmail", // veya SMTP ayarın
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Sipariş Takibi" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Sipariş Takip Linkiniz",
      html: `<p>Merhaba,</p>
             <p>Siparişlerinizi görüntülemek için aşağıdaki bağlantıya tıklayın:</p>
             <a href="${link}">Siparişleri Görüntüle</a>
             <p>Bu bağlantı 15 dakika geçerlidir.</p>`,
    });

    return res.status(200).json({ message: "Link gönderildi" });
  } catch (err) {
    console.error("Mail gönderim hatası:", err);
    res.status(500).json({ message: "Mail gönderilemedi" });
  }
};
