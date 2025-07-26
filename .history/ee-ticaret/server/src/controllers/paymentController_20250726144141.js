const iyzipay = require('iyzipay');

const iyzi = new iyzipay({
  apiKey: process.env.IYZI_API_KEY,
  secretKey: process.env.IYZI_SECRET_KEY,
  uri: 'https://sandbox-api.iyzipay.com' // Canlıya geçince production URI'ye çek
});

const payWithCard = async (req, res) => {
    console.log(req.body);


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
    console.log('🟢 payWithCard çalıştı');

    const request = {
      locale: 'tr',
      conversationId: `guest_${Date.now()}`,
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
        registerCard: '0' // kart kaydı yapılmayacak
      },
      buyer: {
        id: `guest_${Date.now()}`,
        name: ad,
        surname: soyad,
        gsmNumber: telefon,
        email,
        identityNumber: '11111111111', // Gerekirse kullanıcıdan alınabilir
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
      basketItems: sepet.map((item) => ({
        id: item.urun_id || String(Date.now()),
        name: item.urun_adi || 'Ürün',
        category1: item.kategori || 'Genel',
        itemType: 'PHYSICAL',
        // price: item.fiyat.toFixed(2)
        price: 0.39
      }))
    };

    iyzi.payment.create(request, (err, result) => {
      if (err || result.status !== 'success') {
        console.error('İyzico Hatası:', err || result.errorMessage);
        return res.status(400).json({
          message: 'Ödeme başarısız',
          detail: result || err
        });
      }

      // buraya sipariş kaydı, e-posta bildirimi gibi işlemler eklenebilir
      res.status(200).json({ message: 'Ödeme başarılı', result });
    });

  } catch (error) {
    console.error('Sunucu hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', detail: error.message });
  }
};


module.exports = { payWithCard };
