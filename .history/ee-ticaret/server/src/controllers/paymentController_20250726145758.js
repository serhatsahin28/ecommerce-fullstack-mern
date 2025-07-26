const iyzipay = require('iyzipay');

const iyzi = new iyzipay({
  apiKey: process.env.IYZI_API_KEY,
  secretKey: process.env.IYZI_SECRET_KEY,
  uri: 'https://sandbox-api.iyzipay.com' // Canlıda production URI'yi kullan
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

    // Gelen verileri kontrol et ve logla
    console.log('🟢 Ödeme isteği geldi:', req.body);

    // Gerekli alanları kontrol et
    if (!ad || !soyad || !email || !telefon || !adres_detay || !sehir || !posta_kodu || !sepet || !card) {
      return res.status(400).json({ message: 'Eksik bilgi gönderildi.' });
    }

    // Sepet içeriğini ve fiyatları doğrula
    if (!Array.isArray(sepet) || sepet.length === 0) {
      return res.status(400).json({ message: 'Sepet boş olamaz.' });
    }

    // Sepet ürünlerini ve fiyatlarını kontrol et
    const basketItems = sepet.map(item => {
      const price = parseFloat(item.fiyat);
      if (isNaN(price) || price <= 0) {
        throw new Error(`Geçersiz ürün fiyatı: ${item.urun_adi || 'Bilinmeyen Ürün'}`);
      }
      return {
        id: item.urun_id || String(Date.now()),
        name: item.urun_adi || 'Ürün',
        category1: item.kategori || 'Genel',
        itemType: 'PHYSICAL',
        price: price.toFixed(2)
      };
    });

    // totalPrice'ı sayıya çevir ve sıfırdan büyük olmalı
    const total = parseFloat(totalPrice);
    if (isNaN(total) || total <= 0) {
      return res.status(400).json({ message: 'Geçersiz toplam fiyat.' });
    }

    const request = {
      locale: 'tr',
      conversationId: `guest_${Date.now()}`,
      price: total.toFixed(2),
      paidPrice: total.toFixed(2),
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
        identityNumber: '11111111111', // Gerekirse gerçek değer alınabilir
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
      basketItems
    };

    // İyzico ödeme isteğini gönder
    iyzi.payment.create(request, (err, result) => {
      console.log('İyzico err:', err);
      console.log('İyzico result:', result);

      if (err) {
        console.error('İyzico API hatası:', err);
        return res.status(500).json({ message: 'İyzico API hatası', detail: err });
      }

      if (!result || result.status !== 'success') {
        console.error('İyzico ödeme başarısız:', result ? result.errorMessage : 'Bilinmeyen hata');
        return res.status(400).json({
          message: 'Ödeme başarısız',
          detail: result || 'Bilinmeyen hata'
        });
      }

      // Başarılı yanıt
      res.status(200).json({ message: 'Ödeme başarılı', result });
    });

  } catch (error) {
    console.error('Sunucu hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', detail: error.message });
  }
};

module.exports = { payWithCard };
