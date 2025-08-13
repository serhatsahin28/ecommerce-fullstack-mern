const jwt = require('jsonwebtoken');
require('dotenv').config();
const Order = require('../models/orders');
const { sendEmail } = require('../utils/sendEmail');

const sendOrderLink = async (req, res) => {

    try {
        const { email,lang } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Lütfen bir e-posta adresi girin.' });
        }

        // 1. Bu maile ait sipariş var mı?
        const existingOrders = await Order.find({ email });

        if (!existingOrders || existingOrders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Bu e-posta adresine ait herhangi bir sipariş bulunamadı.'
            });
        }

        // 2. Kullanıcıya özel bir token oluştur
        const token = jwt.sign({ email }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });
        const language = ['tr', 'en'].includes(lang) ? lang : 'tr';
        console.log(language);

        // 3. Frontend linkini hazırla
        const orderLink = `${process.env.FRONTEND_URL}/${language}/view-orders?token=${token}`;

        // 4. Mail içeriğini hazırla
        const subject = 'Siparişlerinizi Görüntüleyin';
        const htmlMessage = `
          <h1>Siparişlerim</h1>
          <p>Merhaba,</p>
          <p>Siparişlerinizi görüntülemek için aşağıdaki linke tıklayabilirsiniz. Bu link ${process.env.JWT_EXPIRES_IN} boyunca geçerlidir.</p>
          <a href="${orderLink}" style="background-color: #d9534f; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block; border-radius: 8px;">
            Siparişlerimi Görüntüle
          </a>
          <p>Eğer link çalışmazsa, aşağıdaki adresi tarayıcınıza yapıştırabilirsiniz:</p>
          <p>${orderLink}</p>
          <hr>
          <p>Bu isteği siz yapmadıysanız, lütfen bu e-postayı dikkate almayınız.</p>
        `;

        // 5. E-postayı gönder
        await sendEmail({
            to: email,
            subject: subject,
            html: htmlMessage,
        });

        // 6. Başarılı yanıt döndür
        res.status(200).json({
            success: true,
            message: 'Tek seferlik bağlantınız hazır! E-postanızı kontrol edin.',
            token: token,
        });

    } catch (error) {
        console.error('Mail sorgulama hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucuda bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
        });
    }
};

module.exports = {
    sendOrderLink,
};
