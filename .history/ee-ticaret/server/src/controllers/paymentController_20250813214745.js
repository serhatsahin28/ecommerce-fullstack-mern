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
    console.log(telefon);

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
    let isSavedCard = !!savedCardId;
    let user = null;
    let savedCardData = null; // Kayıtlı kart verilerini saklamak için

    // Kayıtlı kart kullanılıyorsa
    if (savedCardId) {
      console.log('🔍 Veritabanından kart araniyor, ID:', savedCardId);

      try {
        const authHeader = req.headers.authorization;

        console.log("authHeader: ", authHeader);
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
        // console.log("decodedPayload",decodedPayload);
        // console.log("userId",userId);

        // Kullanıcıyı ve kayıtlı kartları getir
        user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'Kullanıcı bulunamadı'
          });
        }

        // Kartı bul
        savedCardData = user.odeme_yontemleri.find(card =>
          card._id.toString() === savedCardId
        );

        if (!savedCardData) {
          return res.status(404).json({
            success: false,
            message: 'Kayıtlı kart bulunamadı'
          });
        }

        console.log('✅ Kart bulundu:', savedCardData);

      } catch (dbError) {
        console.error('❌ Veritabanı hatası:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Kart bilgileri alınamadı'
        });
      }
    }
    // Yeni kart kullanılıyorsa
    else if (card) {
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
    } else {
      paymentMethodValid = false;
      paymentError = 'Kart bilgileri eksik.';
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
      hasCVC: !!cvc
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
    console.log(cleanPhone);
    // 6. IP adresi alma
    const getClientIP = (req) => {
      return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
        req.socket?.remoteAddress;
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

    console.log("isSavedCard before", isSavedCard);
    console.log("savedCardData before", savedCardData);


    // 8. Ödeme yöntemini ekle
    // ... (üst kısım aynı kalır) ...

    if (isSavedCard && savedCardData) {
      // 1. TOKEN KONTROLÜ VE ÖDEME
      if (savedCardData.cardToken) {
        // Token varsa doğrudan kullan
        request.cardToken = savedCardData.cardToken;
        request.cardUserKey = savedCardData.cardUserKey; // Müşteri anahtarı

        console.log('🔐 Kayıtlı token ile ödeme yapılıyor');
      }
      // 2. TOKEN YOKSA YENİ TOKEN OLUŞTUR
      else {
        try {
          // Token oluşturma isteği
          const tokenRequest = {
            card: {
              cardHolderName: savedCardData.kart_ismi,
              cardNumber: savedCardData.kart_numarasi.replace(/\s/g, ''),
              expireMonth: savedCardData.son_kullanma.split('/')[0],
              expireYear: `20${savedCardData.son_kullanma.split('/')[1]}`,
              cvc: cvc.toString()
            },
            locale: 'tr'
          };

          // Token oluşturma fonksiyonu
          const createToken = () => new Promise((resolve, reject) => {
            iyzi.card.create(tokenRequest, (err, tokenResult) => {
              if (err) reject(err);
              else resolve(tokenResult);
            });
          });

          const tokenResult = await createToken();

          // 3. TOKEN OLUŞTURMA BAŞARISIZSA FALLBACK
          if (tokenResult.status !== 'success') {
            console.warn('⚠️ Token oluşturulamadı, standart ödeme deneniyor', {
              error: tokenResult.errorMessage
            });

            // Fallback: Normal kart bilgileriyle ödeme
            const [expireMonth, expireYear] = savedCardData.son_kullanma.split('/');
            request.paymentCard = {
              cardHolderName: savedCardData.kart_ismi,
              cardNumber: savedCardData.kart_numarasi.replace(/\s/g, ''),
              expireMonth: expireMonth,
              expireYear: `20${expireYear}`,
              cvc: cvc.toString(),
              registerCard: "0"
            };
          }
          // 4. TOKEN BAŞARIYLA OLUŞTUYSA KULLAN
          else {
            console.log('🆕 Yeni token oluşturuldu:', tokenResult.cardToken);

            // Token'ı requeste ekle
            request.cardToken = tokenResult.cardToken;
            request.cardUserKey = tokenResult.cardUserKey;

            // Veritabanında token'ı güncelle
            await User.updateOne(
              {
                _id: user._id,
                'odeme_yontemleri._id': savedCardData._id
              },
              {
                $set: {
                  'odeme_yontemleri.$.cardToken': tokenResult.cardToken,
                  'odeme_yontemleri.$.cardUserKey': tokenResult.cardUserKey
                }
              }
            );
          }
        } catch (tokenError) {
          console.error('❌ Token oluşturma hatası:', tokenError);
          // Hata durumunda normal ödemeye devam et
          const [expireMonth, expireYear] = savedCardData.son_kullanma.split('/');
          request.paymentCard = {
            cardHolderName: savedCardData.kart_ismi,
            cardNumber: savedCardData.kart_numarasi.replace(/\s/g, ''),
            expireMonth: expireMonth,
            expireYear: `20${expireYear}`,
            cvc: cvc.toString(),
            registerCard: "0"
          };
        }
      }
    }

    // ... (alt kısım aynı kalır) ...

    console.log('📤 İyzico isteği hazırlandı');

    // 9. Ödemeyi işle
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
    console.log("Iyzico Request:", {
      paymentCard: request.paymentCard,
      buyer: request.buyer,
      basketItems: request.basketItems
    });
    const result = await createPayment();

    // 10. Hata durumlarını yönet
    if (result.status !== 'success') {
      console.error('❌ IYZICO HATASI:', {
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
        errorGroup: result.errorGroup
      });

      return res.status(400).json({
        success: false,
        message: result.errorMessage
      });
    }

    // Başarılı işlem
    console.log('✅ Ödeme başarılı:', result.paymentId);

    return res.status(200).json({
      success: true,
      message: 'Ödeme başarıyla tamamlandı',
      paymentId: result.paymentId,
      conversationId: result.conversationId
    });


  } catch (error) {
    console.error('💥 Kritik Hata:', error.message);

    res.status(500).json({
      success: false,
      message: error.message || 'Beklenmeyen sunucu hatası'
    });
  }




};

module.exports = { payWithCard };