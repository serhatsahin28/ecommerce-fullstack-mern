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


    console.log('🔍 Gelen istek:', {
      savedCardId,
      hasCvc: !!cvc,
      hasCard: !!card,
      cardData: card ? { ...card, cardNumber: '****', cvc: '***' } : null
    });

    // 1. Zorunlu alan kontrolü
    const requiredFields = ['ad', 'soyad', 'email', 'telefon', 'adres_detay', 'sehir', 'posta_kodu', 'sepet'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Eksik bilgi gönderildi.',
        missingFields: missingFields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
      });
    }

    // 2. Sepet kontrolü
    if (!Array.isArray(sepet) || sepet.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Sepet boş veya geçersiz.'
      });
    }

    // 3. Ödeme yöntemi belirleme
    const isSavedCard = !!savedCardId;
    let user = null;
    let savedCardToken = null;

    // Kayıtlı kart kullanılacaksa
    if (isSavedCard) {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          return res.status(401).json({
            success: false,
            message: 'Bu işlem için oturum açmanız gerekiyor'
          });
        }

        const token = authHeader.split(' ')[1];
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const userId = payload.userId || payload.id; // İki farklı alan da denenir

        user = await User.findById(userId).select('odeme_yontemleri');
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'Kullanıcı bulunamadı'
          });
        }

        savedCardToken = user.odeme_yontemleri.id(savedCardId);
        console.log("savedCardToken",savedCardToken);
        if (!savedCardToken) {
          return res.status(404).json({
            success: false,
            message: 'Kayıtlı kart bulunamadı'
          });
        }

        // CVC kontrolü kayıtlı kart için zorunlu
        if (!cvc || cvc.length < 3) {
          return res.status(400).json({
            success: false,
            message: 'Güvenlik kodu (CVC) gereklidir'
          });
        }

        console.log('✅ Kayıtlı kart bulundu:', {
          cardId: savedCardToken._id,
          maskedNumber: savedCardToken. masked_number,
          hasToken: !!savedCardToken.kart_token
        });

      } catch (error) {
        console.error('❌ Kayıtlı kart hatası:', error);
        return res.status(500).json({
          success: false,
          message: 'Kart bilgileri alınamadı'
        });
      }
    }
    // Yeni kart kontrolü
    else if (card) {
      const { cardHolderName, cardNumber, expireMonth, expireYear, cvc: cardCvc } = card;
      const errors = [];

      if (!cardHolderName?.trim()) errors.push('Kart sahibi adı gereklidir.');
      if (!cardNumber || cardNumber.replace(/\D/g, '').length !== 16) errors.push('Geçersiz kart numarası');
      if (!cardCvc || cardCvc.length < 3 || cardCvc.length > 4) errors.push('Geçersiz CVC kodu');

      if (errors.length === 0) {
        const currentYear = moment().year();
        const currentMonth = moment().month() + 1;
        const expireYearInt = parseInt(expireYear);
        const expireMonthInt = parseInt(expireMonth);

        if (isNaN(expireMonthInt) || expireMonthInt < 1 || expireMonthInt > 12) {
          errors.push('Geçersiz son kullanma ayı');
        }
        else if (expireYearInt < currentYear || (expireYearInt === currentYear && expireMonthInt < currentMonth)) {
          errors.push('Kartın son kullanma tarihi geçmiş');
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: errors.join(', '),
          errorType: 'PAYMENT_METHOD'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Kart bilgileri eksik.',
        errorType: 'PAYMENT_METHOD'
      });
    }

    // 4. Fiyat hesaplama
    const finalPrice = sepet.reduce((sum, item) => {
      const quantity = item.quantity || 1;
      const price = parseFloat(item.price) || 0;
      return sum + (price * quantity);
    }, 0);

    if (isNaN(finalPrice) || finalPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz toplam tutar'
      });
    }

    // 5. Telefon formatlama
    const cleanPhone = '+90' + telefon.replace(/\D/g, '').replace(/^90/, '').replace(/^0/, '');

    // 6. IP adresi alma
    const getClientIP = (req) => {
      return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
        req.socket?.remoteAddress ||
        '127.0.0.1';
    };

    // 7. Iyzico isteği hazırlama
    const request = {
      locale: 'tr',
      conversationId: `order_${moment().format('YYYYMMDDHHmmss')}_${Math.random().toString(36).slice(2, 8)}`,
      price: finalPrice.toFixed(2),
      paidPrice: finalPrice.toFixed(2),
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
        identityNumber: '11111111111',
        registrationAddress: adres_detay.trim(),
        city: sehir.trim(),
        country: 'Turkey',
        zipCode: posta_kodu.toString(),
        ip: getClientIP(req)
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
      basketItems: sepet.map((item, index) => {
        const quantity = item.quantity || 1;
        const unitPrice = parseFloat(item.price) || 0;
        const totalItemPrice = (unitPrice * quantity).toFixed(2);

        return {
          id: item.product_id?.toString() || `prd_${index}_${Date.now()}`,
          name: (item.translations?.tr?.title || item.name || 'Ürün').substring(0, 50),
          category1: (item.category_title || 'Genel').substring(0, 50),
          itemType: 'PHYSICAL',
          price: totalItemPrice
        };
      })
    };

    // 8. Ödeme kartı bilgilerini ayarlama
    if (isSavedCard && savedCardToken) {
      console.log('🔄 Kayıtlı kart ile ödeme başlatılıyor...');

      // Mevcut token varsa kullan
      if (savedCardToken.kart_token && savedCardToken.card_user_key) {
        console.log('✅ Mevcut token kullanılıyor');
        request.cardToken = savedCardToken. kart_token;
        request.cardUserKey = savedCardToken.card_user_key;
      }
      // Token yoksa kart bilgileriyle ödeme yap
      else {
        console.log('⚠️ Token yok, kart bilgileriyle ödeme yapılıyor');

        // Kart bilgilerini kontrol et
        if (!savedCardToken.kart_numarasi || !savedCardToken.son_kullanma || !savedCardToken.kart_ismi) {
          return res.status(400).json({
            success: false,
            message: 'Kayıtlı kart bilgileri eksik veya bozuk'
          });
        }

        const [expireMonth, expireYear] = savedCardToken.son_kullanma.split('/');

        if (!expireMonth || !expireYear) {
          return res.status(400).json({
            success: false,
            message: 'Kayıtlı kartın son kullanma tarihi geçersiz'
          });
        }

        request.paymentCard = {
          cardHolderName: savedCardToken.kart_ismi,
          cardNumber: savedCardToken.masked_number.replace(/\s/g, ''),
       expireMonth: '12', 
        expireYear: '2020',
          cvc: cvc.toString(),
          // registerCard: "0" // Token oluşturmak için "1" yapabilirsiniz
        };
      }
    } else {
      // Yeni kart ile ödeme
      console.log('🔄 Yeni kart ile ödeme başlatılıyor...');
      request.paymentCard = {
        cardHolderName: card.cardHolderName.trim(),
        cardNumber: card.cardNumber.replace(/\s/g, ''),
        expireMonth: card.expireMonth.padStart(2, '0'),
        expireYear: card.expireYear.toString(),
        cvc: card.cvc.toString(),
        registerCard: '0'
      };
    }

    // 9. Ödemeyi işle
    console.log('💳 Iyzico\'ya ödeme isteği gönderiliyor...', {
      hasToken: !!request.cardToken,
      hasCard: !!request.paymentCard,
      price: request.price
    });

    const result = await new Promise((resolve, reject) => {
      iyzi.payment.create(request, (err, result) => {
        err ? reject(err) : resolve(result);
      });
    });

    console.log('📥 Iyzico yanıtı:', {
      status: result.status,
      paymentId: result.paymentId,
      errorMessage: result.errorMessage
    });

    // 10. Sonucu değerlendir
    if (result.status !== 'success') {
      console.error('❌ IYZICO HATASI:', result.errorMessage);
      return res.status(400).json({
        success: false,
        message: result.errorMessage || 'Ödeme işlemi başarısız'
      });
    }

    // Token oluşturulduysa kaydet (opsiyonel)
    if (result.cardToken && result.cardUserKey && isSavedCard && savedCardToken) {
      try {
        await User.updateOne(
          { _id: user._id, 'odeme_yontemleri._id': savedCardToken._id },
          {
            $set: {
              'odeme_yontemleri.$.cardToken': result.cardToken,
              'odeme_yontemleri.$.cardUserKey': result.cardUserKey
            }
          }
        );
        console.log('✅ Token kaydedildi');
      } catch (tokenError) {
        console.error('⚠️ Token kaydedilemedi:', tokenError);
      }
    }

    // Başarılı işlem
    console.log('✅ Ödeme başarılı!', result.paymentId);
    return res.status(200).json({
      success: true,
      message: 'Ödeme başarıyla tamamlandı',
      paymentId: result.paymentId,
      conversationId: result.conversationId
    });

  } catch (error) {
    console.error('💥 Kritik Hata:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Beklenmeyen sunucu hatası'
    });
  }
};

module.exports = { payWithCard };