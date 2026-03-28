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

    // 1. Zorunlu alan kontrolü (kısaltılmış)
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

    // 3. Ödeme yöntemi kontrolü
    let isSavedCard = !!savedCardId;
    let user = null;
    let savedCardData = null;

    // Kayıtlı kart kullanılıyorsa
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
        const userId = payload.id;

        user = await User.findById(userId).select('odeme_yontemleri');
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'Kullanıcı bulunamadı'
          });
        }

        savedCardData = user.odeme_yontemleri.id(savedCardId);
        if (!savedCardData) {
          return res.status(404).json({
            success: false,
            message: 'Kayıtlı kart bulunamadı'
          });
        }

        // Kart verileri kontrolü (EKLEDİK)
        if (!savedCardData.kart_numarasi || !savedCardData.son_kullanma) {
          return res.status(400).json({
            success: false,
            message: 'Kayıtlı kart bilgileri eksik'
          });
        }

      } catch (error) {
        console.error('❌ Veritabanı hatası:', error);
        return res.status(500).json({
          success: false,
          message: 'Kart bilgileri alınamadı'
        });
      }
    }
    // Yeni kart kullanılıyorsa
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

    // 5. Telefon formatlama (güvenli hale getirildi)
    const cleanPhone = '+90' + telefon.replace(/\D/g, '').replace(/^90/, '').replace(/^0/, '');

    // 6. IP adresi alma
    const getClientIP = (req) => {
      return req.headers['x-forwarded-for']?.split(',')[0].trim() || 
             req.socket?.remoteAddress || 
             '127.0.0.1';
    };

    // 7. Iyzico isteği
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

    // 8. Ödeme yöntemi (güvenli hale getirildi)
    if (isSavedCard && savedCardData) {
      // Token varsa kullan
      if (savedCardData.cardToken) {
        request.cardToken = savedCardData.cardToken;
        request.cardUserKey = savedCardData.cardUserKey;
      } 
      // Token yoksa oluştur
      else {
        try {
          const [expireMonth, expireYear] = savedCardData.son_kullanma.split('/');
          
          const tokenRequest = {
            card: {
              cardHolderName: savedCardData.kart_ismi,
              cardNumber: (savedCardData.kart_numarasi || '').replace(/\s/g, ''),
              expireMonth: expireMonth,
              expireYear: `20${expireYear}`,
              cvc: cvc.toString()
            },
            locale: 'tr'
          };

          const tokenResult = await new Promise((resolve, reject) => {
            iyzi.card.create(tokenRequest, (err, result) => {
              err ? reject(err) : resolve(result);
            });
          });

          if (tokenResult.status === 'success') {
            request.cardToken = tokenResult.cardToken;
            request.cardUserKey = tokenResult.cardUserKey;
            
            // Token'ı veritabanına kaydet
            await User.updateOne(
              { _id: user._id, 'odeme_yontemleri._id': savedCardData._id },
              { 
                $set: { 
                  'odeme_yontemleri.$.cardToken': tokenResult.cardToken,
                  'odeme_yontemleri.$.cardUserKey': tokenResult.cardUserKey
                } 
              }
            );
          } else {
            // Fallback: Normal ödeme
            request.paymentCard = {
              cardHolderName: savedCardData.kart_ismi,
              cardNumber: (savedCardData.kart_numarasi || '').replace(/\s/g, ''),
              expireMonth: expireMonth,
              expireYear: `20${expireYear}`,
              cvc: cvc.toString(),
              registerCard: "0"
            };
          }
        } catch (tokenError) {
          console.error('Token oluşturma hatası:', tokenError);
          // Hata durumunda normal ödeme
          const [expireMonth, expireYear] = savedCardData.son_kullanma.split('/');
          request.paymentCard = {
            cardHolderName: savedCardData.kart_ismi,
            cardNumber: (savedCardData.kart_numarasi || '').replace(/\s/g, ''),
            expireMonth: expireMonth,
            expireYear: `20${expireYear}`,
            cvc: cvc.toString(),
            registerCard: "0"
          };
        }
      }
    } else {
      // Yeni kart ile ödeme
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
    const result = await new Promise((resolve, reject) => {
      iyzi.payment.create(request, (err, result) => {
        err ? reject(err) : resolve(result);
      });
    });

    // 10. Hata durumlarını yönet
    if (result.status !== 'success') {
      console.error('❌ IYZICO HATASI:', result.errorMessage);
      return res.status(400).json({
        success: false,
        message: result.errorMessage || 'Ödeme işlemi başarısız'
      });
    }

    // Başarılı işlem
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