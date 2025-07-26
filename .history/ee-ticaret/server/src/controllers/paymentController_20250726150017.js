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

    if (!ad || !soyad || !email || !telefon || !adres_detay || !sehir || !posta_kodu || !sepet || !card) {
      return res.status(400).json({ message: 'Eksik bilgi gönderildi.' });
    }

    console.log('🟢 Ödeme isteği geldi:', {
      guestInfo: { ad, soyad, email, telefon, adres_detay, sehir, posta_kodu },
      sepet,
      totalPrice,
      card
    });

    const request = {
      locale: 'tr',
      conversationId: `guest_${Date.now()}`,
      price: Number(totalPrice.toFixed(2)),
      paidPrice: Number(totalPrice.toFixed(2)),
      currency: 'TRY',
      installment: '1',
      paymentChannel: 'WEB',
      paymentGroup: 'PRODUCT',
      paymentCard: {
        cardHolderName: card.cardHolderName,
        cardNumber: card.cardNumber,
        expireMonth: card.expireMonth,
        expireYear: card.expireYear,
        cvc: card.cvc,
        registerCard: '0'
      },
      buyer: {
        id: `guest_${Date.now()}`,
        name: ad,
        surname: soyad,
        gsmNumber: telefon,
        email,
        identityNumber: '11111111111', // İstersen burayı değiştir veya kaldır
        registrationAddress: adres_detay,
        city: sehir,
        country: 'Turkey',
        zipCode: posta_kodu,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '85.34.78.112'
      },
      shippingAddress: {
        contactName: `${ad} ${soyad}`,
        city: sehir,
        country: 'Turkey',
        address: adres_detay,
        zipCode: posta_kodu
      },
      billingAddress: {
        contactName: `${ad} ${soyad}`,
        city: sehir,
        country: 'Turkey',
        address: adres_detay,
        zipCode: posta_kodu
      },
      basketItems: sepet.map(item => ({
        id: item.product_id || String(Date.now()),
        name: item.translations?.tr?.title || 'Ürün',
        category1: item.category_title || 'Genel',
        itemType: 'PHYSICAL',
        price: Number(parseFloat(item.price).toFixed(2))
      }))
    };

    console.log('İyzico request objesi:', JSON.stringify(request, null, 2));

    iyzi.payment.create(request, (err, result) => {
      console.log('İyzico err:', err);
      console.log('İyzico result:', result);

      if (err || result.status !== 'success') {
        console.error('İyzico Hatası:', err || result.errorMessage);
        return res.status(400).json({
          message: 'Ödeme başarısız, lütfen tekrar deneyiniz.',
          detail: result || err
        });
      }

      res.status(200).json({ message: 'Ödeme başarılı', result });
    });

  } catch (error) {
    console.error('Sunucu hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', detail: error.message });
  }
};

module.exports = { payWithCard };
