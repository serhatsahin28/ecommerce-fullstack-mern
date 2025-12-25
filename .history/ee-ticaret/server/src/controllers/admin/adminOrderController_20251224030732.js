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
      return res.status(400).json({ message: "order_id zorunlu" });
    }

    console.log("Sipariş code:", order_code);
    console.log("İptal nedeni:", cancelReason || "Yok");

    const orderQuery = Orders.find({
      "OrderCode": order_code
    });
    // console.log(orderQuery);

    // res.json({ message: "İptal isteği alındı" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};





module.exports = { OrdersAll, OrdersStatusUpdate, OrdersCancelRequest };