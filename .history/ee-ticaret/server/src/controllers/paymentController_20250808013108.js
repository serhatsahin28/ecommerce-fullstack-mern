// payWithCard (veya paymentController.js) içine ekle/var olanın yerine koy
const iyzipay = require('iyzipay');
const moment = require('moment');
const mongoose = require('mongoose');
// <-- BURAYI KENDİ MODEL YOLUNA GÖRE DÜZELT
const User = require('../models/User'); // veya require('../models/Customer') vs.

const iyzi = new iyzipay({
  apiKey: process.env.IYZI_API_KEY,
  secretKey: process.env.IYZI_SECRET_KEY,
  uri: 'https://sandbox-api.iyzipay.com'
});

// Helper: savedCardId -> iyzico token çöz
async function resolveSavedCardToken(savedCardId) {
  try {
    if (!savedCardId) return null;
    if (!mongoose.Types.ObjectId.isValid(savedCardId)) {
      // savedCardId string ama objectId formatında değil: belki zaten token gönderilmiş
      return null;
    }

    // Örnek: kullanıcı koleksiyonunda odeme_yontemleri alanında kart kayıtlı olabilir
    // Bu sorgu, odeme_yontemleri içinde _id eşleşen öğeyi getirir
    const user = await User.findOne(
      { 'odeme_yontemleri._id': savedCardId },
      { 'odeme_yontemleri.$': 1 }
    ).lean();

    if (!user || !user.odeme_yontemleri || user.odeme_yontemleri.length === 0) return null;

    const card = user.odeme_yontemleri[0];

    // Muhtemel token alan adlarını sırayla dene
    return card?.ucsToken || card?.ucstoken || card?.cardToken || card?.card_token || card?.token || null;
  } catch (err) {
    console.error('resolveSavedCardToken hata:', err);
    return null;
  }
}

const payWithCard = async (req, res) => {
  try {
    const {
      ad, soyad, email, telefon, adres_detay, sehir, posta_kodu,
      sepet, totalPrice,
      // frontend haliyle gelebilecekler:
      savedCardId,    // eski hal: mongodb _id (muhtemelen senin frontend halen bunu gönderiyor)
      savedCardToken, // eğer frontend iyzico token gönderiyorsa burası dolu olur
      cvc, card
    } = req.body;

    console.log('Ödeme isteği: savedCardId, savedCardToken', { savedCardId, savedCardToken });

    // --- validasyonlar (kısa özet) ---
    if (!Array.isArray(sepet) || sepet.length === 0) {
      return res.status(400).json({ success:false, message:'Sepet boş veya geçersiz.' });
    }

    // Eğer frontend sadece savedCardId gönderiyor ise backend DB'den token'ı çözümle
    let resolvedToken = savedCardToken || null;
    if (!resolvedToken && savedCardId) {
      resolvedToken = await resolveSavedCardToken(savedCardId);
      console.log('Resolved token from DB:', resolvedToken ? 'FOUND' : 'NOT_FOUND');
    }

    // Artık resolvedToken ile ilerle; eğer token yok ve savedCardId verdiysen açıklayıcı hata dön
    const isSavedCardAttempt = !!(resolvedToken || savedCardId);
    if (isSavedCardAttempt && !resolvedToken) {
      // Kullanıcı frontend'e anlaşılır bir mesaj göster, arka planda log'la
      console.error('Saved card token bulunamadı. savedCardId geldi ancak token DB\'de yok veya farklı alan adı ile saklı.');
      return res.status(400).json({
        success: false,
        message: 'Seçili kayıtlı kart için sistemde geçerli bir ödeme tokenı bulunamadı. Lütfen başka bir kart seçin veya yeni kart ekleyin. (Admin: savedCardId -> token eşlemesi kontrol edilsin.)',
        debug: { savedCardId } // opsiyonel: geliştirme ortamında faydalı
      });
    }

    // Buradan sonrası senin mevcut ödeme mantığın (price hesaplama, buyer, basketItems...).
    // Örnek: request.paymentCard kurulumunda token varsa ucstoken ile ekle, yoksa yeni kart bilgisi ile ekle:

    // price hesaplama vs (senin mevcut kodunu kullan)
    const calculatedTotal = sepet.reduce((sum, item) => {
      const quantity = item.quantity || 1;
      const price = parseFloat(item.price) || 0;
      return sum + (price * quantity);
    }, 0);
    const finalPrice = Number(calculatedTotal.toFixed(2));
    if (isNaN(finalPrice) || finalPrice <= 0) {
      return res.status(400).json({ success:false, message:'Geçersiz toplam tutar' });
    }

    // prepare request object (örneğin önceki kodunu kopyala)
    const request = {
      locale: 'tr',
      conversationId: `order_${moment().format('YYYYMMDDHHmmss')}_${Math.random().toString(36).substr(2,6)}`,
      price: finalPrice.toString(),
      paidPrice: finalPrice.toString(),
      currency: 'TRY',
      installment: '1',
      paymentChannel: 'WEB',
      paymentGroup: 'PRODUCT',
      // buyer, shippingAddress, billingAddress, basketItems ... (senin mevcut kodun)
    };

    if (resolvedToken) {
      request.paymentCard = {
        ucstoken: resolvedToken,
        cvc: (cvc || '').toString()
      };
    } else {
      // yeni kart ile ödeme (senin mevcut doğrulanmış kart objeni kullan)
      request.paymentCard = {
        cardHolderName: card.cardHolderName.trim(),
        cardNumber: card.cardNumber.replace(/\s/g, ''),
        expireMonth: card.expireMonth.padStart(2,'0'),
        expireYear: card.expireYear.toString(),
        cvc: card.cvc.toString(),
        registerCard: '0'
      };
    }

    // İyzico çağrısı (senin mevcut createPayment mantığın)
    const createPayment = () => new Promise((resolve, reject) => {
      iyzi.payment.create(request, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    const result = await createPayment();
    if (result.status !== 'success') {
      console.error('İyzico hata:', result);
      return res.status(400).json({ success:false, message: result.errorMessage || 'Ödeme hatası', errorCode: result.errorCode });
    }

    return res.status(200).json({ success:true, message:'Ödeme başarıyla tamamlandı', paymentId: result.paymentId, conversationId: result.conversationId, paidPrice: result.paidPrice });

  } catch (err) {
    console.error('payWithCard kritik hata:', err);
    return res.status(500).json({ success:false, message:'Beklenmeyen sunucu hatası' });
  }
};

module.exports = { payWithCard };
