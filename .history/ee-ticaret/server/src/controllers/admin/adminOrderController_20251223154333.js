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
    const { order_id, status } = req.body;
    console.log(order_id+"---"+status);
    // const order = await Orders.findById(order_id);
    // if (!order) return res.status(404).json({ message: "Sipariş bulunamadı" });

    // order.orderStatus = status;
    // await order.save();

    // Güncel sipariş listesini döndür
  
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};




module.exports = { OrdersAll, OrdersStatusUpdate, OrdersCancelRequest };