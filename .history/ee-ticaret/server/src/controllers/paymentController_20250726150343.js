const iyzipay = require('iyzipay');

const iyzi = new iyzipay({
  apiKey: process.env.IYZI_API_KEY,
  secretKey: process.env.IYZI_SECRET_KEY,
  uri: 'https://sandbox-api.iyzipay.com' // Canlıda production URI kullan
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
      card
    } = req.body;

    // Detaylı validasyon
    if (!ad || !soyad || !email || !telefon || !adres_detay || !sehir || !posta_kodu || !sepet || !card) {
      return res.status(400).json({ 
        success: false,
        message: 'Eksik bilgi gönderildi.',
        missingFields: {
          ad: !ad,
          soyad: !soyad,
          email: !email,
          telefon: !telefon,
          adres_detay: !adres_detay,
          sehir: !sehir,
          posta_kodu: !posta_kodu,
          sepet: !sepet,
          card: !card
        }
      });
    }

    // Kart bilgileri validasyonu
    if (!card.cardHolderName || !card.cardNumber || !card.expireMonth || !card.expireYear || !card.cvc) {
      return res.status(400).json({
        success: false,
        message: 'Kart bilgileri eksik veya hatalı.'
      });
    }

    // Sepet validasyonu
    if (!Array.isArray(sepet) || sepet.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Sepet boş veya geçersiz.'
      });
    }

    console.log('🟢 Ödeme isteği geldi:', {
      guestInfo: { ad, soyad, email, telefon, adres_detay, sehir, posta_kodu },
      sepet,
      totalPrice,
      cardLast4: card.cardNumber ? card.cardNumber.slice(-4) : 'N/A'
    });

    // Toplam fiyat hesaplama ve doğrulama
    const calculatedTotal = sepet.reduce((sum, item) => {
      return sum + (parseFloat(item.price) || 0);
    }, 0);

    const finalPrice = Number(calculatedTotal.toFixed(2));
    
    console.log('💰 Fiyat kontrolü:', {
      frontendTotal: totalPrice,
      calculatedTotal: calculatedTotal,
      finalPrice: finalPrice
    });

    // Telefon numarası formatı düzeltme (başında + varsa kaldır, 0 varsa kaldır)
    let cleanPhone = telefon.replace(/\D/g, ''); // Sadece rakamları al
    if (cleanPhone.startsWith('90')) {
      cleanPhone = cleanPhone.substring(2);
    }
    if (cleanPhone.startsWith('0')) {
      cleanPhone = cleanPhone.substring(1);
    }
    cleanPhone = '+90' + cleanPhone;

    // IP adresi alma - daha güvenilir yöntem
    const getClientIP = (req) => {
      return req.headers['x-forwarded-for']?.split(',')[0] || 
             req.headers['x-real-ip'] || 
             req.connection?.remoteAddress || 
             req.socket?.remoteAddress ||
             '85.34.78.112'; // Fallback IP
    };

    const request = {
      locale: 'tr',
      conversationId: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      price: finalPrice.toString(),
      paidPrice: finalPrice.toString(),
      currency: 'TRY',
      installment: '1',
      paymentChannel: 'WEB',
      paymentGroup: 'PRODUCT',
      paymentCard: {
        cardHolderName: card.cardHolderName.trim(),
        cardNumber: card.cardNumber.replace(/\s/g, ''), // Boşlukları kaldır
        expireMonth: card.expireMonth.toString().padStart(2, '0'), // 01, 02 formatında
        expireYear: card.expireYear.toString(),
        cvc: card.cvc.toString(),
        registerCard: '0'
      },
      buyer: {
        id: `guest_${Date.now()}`,
        name: ad.trim(),
        surname: soyad.trim(),
        gsmNumber: cleanPhone,
        email: email.trim().toLowerCase(),
        identityNumber: '11111111111', // Test için sabit değer
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
      basketItems: sepet.map((item, index) => ({
        id: item.product_id?.toString() || `item_${index}_${Date.now()}`,
        name: (item.translations?.tr?.title || item.name || 'Ürün').substring(0, 50), // Max 50 karakter
        category1: (item.category_title || 'Genel').substring(0, 50),
        itemType: 'PHYSICAL',
        price: Number(parseFloat(item.price || 0).toFixed(2)).toString()
      }))
    };

    console.log('📤 İyzico request objesi:', JSON.stringify(request, null, 2));

    // Promise wrapper kullanarak async/await desteği
    const createPayment = () => {
      return new Promise((resolve, reject) => {
        iyzi.payment.create(request, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    };

    const result = await createPayment();

    console.log('📥 İyzico Sonuç:', JSON.stringify(result, null, 2));

    if (result.status !== 'success') {
      console.error('❌ Ödeme Hatası:', {
        status: result.status,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
        errorGroup: result.errorGroup
      });

      return res.status(400).json({
        success: false,
        message: 'Ödeme başarısız, lütfen tekrar deneyiniz.',
        error: {
          code: result.errorCode,
          message: result.errorMessage,
          group: result.errorGroup
        }
      });
    }

    // Başarılı ödeme
    console.log('✅ Ödeme Başarılı:', {
      paymentId: result.paymentId,
      conversationId: result.conversationId,
      paidPrice: result.paidPrice
    });

    res.status(200).json({ 
      success: true,
      message: 'Ödeme başarılı', 
      paymentId: result.paymentId,
      conversationId: result.conversationId,
      paidPrice: result.paidPrice
    });

  } catch (error) {
    console.error('💥 Sunucu hatası:', error);
    res.status(500).json({ 
      success: false,
      message: 'Sunucu hatası', 
      detail: error.message 
    });
  }
};

module.exports = { payWithCard };