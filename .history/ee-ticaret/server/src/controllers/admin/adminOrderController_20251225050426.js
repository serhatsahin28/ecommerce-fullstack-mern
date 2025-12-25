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


const OrdersCancelApprove = async (req, res) => {
  try {
    const { order_code } = req.body;

    const order = await Orders.findOne({ orderCode: order_code });
    if (!order) {
      return res.status(404).json({ message: "Sipariş bulunamadı" });
    }

    if (order.orderStatus !== "cancel_pending") {
      return res.status(400).json({ message: "Sipariş iptal beklemede değil" });
    }

    // 1️⃣ İYZICO REFUND
    const refundResult = await refundWithIyzico(order);

    if (!refundResult.success) {
      return res.status(400).json({
        message: "İyzico iptal başarısız",
        iyzicoError: refundResult.error
      });
    }

    // 2️⃣ DB UPDATE
    order.orderStatus = "cancelled";
    order.payment.status = "refunded";

    order.cancel = {
      ...order.cancel,
      cancelledAt: new Date(),
      approvedBy: "ADMIN"
    };

    await order.save();

    // 3️⃣ RABBITMQ → MAIL & SMS (ASYNC)
    await publishToQueue("order_cancelled_notification", {
      orderCode: order.orderCode,
      email: order.email,
      phone: order.phone,
      cancelReason: order.cancel.reason
    });

    res.json({
      success: true,
      message: "Sipariş başarıyla iptal edildi"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};



module.exports = { OrdersAll, OrdersStatusUpdate, OrdersCancelRequest, OrdersCancelApprove };