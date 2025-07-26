const iyzipay = require('iyzipay');

const iyzi = new iyzipay({
  apiKey: process.env.IYZI_API_KEY,
  secretKey: process.env.IYZI_SECRET_KEY,
  uri: 'https://sandbox-api.iyzipay.com'
});

exports.payWithCard = async (req, res) => {
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
      price,
      card
    } = req.body;

    const request = {
      locale: 'tr',
      conversationId: Date.now().toString(),
      price: price.toFixed(2),
      paidPrice: price.toFixed(2),
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
        id: 'guest_' + Date.now(),
        name: ad,
        surname: soyad,
        gsmNumber: telefon,
        email,
        identityNumber: '11111111111', // gerçek kimlik no kullanılabilir
        registrationAddress: adres_detay,
        city: sehir,
        country: 'Turkey',
        zipCode: posta_kodu,
        ip: req.ip || '85.34.78.112'
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
      basketItems: sepet.map((item) => ({
        id: item.urun_id,
        name: item.urun_adi,
        category1: item.kategori || 'Genel',
        itemType: 'PHYSICAL',
        price: item.fiyat.toFixed(2)
      }))
    };

    iyzi.payment.create(request, (err, result) => {
      if (err || result.status !== 'success') {
        return res.status(400).json({ message: 'Ödeme başarısız', detail: result });
      }
      res.status(200).json({ message: 'Ödeme başarılı', result });
    });

  } catch (error) {
    console.error('Ödeme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};
