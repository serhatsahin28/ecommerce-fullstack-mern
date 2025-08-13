const iyzipay = require('iyzipay');
const moment = require('moment');
const User = require('../models/users'); // User modelinizi import edin

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
      savedCardId,  // MongoDB _id veya UCS token
      savedCardToken, // Frontend'den gelen token (fallback)
      cvc,          // Kayıtlı kart için CVC
      card          // Yeni kart bilgileri
    } = req.body;

    console.log('🔍 Gelen veriler:', {
      savedCardId,
      savedCardToken,
      hasCVC: !!cvc
    });

    // 1. Zorunlu alan kontrolü
    const requiredFields = ['ad', 'soyad', 'email', 'telefon', 'adres_detay', 'sehir', 'posta_kodu', 'sepet'];
    const missingFields = {};
    let hasMissing = false;

    requiredFields.forEach(field => {
      if (!req.body[field]) {
        missingFields[field] = true;
        hasMissing = true;
      } else {
        missingFields[field] = false;
      }
    });

    if (hasMissing) {
      return res.status(400).json({
        success: false,
        message: 'Eksik bilgi gönderildi.',
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
    let isSavedCard = false;
    let actualUcsToken = null;

    // Kayıtlı kart kullanılıyorsa
    if (savedCardId) {
      console.log('🔍 Veritabanından kart araniyor, ID:', savedCardId);

      try {
        // Kullanıcıyı bulmak için token kontrolü
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          return res.status(401).json({
            success: false,
            message: 'Bu işlem için oturum açmanız gerekiyor'
          });
        }

        const token = authHeader.split(' ')[1];
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());
        const userId = decodedPayload.userId;

        // Kullanıcıyı ve kayıtlı kartları getir
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'Kullanıcı bulunamadı'
          });
        }

        // Kartı bul
        const savedCard = user.odeme_yontemleri.find(card =>
          card._id.toString() === savedCardId
        );

        if (!savedCard) {
          return res.status(404).json({
            success: false,
            message: 'Kayıtlı kart bulunamadı'
          });
        }

        // Token'ı al
        actualUcsToken = savedCard.ucsToken ||
          savedCard.ucstoken ||
          savedCard.cardToken ||
          savedCard.card_token ||
          savedCard.token;

        console.log('✅ Kart bulundu:', {
          cardId: savedCard._id,
          hasToken: !!actualUcsToken,
          tokenPreview: actualUcsToken ? actualUcsToken.substring(0, 6) + '...' : null
        });

      } catch (dbError) {
        console.error('❌ Veritabanı hatası:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Kart bilgileri alınamadı'
        });
      }
    }
    // Yeni kart kullanılıyorsa
    else {
      if (!card) {
        paymentMethodValid = false;
        paymentError = 'Kart bilgileri eksik.';
      } else {
        // Kart alanlarını kontrol et
        const { cardHolderName, cardNumber, expireMonth, expireYear, cvc: cardCvc } = card;
        if (!cardHolderName?.trim()) {
          paymentMethodValid = false;
          paymentError = 'Kart sahibi adı gereklidir.';
        }
        else if (!cardNumber || cardNumber.replace(/\D/g, '').length !== 16) {
          paymentMethodValid = false;
          paymentError = 'Geçersiz kart numarası (16 haneli olmalıdır).';
        }
        else if (!expireMonth || !expireYear) {
          paymentMethodValid = false;
          paymentError = 'Son kullanma tarihi eksik.';
        }
        else if (!cardCvc || cardCvc.length < 3 || cardCvc.length > 4) {
          paymentMethodValid = false;
          paymentError = 'Geçersiz CVC kodu (3-4 haneli olmalıdır).';
        }
        else {
          // Son kullanma tarihi kontrolü
          const currentYear = moment().year();
          const currentMonth = moment().month() + 1;

          const expireYearInt = parseInt(expireYear);
          const expireMonthInt = parseInt(expireMonth);

          if (isNaN(expireMonthInt) || expireMonthInt < 1 || expireMonthInt > 12) {
            paymentMethodValid = false;
            paymentError = 'Geçersiz son kullanma ayı (01-12 arası olmalıdır)';
          }
          else if (
            expireYearInt < currentYear ||
            (expireYearInt === currentYear && expireMonthInt < currentMonth)
          ) {
            paymentMethodValid = false;
            paymentError = 'Kartın son kullanma tarihi geçmiş';
          }
        }
      }
    }

    if (!paymentMethodValid) {
      return res.status(400).json({
        success: false,
        message: paymentError || 'Ödeme yöntemi geçersiz',
        errorType: 'PAYMENT_METHOD'
      });
    }

    console.log('🟢 Ödeme isteği geldi:', {
      paymentMethod: isSavedCard ? 'SAVED_CARD' : 'NEW_CARD',
      savedCardId,
      actualUcsToken: actualUcsToken ? actualUcsToken.substring(0, 10) + '...' : null,
      hasCVC: !!cvc,
      cardLast4: isSavedCard ? 'N/A' : card.cardNumber.slice(-4)
    });

    // 4. Fiyat hesaplama ve doğrulama
    const calculatedTotal = sepet.reduce((sum, item) => {
      const quantity = item.quantity || 1;
      const price = parseFloat(item.price) || 0;
      return sum + (price * quantity);
    }, 0);

    const finalPrice = Number(calculatedTotal.toFixed(2));

    if (isNaN(finalPrice) || finalPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz toplam tutar'
      });
    }

    // 5. Telefon numarası formatlama
    let cleanPhone = telefon.replace(/\D/g, '');
    if (cleanPhone.startsWith('90')) cleanPhone = cleanPhone.substring(2);
    if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
    cleanPhone = '+90' + cleanPhone;

    // 6. IP adresi alma
    const getClientIP = (req) => {
      return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
        req.socket?.remoteAddress ||
        '85.34.78.112';
    };

    // 7. Iyzico isteğini hazırla
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
        const unitPrice = parseFloat(item.price || 0);
        const totalItemPrice = Number((unitPrice * quantity).toFixed(2));

        return {
          id: item.product_id?.toString() || `prd_${index}_${moment().valueOf()}`,
          name: (item.translations?.tr?.title || item.name || 'Ürün').substring(0, 50),
          category1: (item.category_title || 'Genel').substring(0, 50),
          itemType: 'PHYSICAL',
          price: totalItemPrice.toString()
        };
      })
    };

    // 8. Ödeme yöntemini ekle (KRİTİK DÜZELTME)
    if (isSavedCard && actualUcsToken) {
      // KAYITLI KART İLE ÖDEME 
      console.log(savedCard);
    } else {
      // Yeni kart ile ödeme
      console.log('💳 Yeni kart ile ödeme yapılıyor');
      request.paymentCard = {
        cardHolderName: card.cardHolderName.trim(),
        cardNumber: card.cardNumber.replace(/\s/g, ''),
        expireMonth: card.expireMonth.padStart(2, '0'),
        expireYear: card.expireYear.toString(),
        cvc: card.cvc.toString(),
        registerCard: '0'
      };
    }

    // 9. İyzico isteğini logla (debug için)
    console.log('📤 İyzico isteği:', {
      conversationId: request.conversationId,
      price: request.price,
      paymentCard: {
        ucsToken: request.paymentCard.ucsToken ? request.paymentCard.ucsToken.substring(0, 10) + '...' : undefined,
        cardNumber: request.paymentCard.cardNumber ? '****' + request.paymentCard.cardNumber.slice(-4) : undefined,
        cvc: '***'
      }
    });

    // 10. Ödemeyi işle
    const createPayment = () => new Promise((resolve, reject) => {
      iyzi.payment.create(request, (err, result) => {
        if (err) {
          console.error('İyzico API Hatası:', err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    const result = await createPayment();

    // 11. Hata durumlarını yönet - GELİŞMİŞ HATA YÖNETİMİ
    if (result.status !== 'success') {
      console.error('❌ Ödeme Hatası:', {
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
        errorGroup: result.errorGroup,
        paymentMethod: isSavedCard ? 'SAVED_CARD' : 'NEW_CARD'
      });

      // Özel hata mesajları
      let userMessage = result.errorMessage;
      if (result.errorCode === '5262') {
        userMessage = 'Kayıtlı kartla ödeme hatası. Lütfen kart bilgilerinizi kontrol edin.';
      } else if (result.errorCode === '12') {
        if (isSavedCard) {
          userMessage = 'Kayıtlı kart bilgileri geçersiz. Lütfen yeni kart ile ödeme yapmayı deneyin.';
        } else {
          userMessage = 'Kart bilgileriniz geçersiz. Lütfen kontrol edip tekrar deneyin.';
        }
      } else if (result.errorCode === '5046') {
        userMessage = 'Kayıtlı kart bulunamadı. Lütfen yeni kart ile ödeme yapın.';
      }

      return res.status(400).json({
        success: false,
        message: userMessage,
        errorCode: result.errorCode,
        errorGroup: result.errorGroup,
        suggestion: isSavedCard ? 'Yeni kart ile ödeme yapmayı deneyin.' : null
      });
    }

    // 12. Başarılı yanıt
    console.log('✅ Ödeme başarılı:', {
      paymentId: result.paymentId,
      conversationId: result.conversationId
    });

    res.status(200).json({
      success: true,
      message: 'Ödeme başarıyla tamamlandı',
      paymentId: result.paymentId,
      conversationId: result.conversationId,
      paidPrice: result.paidPrice
    });

  } catch (error) {
    console.error('💥 Kritik Hata:', {
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      message: 'Beklenmeyen sunucu hatası',
      errorCode: 'SERVER_ERROR'
    });
  }
};


iyzipay.payment.create(request, (err, result) => {
  if (err) return res.status(500).json({ success: false, message: err.message });
  if (result.status === 'success') {
    return res.json({ success: true, paymentId: result.paymentId });
  }
  return res.status(400).json({ success: false, message: result.errorMessage });
});


module.exports = { payWithCard };