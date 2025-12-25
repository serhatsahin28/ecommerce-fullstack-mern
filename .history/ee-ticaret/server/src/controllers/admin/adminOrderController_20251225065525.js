const Orders = require('../../models/orders');
const refundWithIyzico = require('../../services/iyzicoRefund');



const OrdersAll = async (req, res) => {

  try {
    const ordersAll = await Orders.find();
    res.json(ordersAll);
  } catch (error) {
    console.log(error);
  }

}


const OrdersStatusUpdate = async (req, res) => {
  try {
    const { order_id, status } = req.body;

    const order = await Orders.findById(order_id);
    if (!order) return res.status(404).json({ message: "Sipariş bulunamadı" });

    order.orderStatus = status;
    await order.save();

    // Güncel sipariş listesini döndür
    const ordersAll = await Orders.find();
    res.json(ordersAll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};




const OrdersCancelRequest = async (req, res) => {
  try {
    const { order_code, cancelReason } = req.body;

    if (!order_code) {
      return res.status(400).json({ message: "order_code zorunlu" });
    }

    // 1️⃣ Siparişi bul
    const order = await Orders.findOne({ orderCode: order_code });

    if (!order) {
      return res.status(404).json({ message: "Sipariş bulunamadı" });
    }

    // 2️⃣ Zaten iptal / beklemede mi?
    if (order.orderStatus === "cancelled" || order.orderStatus === "cancel_pending") {
      return res.status(400).json({ message: "Sipariş zaten iptal sürecinde" });
    }

    // 3️⃣ DB UPDATE — İPTAL TALEBİ
    order.orderStatus = "cancel_pending"; // ✅ ÖNEMLİ

    order.cancel = {
      reason: cancelReason || null,
      cancelledBy: "ADMIN",
      cancelledAt: null // ❌ henüz iptal edilmedi
    };

    await order.save();

    res.json({
      success: true,
      message: "Sipariş iptal talebi oluşturuldu",
      orderCode: order.orderCode,
      status: order.orderStatus
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};


// const OrdersCancelApprove = async (req, res) => {
//   try {
//     const { order_code } = req.body;
//     const order = await Orders.findOne({ orderCode: order_code });

//     if (!order) {
//       return res.status(404).json({ message: "Sipariş bulunamadı" });
//     }

//     if (order.orderStatus !== "cancel_pending") {
//       return res.status(400).json({ message: "Sipariş iptal beklemede değil" });
//     }

//     // 1️⃣ İYZICO REFUND (Para İadesi)
//     // Not: refundWithIyzico fonksiyonunun içinde her ürünün 
//     // paymentTransactionId'sini kullandığından emin ol.
//     const refundResult = await refundWithIyzico(order);

//     if (!refundResult.success) {
//       return res.status(400).json({
//         message: "İyzico iade işlemi başarısız oldu",
//         iyzicoError: refundResult.error
//       });
//     }

//     // 2️⃣ STOKLARI GERİ YÜKLE (Yeni Eklenen Kısım)
//     try {
//       for (const item of order.cart) {
//         // Ana ürün stoğunu artır
//         await Product.findByIdAndUpdate(item.product_id, {
//           $inc: { stock: item.quantity }
//         });

//         // Home sayfasındaki/kategorideki stoğu artır
//         await Home.findOneAndUpdate(
//           { "categories.products.product_id": item.product_id },
//           { $inc: { "categories.$[].products.$[p].stock": item.quantity } },
//           { arrayFilters: [{ "p.product_id": item.product_id }] }
//         );
//       }
//     } catch (stockError) {
//       console.error("Stok geri yükleme hatası:", stockError);
//       // Not: Stok geri yüklenemese bile iade yapıldığı için devam edilebilir 
//       // ama loglanması çok önemlidir.
//     }

//     // 3️⃣ DB UPDATE (Sipariş Durumu)
//     order.orderStatus = "cancelled";
//     order.payment.status = "refunded";
//     order.cancel = {
//       ...order.cancel,
//       cancelledAt: new Date(),
//       approvedBy: "ADMIN"
//     };

//     await order.save();

//     // 4️⃣ RABBITMQ → MAIL & SMS
//     // Kuyruğa gönderirken iade bilgilerini de ekleyebilirsin
//     await publishToQueue("order_cancelled_notification", {
//       orderCode: order.orderCode,
//       email: order.email,
//       phone: order.phone,
//       totalAmount: order.totalAmount,
//       cancelReason: order.cancel?.reason || "Müşteri talebi"
//     });

//     res.json({
//       success: true,
//       message: "Sipariş iptal edildi ve tutar iade edildi."
//     });

//   } catch (error) {
//     console.error("İptal Onay Hatası:", error);
//     res.status(500).json({ message: "Sunucu hatası oluştu" });
//   }
// };

// refundWithIyzico fonksiyonunun içi (Genelde iyzico.js veya servis dosyasındadır)
const refundWithIyzico = async (order) => {
  try {
    // 1. Veritabanındaki ID'yi kontrol et
    const paymentId = order.payment.transactionId || order.payment.iyzicoReference;
    console.log("💳 Iyzico'ya gönderilen Payment ID:", paymentId);

    if (!paymentId) {
      return { success: false, error: "Payment ID bulunamadı" };
    }

    // Iyzico isteğini burada yapıyorsun (Örnek yapı):
    // const result = await iyzipay.refund.create({ ... }); 
    
    // BURASI ÇOK ÖNEMLİ: Iyzico'dan gelen ham cevabı görelim
    // console.log("Iyzico Ham Cevap:", result);

    // Eğer Iyzico'dan hata geliyorsa result.status 'failure' olur
    if (result.status !== 'success') {
      console.error("❌ Iyzico Hata Mesajı:", result.errorMessage);
      return { success: false, error: result.errorMessage };
    }

    return { success: true };
  } catch (err) {
    console.error("Iyzico Servis Hatası:", err);
    return { success: false, error: err.message };
  }
};





module.exports = { OrdersAll, OrdersStatusUpdate, OrdersCancelRequest, OrdersCancelApprove };