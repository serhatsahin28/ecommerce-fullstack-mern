// controllers/paymentController.js

const iyzipay = require('iyzipay');
const moment = require('moment');
const User = require('../models/users'); // User modelinizin doğru yolda olduğundan emin olun

// Iyzico konfigürasyonu
const iyzi = new iyzipay({
  apiKey: process.env.IYZI_API_KEY,
  secretKey: process.env.IYZI_SECRET_KEY,
  uri: 'https://sandbox-api.iyzipay.com' // Canlı ortama geçerken 'https://api.iyzipay.com' olmalı
});

const payWithCard = async (req, res) => {
  try {
    const {
      ad, soyad, email, telefon, adres_detay, sehir, posta_kodu,
      sepet, totalPrice,
      savedCardId, // Sadece bu ID yeterli
      cvc,         // Kayıtlı kart için CVC
      card         // Yeni kart bilgileri (kayıtlı kart seçiliyse bu `null` gelecek)
    } = req.body;

    // --- 1. Ödeme Yöntemi ve Kullanıcı Doğrulama ---
    let isSavedCard = !!savedCardId;
    let actualUcsToken = null;
    let cardUserKey = null; // UCS ödemeleri için genellikle gereklidir.

    if (isSavedCard) {
      console.log('🔍 Kayıtlı kart ile ödeme işlemi. Kart ID:', savedCardId);

      if (!req.headers.authorization) {
        return res.status(401).json({ success: false, message: 'Bu işlem için oturum açmanız gerekiyor.' });
      }
      const token = req.headers.authorization.split(' ')[1];
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const user = await User.findById(payload.userId).select('+odeme_yontemleri');

      if (!user) {
        return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
      }

      const savedCardData = user.odeme_yontemleri.find(c => c._id.toString() === savedCardId);
      if (!savedCardData) {
        return res.status(404).json({ success: false, message: 'Seçilen kayıtlı kart bulunamadı.' });
      }

      // Veritabanından Iyzico token'ını al
      actualUcsToken = savedCardData.ucsToken || savedCardData.cardToken; // Yaygın kullanılan isimler
      cardUserKey = user.cardUserKey; // Kart kaydederken alınan user key

      if (!actualUcsToken) {
        console.error('❌ KRİTİK HATA: Veritabanında kart var ama UCS token alanı boş!', { cardId: savedCardId, userId: user._id });
        return res.status(500).json({ success: false, message: 'Kayıtlı kart bilgileri eksik. Lütfen yeni bir kartla ödeme yapın veya müşteri hizmetleriyle iletişime geçin.' });
      }

      console.log('✅ Kart ve UCS token başarıyla bulundu.');

    } else if (!card || !card.cardHolderName || !card.cardNumber || !card.expireMonth || !card.expireYear || !card.cvc) {
      return res.status(400).json({ success: false, message: 'Yeni kartla ödeme için tüm kart bilgileri zorunludur.' });
    }

    // --- 2. Gerekli Diğer Bilgilerin Kontrolü ---
    if (!ad || !soyad || !email || !telefon || !adres_detay || !sehir || !posta_kodu || !sepet || sepet.length === 0) {
      return res.status(400).json({ success: false, message: 'Teslimat ve sepet bilgileri eksik.' });
    }

    // --- 3. Iyzico İstek Nesnesini Oluşturma ---
    const finalPrice = Number(totalPrice.toFixed(2));
    const cleanPhone = '+90' + telefon.replace(/\D/g, '').slice(-10);
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || '85.34.78.112';

    const request = {
      locale: 'tr',
      conversationId: `CONV_${moment().valueOf()}`,
      price: finalPrice.toString(),
      paidPrice: finalPrice.toString(),
      currency: 'TRY',
      installment: '1',
      paymentChannel: 'WEB',
      paymentGroup: 'PRODUCT',
      buyer: {
        id: `BUYER_${moment().valueOf()}`,
        name: ad.trim(),
        surname: soyad.trim(),
        gsmNumber: cleanPhone,
        email: email.trim().toLowerCase(),
        identityNumber: '11111111111', // TC Kimlik No zorunlu değilse temsili bir değer
        registrationAddress: adres_detay.trim(),
        city: sehir.trim(),
        country: 'Turkey',
        zipCode: posta_kodu.toString().trim(),
        ip: clientIp
      },
      shippingAddress: {
        contactName: `${ad.trim()} ${soyad.trim()}`,
        city: sehir.trim(),
        country: 'Turkey',
        address: adres_detay.trim(),
        zipCode: posta_kodu.toString().trim()
      },
      billingAddress: {
        contactName: `${ad.trim()} ${soyad.trim()}`,
        city: sehir.trim(),
        country: 'Turkey',
        address: adres_detay.trim(),
        zipCode: posta_kodu.toString().trim()
      },
      basketItems: sepet.map((item, index) => ({
        id: item.product_id?.toString() || `PRD_${index}`,
        name: (item.translations?.tr?.title || item.name || 'Ürün').substring(0, 50),
        category1: (item.category_title || 'Genel').substring(0, 50),
        itemType: 'PHYSICAL',
        price: ((item.price || 0) * (item.quantity || 1)).toFixed(2).toString()
      }))
    };

    // --- 4. Ödeme Kartı Bilgisini Ekleme (Düzeltilmiş Mantık) ---
    if (isSavedCard) {
      // KAYITLI KART BİLGİLERİ
      request.paymentCard = {
        ucsToken: actualUcsToken,
        cardUserKey: cardUserKey, // Eğer cardUserKey'i kullanıcı bazlı saklıyorsanız ekleyin
        cvc: cvc.toString()
      };
    } else {
      // YENİ KART BİLGİLERİ
      request.paymentCard = {
        cardHolderName: card.cardHolderName.trim(),
        cardNumber: card.cardNumber.replace(/\s/g, ''),
        expireMonth: card.expireMonth.padStart(2, '0'),
        expireYear: card.expireYear,
        cvc: card.cvc.toString(),
        registerCard: '0' // Kartı kaydetmek istemiyorsak '0'
      };
    }

    // --- 5. Ödemeyi Gerçekleştirme ---
    console.log(`📤 Iyzico'ya ödeme isteği gönderiliyor. Yöntem: ${isSavedCard ? 'Kayıtlı Kart' : 'Yeni Kart'}`);

    const result = await new Promise((resolve, reject) => {
      iyzi.payment.create(request, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    // --- 6. Sonucu İşleme ---
    if (result.status !== 'success') {
      console.error('❌ Iyzico Ödeme Hatası:', {
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
        errorGroup: result.errorGroup,
      });
      return res.status(400).json({
        success: false,
        message: result.errorMessage || 'Ödeme bankanız tarafından onaylanmadı.',
        errorCode: result.errorCode,
      });
    }

    console.log('✅ Ödeme Başarılı!', { paymentId: result.paymentId });
    res.status(200).json({
      success: true,
      message: 'Ödeme başarıyla tamamlandı.',
      paymentId: result.paymentId,
      paidPrice: result.paidPrice
    });

  } catch (error) {
    console.error('💥 SUNUCU HATASI (paymentController):', error);
    res.status(500).json({
      success: false,
      message: 'Ödeme işlemi sırasında beklenmedik bir sunucu hatası oluştu. Lütfen tekrar deneyin.',
      errorCode: 'INTERNAL_SERVER_ERROR'
    });
  }
};

module.exports = { payWithCard };