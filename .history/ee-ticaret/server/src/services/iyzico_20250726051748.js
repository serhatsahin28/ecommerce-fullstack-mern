const iyzipay = require('iyzipay');
require('dotenv').config();

const iyzi = new iyzipay({
  apiKey: process.env.IYZI_API_KEY,
  secretKey: process.env.IYZI_SECRET_KEY,
  uri: 'https://sandbox-api.iyzipay.com' // Prod için değiştirilebilir
});

exports.createCheckoutForm = (data) => {
  return new Promise((resolve, reject) => {
    try {
      if (!data.price || !data.sepet || !Array.isArray(data.sepet) || data.sepet.length === 0) {
        return reject(new Error('Geçersiz fiyat veya sepet bilgisi.'));
      }

      // Sepetteki ürünleri uygun formata çevir
      const basketItems = data.sepet.map((item, index) => {
        if (!item.urun_id || !item.urun_adi || !item.fiyat) {
          throw new Error(`Sepet öğesi eksik: index ${index}`);
        }
        return {
          id: String(item.urun_id),
          name: String(item.urun_adi),
          category1: item.kategori || 'Genel',
          itemType: 'PHYSICAL',
          price: parseFloat(item.fiyat).toFixed(2)
        };
      });

      const request = {
        locale: 'tr',
        conversationId: Date.now().toString(),
        price: parseFloat(data.price).toFixed(2),
        paidPrice: parseFloat(data.price).toFixed(2),
        currency: 'TRY',
        basketId: 'B67832',
        paymentGroup: 'PRODUCT',
        callbackUrl: process.env.PAYMENT_CALLBACK_URL || 'http://localhost:5000/api/payment/callback',
        buyer: {
          id: data.buyerId || 'BY123',
          name: data.ad,
          surname: data.soyad,
          gsmNumber: data.telefon,
          email: data.email,
          identityNumber: data.identityNumber || '', // opsiyonel
          registrationAddress: data.adres,
          city: data.sehir,
          country: 'Turkey',
          zipCode: data.posta_kodu,
          ip: data.ip || ''
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
        basketItems
      };

      iyzi.checkoutFormInitialize.create(request, (err, result) => {
        if (err) {
          console.error('iyzipay createCheckoutForm error:', err);
          return reject(err);
        }

        if (result.status !== 'success') {
          console.error('iyzipay hata:', result);
          return reject(new Error(result.errorMessage || 'Ödeme başlatılamadı.'));
        }

        resolve(result);
      });
    } catch (error) {
      console.error('iyzipay createCheckoutForm exception:', error);
      reject(error);
    }
  });
};
