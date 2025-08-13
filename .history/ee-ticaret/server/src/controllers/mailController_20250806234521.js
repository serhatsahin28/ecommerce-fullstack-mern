const jwt = require('jsonwebtoken');
require('dotenv').config();
const Order = require('../models/orders');
const { sendEmail } = require('../utils/sendEmail');

const sendOrderLink = async (req, res) => {
    try {
        const { email, lang } = req.body;

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

        // 2. Token oluştur
        const token = jwt.sign({ email }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });

        const language = ['tr', 'en'].includes(lang) ? lang : 'tr';
        const orderLink = `${process.env.FRONTEND_URL}/${language}/view-orders?token=${token}`;

        // 3. Mail metnini dile göre oluştur
        let htmlMessage;
        let subject;

        if (language === 'en') {
            subject = 'View Your Orders';
            htmlMessage = `
              <h1>My Orders</h1>
              <p>Hello,</p>
              <p>You can view your orders by clicking the link below. This link is valid for ${process.env.JWT_EXPIRES_IN}.</p>
              <a href="${orderLink}" style="background-color: #d9534f; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block; border-radius: 8px;">
                View My Orders
              </a>
              <p>If the link doesn’t work, copy and paste the following address into your browser:</p>
              <p><a href="${orderLink}">${orderLink}</a></p>
              <hr>
              <p>If you did not request this email, please ignore it.</p>
            `;
        } else {
            subject = 'Siparişlerinizi Görüntüleyin';
            htmlMessage = `
              <h1>Siparişlerim</h1>
              <p>Merhaba,</p>
              <p>Siparişlerinizi görüntülemek için aşağıdaki linke tıklayabilirsiniz. Bu link ${process.env.JWT_EXPIRES_IN} boyunca geçerlidir.</p>
              <a href="${orderLink}" style="background-color: #d9534f; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block; border-radius: 8px;">
                Siparişlerimi Görüntüle
              </a>
              <p>Eğer link çalışmazsa, aşağıdaki adresi tarayıcınıza yapıştırabilirsiniz:</p>
              <p><a href="${orderLink}">${orderLink}</a></p>
              <hr>
              <p>Bu isteği siz yapmadıysanız, lütfen bu e-postayı dikkate almayınız.</p>
            `;
        }

        // 4. Mail gönder
        await sendEmail({
            to: email,
            subject: subject,
            html: htmlMessage,
        });

        // 5. Yanıt döndür
        res.status(200).json({
            success: true,
            message: language === 'en' 
              ? 'Your one-time link is ready! Please check your email.' 
              : 'Tek seferlik bağlantınız hazır! E-postanızı kontrol edin.',
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
