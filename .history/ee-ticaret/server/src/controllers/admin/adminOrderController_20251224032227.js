const Orders = require('../../models/orders');

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

    // 2️⃣ Zaten iptal mi?
    if (order.orderStatus === "cancelled") {
      return res.status(400).json({ message: "Sipariş zaten iptal edilmiş" });
    }

    // 3️⃣ (İLERİDE) iyzico refund burada olacak
    // await refundPayment(order);

    // 4️⃣ DB UPDATE — İPTAL BİLGİLERİ
    order.orderStatus = "cancelled";
    order.cancel = {
      reason: cancelReason || null,
      cancelledBy: "ADMIN",          // admin panelden geldiği için
      cancelledAt: new Date()
    };

    await order.save();

    // 5️⃣ (İLERİDE) RabbitMQ mail kuyruğu burada olacak
    // await publishOrderCancelledMail({ ... });

    res.json({
      message: "Sipariş başarıyla iptal edildi",
      orderCode: order.orderCode
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};




module.exports = { OrdersAll, OrdersStatusUpdate, OrdersCancelRequest };