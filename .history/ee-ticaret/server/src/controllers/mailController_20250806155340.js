const jwt = require('jsonwebtoken');
require('dotenv').config();

const { sendEmail } = require('../utils/sendEmail'); // Dosya yolunu kendi yapınıza göre kontrol edin
// Asenkron bir fonksiyon oluşturuyoruz ve export ediyoruz
const sendOrderLink = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Lütfen bir e-posta adresi girin.' });
        }

        // 1. Kullanıcıya özel bir token oluştur.
        const token = jwt.sign({ email }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });

        // 2. Frontend'e yönlendirecek olan linki oluştur.
        const orderLink = `${process.env.FRONTEND_URL}/view-orders?token=${token}`;

        // 3. E-posta içeriğini hazırla.
        const subject = 'Siparişlerinizi Görüntüleyin';
        const htmlMessage = `
      <h1>Siparişlerim</h1>
      <p>Merhaba,</p>
      <p>Siparişlerinizi görüntülemek için aşağıdaki linke tıklayabilirsiniz. Bu link ${process.env.JWT_EXPIRES_IN} boyunca geçerlidir.</p>
      <a href="${orderLink}" style="background-color: #4CAF50; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block; border-radius: 8px;">
        Siparişlerimi Görüntüle
      </a>
      <p>Eğer link çalışmazsa, aşağıdaki adresi tarayıcınıza yapıştırabilirsiniz:</p>
      <p>${orderLink}</p>
      <hr>
      <p>Bu isteği siz yapmadıysanız, lütfen bu e-postayı dikkate almayınız.</p>
    `;

        // 4. E-postayı gönder.
        await sendEmail({
            to: email,
            subject: subject,
            html: htmlMessage,
        });

        res.status(200).json({
            success: true,
            message: `${email} adresine sipariş görüntüleme linki başarıyla gönderildi.`
        });

    } catch (error) {
        console.error('E-posta gönderme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucuda bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
        });
    }
};

// Fonksiyonu dışa aktar
module.exports = {
    sendOrderLink,
};