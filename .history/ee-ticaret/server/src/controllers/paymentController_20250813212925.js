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
      card,
      saveCard = false // Yeni kart kaydedilecek mi?
    } = req.body;

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

    // 3. Kullanıcı doğrulama ve token kontrolü
    let user = null;
    let savedCardData = null;
    let isSavedCard = !!savedCardId;
    let paymentMethodValid = true;
    let paymentError = '';

    // Kullanıcı token kontrolü (kayıtlı kart veya kart kaydetme için gerekli)
    if (savedCardId || saveCard) {
      try {
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
        const userId = decodedPayload.id;

        user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'Kullanıcı bulunamadı'
          });
        }

        // Kayıtlı kart kullanılıyorsa token kontrolü
        if (savedCardId) {
          savedCardData = user.odeme_yontemleri.find(card =>
            card._id.toString() === savedCardId
          );

          if (!savedCardData) {
            return res.status(404).json({
              success: false,
              message: 'Kayıtlı kart bulunamadı'
            });
          }

          // Iyzico token kontrolü
          if (!savedCardData.iyzico_token) {
            return res.status(400).json({
              success: false,
              message: 'Kart token bilgisi bulunamadı. Lütfen kartı yeniden ekleyin.'
            });
          }

          console.log('✅ Token ile kart bulundu:', {
            cardAlias: savedCardData.kart_ismi,
            token: savedCardData.iyzico_token
          });
        }

      } catch (error) {
        console.error('❌ Kullanıcı doğrulama hatası:', error);
        return res.status(500).json({
          success: false,
          message: 'Kullanıcı bilgileri alınamadı'
        });
      }
    }

    // 4. Yeni kart doğrulaması
    if (!isSavedCard) {
      if (!card) {
        return res.status(400).json({
          success: false,
          message: 'Kart bilgileri eksik.',
          errorType: 'PAYMENT_METHOD'
        });
      }

      const { cardHolderName, cardNumber, expireMonth, expireYear, cvc: cardCvc } = card;

      if (!cardHolderName?.trim()) {
        paymentMethodValid = false;
        paymentError = 'Kart sahibi adı gereklidir.';
      }
      else if (!cardNumber || cardNumber.replace(/\D/g, '').length !== 16) {
        paymentMethodValid = false;
        paymentError = 'Geçersiz kart numarası (16 haneli olmalıdır).';
      }
      else if (!cardCvc || cardCvc.length < 3 || cardCvc.length > 4) {
        paymentMethodValid = false;
        paymentError = 'Geçersiz CVC kodu (3-4 haneli olmalıdır).';
      }
      else {
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

    // 5. CVC kontrolü (kayıtlı kart için)
    if (isSavedCard && (!cvc || cvc.length < 3 || cvc.length > 4)) {
      paymentMethodValid = false;
      paymentError = 'CVC kodu gereklidir (3-4 haneli olmalıdır).';
    }

    if (!paymentMethodValid) {
      return res.status(400).json({
        success: false,
        message: paymentError || 'Ödeme yöntemi geçersiz',
        errorType: 'PAYMENT_METHOD'
      });
    }

    // 6. Fiyat hesaplama
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

    // 7. Telefon formatlama
    let cleanPhone = telefon.replace(/\D/g, '');
    if (cleanPhone.startsWith('90')) cleanPhone = cleanPhone.substring(2);
    if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
    cleanPhone = '+90' + cleanPhone;

    // 8. IP adresi
    const getClientIP = (req) => {
      return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
        req.socket?.remoteAddress ||
        '85.34.78.112';
    };

    // 9. Temel ödeme request
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
        id: user ? user._id.toString() : `buyer_${moment().valueOf()}`,
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

    // 10. Ödeme yöntemini ayarla
    if (isSavedCard && savedCardData) {
      // TOKEN İLE ÖDEME - Iyzico'da kayıtlı kart
      request.paymentCard = {
        cardToken: savedCardData.iyzico_token,
        cvc: cvc.toString()
      };

      console.log('🔐 Token ile ödeme başlatılıyor:', {
        token: savedCardData.iyzico_token.substring(0, 10) + '...',
        cardAlias: savedCardData.kart_ismi
      });
    } else {
      // YENİ KART İLE ÖDEME
      request.paymentCard = {
        cardHolderName: card.cardHolderName.trim(),
        cardNumber: card.cardNumber.replace(/\s/g, ''),
        expireMonth: card.expireMonth.padStart(2, '0'),
        expireYear: card.expireYear.toString(),
        cvc: card.cvc.toString(),
        registerCard: saveCard && user ? '1' : '0' // Kart kaydedilecek mi?
      };

      console.log('💳 Yeni kart ile ödeme:', {
        saveCard: saveCard && user,
        cardNumber: '**** **** **** ' + card.cardNumber.slice(-4)
      });
    }

    // 11. Ödeme işlemi
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

    console.log('📤 İyzico ödeme isteği gönderiliyor...');
    const result = await createPayment();

    // 12. Sonuç kontrolü
    if (result.status !== 'success') {
      console.error('❌ IYZICO ÖDEME HATASI:', {
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
        errorGroup: result.errorGroup
      });

      return res.status(400).json({
        success: false,
        message: result.errorMessage || 'Ödeme işlemi başarısız',
        errorCode: result.errorCode
      });
    }

    // 13. Başarılı ödeme sonrası işlemler
    console.log('✅ Ödeme başarılı:', result.paymentId);

    // Yeni kart kaydedildiyse token'ı veritabanına kaydet
    if (!isSavedCard && saveCard && user && result.cardToken) {
      try {
        const newCardData = {
          kart_ismi: card.cardHolderName,
          kart_numarasi: '**** **** **** ' + card.cardNumber.slice(-4),
          son_kullanma: `${card.expireMonth}/${card.expireYear.slice(-2)}`,
          iyzico_token: result.cardToken, // İyzico'dan dönen token
          eklenme_tarihi: new Date()
        };

        user.odeme_yontemleri.push(newCardData);
        await user.save();

        console.log('💾 Yeni kart token ile kaydedildi:', result.cardToken);
      } catch (saveError) {
        console.error('⚠️ Kart kaydetme hatası:', saveError);
        // Ödeme başarılı olduğu için hata döndürmeyin, sadece log'layın
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Ödeme başarıyla tamamlandı',
      paymentId: result.paymentId,
      conversationId: result.conversationId,
      cardSaved: !isSavedCard && saveCard && user && result.cardToken ? true : false
    });

  } catch (error) {
    console.error('💥 Kritik Hata:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Beklenmeyen sunucu hatası'
    });
  }
};

// Kayıtlı kartları listeleme fonksiyonu
const getSavedCards = async (req, res) => {
  try {
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
    const userId = decodedPayload.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Sadece token'ı olan kartları döndür
    const validCards = user.odeme_yontemleri.filter(card => card.iyzico_token);

    const cards = validCards.map(card => ({
      id: card._id,
      kart_ismi: card.kart_ismi,
      kart_numarasi: card.kart_numarasi, // Zaten maskelenmiş
      son_kullanma: card.son_kullanma,
      eklenme_tarihi: card.eklenme_tarihi,
      hasToken: !!card.iyzico_token
    }));

    res.status(200).json({
      success: true,
      cards
    });

  } catch (error) {
    console.error('Kayıtlı kartları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kartlar getirilemedi'
    });
  }
};

// Kayıtlı kartı silme fonksiyonu
const deleteSavedCard = async (req, res) => {
  try {
    const { cardId } = req.params;
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
    const userId = decodedPayload.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    const cardIndex = user.odeme_yontemleri.findIndex(
      card => card._id.toString() === cardId
    );

    if (cardIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Kart bulunamadı'
      });
    }

    user.odeme_yontemleri.splice(cardIndex, 1);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Kart başarıyla silindi'
    });

  } catch (error) {
    console.error('Kart silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kart silinemedi'
    });
  }
};

module.exports = { 
  payWithCard, 
  getSavedCards, 
  deleteSavedCard 
};