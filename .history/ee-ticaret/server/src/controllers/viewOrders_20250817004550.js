const Orders = require('../models/orders');

const viewOrders = async (req, res) => {
  try {
    // İleride frontend'den email alabiliriz: const userMail = req.body.email;
    const userMail = "qd@gmail.com";

    // Siparişleri kullanıcı mailine göre getir
    const orders = await Orders.find({ email: userMail });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ query: [], message: "No orders found" });
    }

    res.json({
      query: orders,
      message: "Success"
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = viewOrders;
