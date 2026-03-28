const iyzipay = require('iyzipay');

const iyzi = new iyzipay({
  apiKey: process.env.IYZI_API_KEY,
  secretKey: process.env.IYZI_SECRET_KEY,
  uri: 'https://sandbox-api.iyzipay.com'
});

exports.createCheckoutForm = (data) => {
  return new Promise((resolve, reject) => {
    const request = {
      locale: 'tr',
      conversationId: Date.now().toString(),
      price: data.price,
      paidPrice: data.price,
      currency: 'TRY',
      basketId: 'B67832',
      paymentGroup: 'PRODUCT',
      callbackUrl: 'https://seninsite.com/api/payment/callback',
      buyer: {
        id: 'BY123',
        name: data.ad,
        surname: data.soyad,
        gsmNumber: data.telefon,
        email: data.email,
        identityNumber: '11111111111',
        registrationAddress: data.adres,
        city: data.sehir,
        country: 'Turkey',
        zipCode: data.posta_kodu,
        ip: data.ip
      },
      shippingAddress: {
        contactName: `${data.ad} ${data.soyad}`,
        city: data.sehir,
        country: 'Turkey',
        address: data.adres,
        zipCode: data.posta_kodu
      },
      billingAddress: {
        contactName: `${data.ad} ${data.soyad}`,
        city: data.sehir,
        country: 'Turkey',
        address: data.adres,
        zipCode: data.posta_kodu
      },
      basketItems: data.sepet.map((item, index) => ({
        id: item.urun_id,
        name: item.urun_adi,
        category1: item.kategori || 'Genel',
        itemType: 'PHYSICAL',
        price: item.fiyat.toFixed(2)
      }))
    };

    iyzi.checkoutFormInitialize.create(request, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};
