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

      console.log("isSavedCard before",isSavedCard);
      console.log("savedCardData before",savedCardData);


    // 8. Ödeme yöntemini ekle
    if (isSavedCard && savedCardData) {
      // Son kullanma tarihini parçala
      const [expireMonth, expireYear] = savedCardData.son_kullanma.split('/');
      console.log("expireMonth",expireMonth);
      console.log("expireYear",expireYear);
      console.log("savedCardData",savedCardData);



      request.paymentCard = {
        cardHolderName: savedCardData.kart_ismi,
        cardNumber: savedCardData.kart_numarasi.replace(/\s/g, ''),
        expireMonth: expireMonth,
        expireYear: `20${expireYear}`,
        cvc: cvc.toString(),
        registerCard: "0"
      };
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

    const result = await createPayment();

    // 10. Hata durumlarını yönet
    if (result.status !== 'success') {
      console.error('❌ Ödeme Hatası:', result.errorMessage);
      
      let userMessage = result.errorMessage;
      if (result.errorCode === '5262') {
        userMessage = 'Kayıtlı kartla ödeme hatası. Lütfen kart bilgilerinizi kontrol edin.';
      } else if (result.errorCode === '12') {
        userMessage = 'Kart bilgileriniz geçersiz. Lütfen kontrol edip tekrar deneyin.';
      } else if (result.errorCode === '5046') {
        userMessage = 'Kayıtlı kart bulunamadı. Lütfen yeni kart ile ödeme yapın.';
      }

      return res.status(400).json({
        success: false,
        message: userMessage,
        errorCode: result.errorCode
      });
    }

    // 11. Başarılı yanıt
    console.log('✅ Ödeme başarılı:', result.paymentId);

    res.status(200).json({
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