const Orders = require('../models/orders');

const viewOrders = async (req, res) => {
  try {
    // Frontend'den POST ile email bekliyoruz
    const  email  = req.user.email;
      if (!email) {
      return res.status(400).json({ message: "Email is yok" });
    }

    // Email ile siparişleri getir
    const orders = await Orders.find({ email });
    // console.log("orders", orders);
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
