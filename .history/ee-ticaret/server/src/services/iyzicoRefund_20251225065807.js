const iyzipay = require("../config/iyzico");

const refundWithIyzico = (order) => {
  return new Promise((resolve) => {
    // ÖNEMLİ: Iyzico'da refund için her bir ürünün paymentTransactionId'si gerekir.
    // Eğer elinde o yoksa, tüm siparişi CANCEL etmeyi deneyebilirsin.
    
    const request = {
      locale: "tr",
      conversationId: order.orderCode,
      paymentId: order.payment.transactionId, // iyzicoReference'ın paymentId olduğunu varsayıyoruz
    };

    // AYNI GÜN İÇİNDE İSE 'CANCEL' KULLANILIR
    iyzipay.cancel.create(request, (err, result) => {
      if (err) {
        console.error("Iyzico Bağlantı Hatası:", err);
        return resolve({ success: false, error: err });
      }

      if (result.status !== "success") {
        console.error("❌ Iyzico Reddedildi:", result.errorMessage); // HATA BURADA YAZACAK
        return resolve({
          success: false,
          error: result.errorMessage
        });
      }

      console.log("✅ Iyzico İptal Başarılı");
      resolve({
        success: true,
        iyzicoResult: result
      });
    });
  });
};