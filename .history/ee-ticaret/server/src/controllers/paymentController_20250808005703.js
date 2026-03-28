const iyzipay = require('iyzipay');
const moment = require('moment');

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
      card,
      savedCardId,
      cvc
    } = req.body;

    // 1. Validate mandatory fields
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

    // 2. Validate cart
    if (!Array.isArray(sepet) || sepet.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Sepet boş veya geçersiz.'
      });
    }

    // 3. Payment method validation
    let paymentMethodValid = true;
    let paymentError = '';
    
    // Case 1: Using saved card
    if (savedCardId) {
      if (!cvc || cvc.length < 3 || cvc.length > 4) {
        paymentMethodValid = false;
        paymentError = 'Kayıtlı kart için geçerli CVC kodu gereklidir (3-4 haneli)';
      }
    } 
    // Case 2: Using new card
    else {
      if (!card) {
        paymentMethodValid = false;
        paymentError = 'Kart bilgileri eksik.';
      } else {
        // Validate card fields
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
          // Validate expiry date
          const currentYear = moment().year();
          const currentMonth = moment().month() + 1;
          
          const expireYearInt = parseInt(expireYear);
          const expireMonthInt = parseInt(expireMonth);

          // Basic validation
          if (isNaN(expireMonthInt) || expireMonthInt < 1 || expireMonthInt > 12) {
            paymentMethodValid = false;
            paymentError = 'Geçersiz son kullanma ayı (01-12 arası olmalıdır)';
          }
          // Check if card is expired
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
      guestInfo: { ad, soyad, email, telefon, adres_detay, sehir, posta_kodu },
      sepet: sepet.map(item => ({
        name: item.translations?.tr?.name,
        price: item.price,
        quantity: item.quantity
      })),
      totalPrice,
      paymentMethod: savedCardId ? 'SAVED_CARD' : 'NEW_CARD'
    });

    // 4. Price validation
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

    console.log('💰 Fiyat kontrolü:', {
      frontendTotal: totalPrice,
      calculatedTotal,
      finalPrice
    });

    // 5. Phone number formatting
    let cleanPhone = telefon.replace(/\D/g, '');
    if (cleanPhone.startsWith('90')) cleanPhone = cleanPhone.substring(2);
    if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
    cleanPhone = '+90' + cleanPhone;

    // 6. Get client IP
    const getClientIP = (req) => {
      return req.headers['x-forwarded-for']?.split(',')[0].trim() || 
             req.socket?.remoteAddress || 
             '85.34.78.112';
    };

    // 7. Prepare iyzico request
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

    // 8. Add payment card details
    if (savedCardId) {
      request.paymentCard = {
        cardToken: savedCardId,
        cvc: cvc.toString()
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

    console.log('📤 İyzico request:', JSON.stringify(request, null, 2));

    // 9. Process payment
    const createPayment = () => new Promise((resolve, reject) => {
      iyzi.payment.create(request, (err, result) => {
        err ? reject(err) : resolve(result);
      });
    });

    const result = await createPayment();
    console.log('📥 İyzico response:', JSON.stringify(result, null, 2));

    // 10. Handle response
    if (result.status !== 'success') {
      console.error('❌ Ödeme Hatası:', {
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
        errorGroup: result.errorGroup
      });

      return res.status(400).json({
        success: false,
        message: result.errorMessage || 'Ödeme işlemi başarısız',
        errorCode: result.errorCode,
        errorGroup: result.errorGroup
      });
    }

    // 11. Successful payment
    console.log('✅ Ödeme Başarılı:', {
      paymentId: result.paymentId,
      amount: result.paidPrice,
      currency: result.currency
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

module.exports = { payWithCard };