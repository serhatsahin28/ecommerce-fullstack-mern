const nodemailer = require('nodemailer');

// Asenkron bir fonksiyon tanımlıyoruz. Bu fonksiyon, e-posta göndermek için gerekli seçenekleri parametre olarak alacak.
const sendEmail = async (options) => {
  // 1. Bir "taşıyıcı" (transporter) oluşturuyoruz.
  // Bu, e-postayı hangi servis ve hangi hesapla göndereceğimizi belirler.
  // Bilgileri .env dosyamızdan güvenli bir şekilde alıyoruz.
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true, // Port 465 için true, diğerleri için false
    auth: {
      user: process.env.MAIL_USER, // .env'deki Gmail adresiniz
      pass: process.env.MAIL_PASS, // .env'deki Google Uygulama Şifreniz
    },
  });

  // 2. E-posta seçeneklerini (içeriğini) tanımlıyoruz.
  const mailOptions = {
    from: 'Sipariş Yönetimi <noreply@siparis.com>', // Gönderen olarak görünecek isim ve e-posta
    to: options.to,         // Fonksiyona parametre olarak gelen alıcı adresi
    subject: options.subject, // Fonksiyona parametre olarak gelen konu
    html: options.html,       // Fonksiyona parametre olarak gelen HTML içerik
  };

  // 3. Hazırladığımız taşıyıcı ve seçenekler ile e-postayı gönderiyoruz.
  await transporter.sendMail(mailOptions);
};

// Oluşturduğumuz bu fonksiyonu projenin başka yerlerinde kullanabilmek için dışa aktarıyoruz (export).
module.exports = {sendEmail};