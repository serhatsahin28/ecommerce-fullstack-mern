const iyzipay = require('iyzipay');
const moment = require('moment');
const User = require('../models/users');

const iyzi = new iyzipay({
  apiKey: process.env.IYZI_API_KEY,
  secretKey: process.env.IYZI_SECRET_KEY,
  uri: 'https://sandbox-api.iyzipay.com'
});

const payWithCard = async (req, res) => {
  try {
    console.log('⏩ Gelen istek body:', req.body);

    const {
      ad,
      soyad,
      email,
      telefon,
      adres_detay,
      sehir,
      posta_kodu,
      sepet,
      totalPrice,
      savedCardId,
      cvc,
      card
    } = req.body;

    // 1. Zorunlu alan kontrolü
    const requiredFields = ['ad', 'soyad', 'email', 'telefon', 'adres_detay', 'sehir', 'posta_kodu', 'sepet'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Eksik alanlar: ${missingFields.join(', ')}`,
        missingFields
      });
    }

    // 2. Sepet kontrolü
    if (!Array.isArray(sepet) || sepet.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Sepet boş veya geçersiz.'
      });
    }

    // 3. Ödeme yöntemi kontrolü
    let paymentMethodValid = true;
    let paymentError = '';
    let isSavedCard = !!savedCardId;
    let user = null;
    let savedCardData = null;

    // Kayıtlı kart kullanılıyorsa
    if (savedCardId) {
      console.log('🔍 Veritabanından kart araniyor, ID:', savedCardId);

      try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          return res.status(401).json({
            success: false,
            message: 'Bu işlem için oturum açmanız gerekiyor'
          });
        }

        const token = authHeader.split(' ')[1];
        
        // JWT payload decode etme
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());
        const userId = decodedPayload.userId;

        // Kullanıcıyı ve kayıtlı kartları getir
        user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'Kullanıcı bulunamadı'
          });
        }

        // Kartı bul
        savedCardData = user.odeme_yontemleri.find(c => 
          c._id.toString() === savedCardId
        );

        if (!savedCardData) {
          return res.status(404).json({
            success: false,
            message: 'Kayıtlı kart bulunamadı'
          });
        }
      } catch (dbError) {
        console.error('❌ Veritabanı hatası:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Kart bilgileri alınamadı'
        });
      }
    } else if (card) {
      // ... (yeni kart validasyonları)
    }

    // 4. Fiyat hesaplama ve doğrulama
    const calculatedTotal = sepet.reduce((sum, item) => {
      return sum + (parseFloat(item.price || 0) * (parseInt(item.quantity || 1));
    }, 0);

    const finalPrice = Number(calculatedTotal.toFixed(2));

    // 5. Telefon numarası formatlama - DÜZELTME: Eksik haneleri tamamla
    let cleanPhone = telefon.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '90' + cleanPhone;
    else if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) 
      cleanPhone = '90' + cleanPhone.substring(1);
    cleanPhone = '+90' + cleanPhone;

    // 6. Iyzico isteğini hazırla
    const request = {
      locale: 'tr',
      conversationId: `order_${moment().format('YYYYMMDDHHmmss')}_${Math.random().toString(36).substr(2, 6)}`,
      price: finalPrice.toString(),
      paidPrice: finalPrice.toString(),
      currency: 'TRY',
      installment: '1',
      paymentChannel: 'WEB',
      paymentGroup: 'PRODUCT',
      buyer: {
        id: `buyer_${moment().valueOf()}`,
        name: ad.trim(),
        surname: soyad.trim(),
        gsmNumber: cleanPhone,
        email: email.trim().toLowerCase(),
        identityNumber: '11111111111', // Zorunlu alan
        registrationAddress: adres_detay.trim(),
        city: sehir.trim(),
        country: 'Turkey',
        zipCode: posta_kodu.toString(),
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '85.34.78.112'
      },
      shippingAddress: {
        contactName: `${ad.trim()} ${soyad.trim()}`,
        city: sehir.trim(),
        country: 'Turkey',
        address: adres_detay.trim(),
        zipCode: posta_kodu.toString()
      },
      billingAddress: {
        contactName: `${ad.trim()} ${soyad.trim()}`,
        city: sehir.trim(),
        country: 'Turkey',
        address: adres_detay.trim(),
        zipCode: posta_kodu.toString()
      },
      basketItems: sepet.map((item, index) => ({
        id: item.product_id?.toString() || `prd_${index}_${moment().valueOf()}`,
        name: (item.translations?.tr?.title || item.name || 'Ürün').substring(0, 50),
        category1: (item.category_title || 'Genel').substring(0, 50),
        itemType: 'PHYSICAL',
        price: ((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1).toFixed(2)
      }))
    };

    // 7. Ödeme yöntemini ekle
    if (isSavedCard && savedCardData) {
      const [expireMonth, expireYear] = savedCardData.son_kullanma.split('/');
      
      request.paymentCard = {
        cardHolderName: savedCardData.kart_ismi,
        cardNumber: savedCardData.kart_numarasi.replace(/\s/g, ''),
        expireMonth: expireMonth,
        expireYear: `20${expireYear}`, // 2030 formatında
        cvc: cvc.toString(),
        registerCard: "0"
      };
    } else {
      request.paymentCard = {
        cardHolderName: card.cardHolderName.trim(),
        cardNumber: card.cardNumber.replace(/\s/g, ''),
        expireMonth: card.expireMonth.padStart(2, '0'),
        expireYear: card.expireYear.toString(),
        cvc: card.cvc.toString(),
        registerCard: '0'
      };
    }

    // 8. Logları hassas verileri maskeleyerek ekle
    console.log('📤 İyzico isteği hazırlandı:', {
      ...request,
      paymentCard: {
        ...request.paymentCard,
        cardNumber: '****' + request.paymentCard.cardNumber.slice(-4),
        cvc: '***'
      }
    });

    // 9. Ödemeyi işle - Promise ile sarmalayın
    const result = await new Promise((resolve, reject) => {
      iyzi.payment.create(request, (err, result) => {
        if (err) {
          console.error('İyzico API Hatası:', err);
          reject(err);
        } else {
          console.log('İyzico Yanıtı:', result);
          resolve(result);
        }
      });
    });

    // 10. Iyzico yanıtını işle
    if (result.status !== 'success') {
      console.error('❌ IYZICO HATASI:', {
        errorCode: result.errorCode,
        errorMessage: result.errorMessage
      });

      return res.status(400).json({
        success: false,
        message: result.errorMessage || 'Ödeme işlemi başarısız oldu'
      });
    }

    // 11. Başarılı yanıt
    res.status(200).json({
      success: true,
      message: 'Ödeme başarıyla tamamlandı',
      paymentId: result.paymentId,
      conversationId: result.conversationId
    });

  } catch (error) {
    console.error('💥 KRİTİK HATA:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Beklenmeyen sunucu hatası'
    });
  }
};

module.exports = { payWithCard };