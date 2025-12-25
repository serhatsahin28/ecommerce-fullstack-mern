const iyzipay = require("../config/iyzico");

const refundWithIyzico = (order) => {
  console.log("🚀 Iyzico süreci başladı..."); // 1. Log

  return new Promise((resolve) => {
    try {
      const pId = order.payment.iyzicoReference;
      console.log("🆔 Kullanılacak ID:", pId); // 2. Log

      if (!order.transactionId) {
        console.log("❌ Hata: iyzicoReference bulunamadı!");
        return resolve({ success: false, error: "Payment ID (iyzicoReference) eksik!" });
      }

      // CANCEL (İPTAL) deniyoruz çünkü paymentId ile çalışır
      const request = {
        locale: "tr",
        conversationId: order.orderCode,
        paymentId:order.transactionId // iyzicoReference'ı paymentId olarak gönderiyoruz
      };

      console.log("📡 Iyzico'ya istek atılıyor...", request); // 3. Log

      iyzipay.cancel.create(request, (err, result) => {
        if (err) {
          console.log("💥 Iyzico kütüphane hatası:", err); // 4. Log
          return resolve({ success: false, error: err.message });
        }

        console.log("📊 Iyzico'dan yanıt geldi:", result.status); // 5. Log

        if (result.status !== "success") {
          console.log("⚠️ Iyzico işlemi reddetti:", result.errorMessage); // 6. Log
          return resolve({ success: false, error: result.errorMessage });
        }

        console.log("✅ Iyzico işlemi onayladı!"); // 7. Log
        resolve({ success: true, iyzicoResult: result });
      });

    } catch (globalError) {
      console.log("💀 Fonksiyon içinde beklenmedik hata:", globalError.message);
      resolve({ success: false, error: globalError.message });
    }
  });
};


module.exports = refundWithIyzico;