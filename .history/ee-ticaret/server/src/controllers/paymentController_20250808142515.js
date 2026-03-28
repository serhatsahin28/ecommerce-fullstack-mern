const iyzipay = require('iyzipay');
const moment =require('moment');
// User modelini import etmeye artık gerek yok!

const iyzi = new iyzipay({
  apiKey: process.env.IYZI_API_KEY,
  secretKey: process.env.IYZI_SECRET_KEY,
  uri: 'https://sandbox-api.iyzipay.com'
});

const payWithCard = async (req, res) => {
  try {
    const {
      ad, soyad, email, telefon, adres_detay, sehir, posta_kodu,
      sepet, totalPrice,
      savedCardId,  // BU ALANIN ARTIK DOĞRUDAN UCS TOKEN OLDUĞUNU VARSAYIYORUZ
      cvc,
      card
    } = req.body;

    console.log('🔍 Gelen veriler:', {
      isSavedCardPayment: !!savedCardId,
      hasCVC: !!cvc
    });

    // 1. Zorunlu alan kontrolü (aynı kalabilir)...
    
    // 2. Sepet kontrolü (aynı kalabilir)...

    // --- 3. SADELEŞTİRİLMİŞ ÖDEME YÖNTEMİ KONTROLÜ ---
    let paymentMethodValid = true;
    let paymentError = '';
    let isSavedCard = !!savedCardId;

    if (isSavedCard) {
      if (!cvc || cvc.length < 3 || cvc.length > 4) {
        paymentMethodValid = false;
        paymentError = 'Kayıtlı kart için geçerli CVC kodu gereklidir (3-4 haneli)';
      }
    } else { // Yeni kart kullanılıyorsa
      if (!card || !card.cardHolderName?.trim() || !card.cardNumber || card.cardNumber.replace(/\D/g, '').length !== 16 || !card.expireMonth || !card.expireYear || !card.cvc || card.cvc.length < 3) {
        paymentMethodValid = false;
        paymentError = 'Yeni kart bilgileri eksik veya geçersiz.';
      }
      // Tarih kontrolü gibi diğer doğrulamalar buraya eklenebilir.
    }

    if (!paymentMethodValid) {
      return res.status(400).json({
        success: false,
        message: paymentError,
        errorType: 'PAYMENT_METHOD'
      });
    }
    
    // 4. Fiyat ve diğer verilerin hazırlanması (aynı kalabilir)...
    const finalPrice = Number(totalPrice.toFixed(2));
    let cleanPhone = telefon.replace(/\D/g, '');
    // ...
    const getClientIP = (req) => { /*...*/ };

    // 5. Iyzico isteğini hazırla (aynı kalabilir)...
    const request = {
      locale: 'tr',
      conversationId: `order_${moment().format('YYYYMMDDHHmmss')}_${Math.random().toString(36).substr(2, 6)}`,
      price: finalPrice.toString(),
      paidPrice: finalPrice.toString(),
      // ... buyer, shippingAddress, billingAddress, basketItems ...
    };

    // --- 6. SADELEŞTİRİLMİŞ ÖDEME KARTI BİLGİSİ EKLEME ---
    if (isSavedCard) {
      console.log('💳 UCS Token ile ödeme yapılıyor.');
      request.paymentCard = {
        ucsToken: savedCardId, // Frontend'den gelen token doğrudan kullanılır.
        cvc: cvc.toString()
      };
    } else {
      console.log('💳 Yeni kart ile ödeme yapılıyor.');
      request.paymentCard = {
        cardHolderName: card.cardHolderName.trim(),
        cardNumber: card.cardNumber.replace(/\s/g, ''),
        expireMonth: card.expireMonth.padStart(2, '0'),
        expireYear: card.expireYear.toString(),
        cvc: card.cvc.toString(),
        registerCard: '0' // İsteğe bağlı, kartı kaydetmek için '1' yapabilirsiniz
      };
    }

    // 7. Ödemeyi işle ve yanıtla (aynı kalabilir)...
    const createPayment = () => new Promise((resolve, reject) => { /*...*/ });
    const result = await createPayment();

    if (result.status !== 'success') {
      console.error('❌ Ödeme Hatası:', result);
      return res.status(400).json({
        success: false,
        message: result.errorMessage || 'Ödeme sırasında bir hata oluştu.',
        errorCode: result.errorCode
      });
    }

    res.status(200).json({
      success: true,
      message: 'Ödeme başarıyla tamamlandı',
      paymentId: result.paymentId,
      conversationId: result.conversationId,
      paidPrice: result.paidPrice
    });

  } catch (error) {
    console.error('💥 Kritik Sunucu Hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Beklenmeyen sunucu hatası',
      errorCode: 'SERVER_ERROR'
    });
  }
};

module.exports = { payWithCard };