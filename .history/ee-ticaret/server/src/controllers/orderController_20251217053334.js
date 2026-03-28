const Order = require('../models/orders');
const Product = require('../models/products');

const jwt = require('jsonwebtoken');
require('dotenv').config();

// Sipariş kodu oluşturmak için yardımcı fonksiyon
function generateOrderCode() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp.slice(-6)}${random}`;
}

// Sipariş oluşturma controller'ıconst createOrder = async (req, res) => {
  try {
    const {
      userId,
      email,
      firstName,
      lastName,
      phone,
      cart,
      totalAmount,
      shippingInfo,
      payment
    } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email adresi zorunludur.'
      });
    }

    if (!cart || cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Sepet boş olamaz.'
      });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir toplam tutar giriniz.'
      });
    }

    const calculatedTotal = cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      return res.status(400).json({
        success: false,
        message: 'Toplam tutar hesaplama hatası.'
      });
    }

    const orderData = {
      userId: userId || null,
      email: email.toLowerCase().trim(),
      firstName: firstName || '',
      lastName: lastName || '',
      phone: phone || '',
      cart: cart.map(item => ({
        product_id: item.product_id,
        name: item.name,
        image: item.image,
        category: item.category,
        price: parseFloat(item.price),
        quantity: parseInt(item.quantity)
      })),
      totalAmount: parseFloat(totalAmount),
      shippingInfo: {
        address: shippingInfo?.address || '',
        city: shippingInfo?.city || '',
        district: shippingInfo?.district || '',
        postalCode: shippingInfo?.postalCode || '',
        notes: shippingInfo?.notes || ''
      },
      payment: {
        method: payment?.method || 'iyzico',
        status: payment?.status || 'success',
        iyzicoReference: payment?.iyzicoReference || '',
        date: payment?.date || new Date()
      },
      orderStatus: 'processing',
      orderCode: generateOrderCode(),
      createdAt: new Date()
    };

    /* 🔹 1. Siparişi Kaydet */
    const newOrder = new Order(orderData);
    const savedOrder = await newOrder.save();

    /* 🔹 2. STOK DÜŞME İŞLEMİ */
    for (const item of cart) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product_id,
          stock: { $gte: item.quantity } // stok yeterli mi
        },
        {
          $inc: { stock: -item.quantity }
        },
        { new: true }
      );

      if (!updatedProduct) {
        // ❌ Stok yetersiz → siparişi geri al
        await Order.findByIdAndDelete(savedOrder._id);

        return res.status(400).json({
          success: false,
          message: `"${item.name}" ürünü için yeterli stok yok`
        });
      }
    }

    /* 🔹 3. Başarılı Yanıt */
    res.status(201).json({
      success: true,
      message: 'Sipariş başarıyla oluşturuldu',
      orderId: savedOrder._id,
      orderCode: savedOrder.orderCode,
      totalAmount: savedOrder.totalAmount,
      orderStatus: savedOrder.orderStatus,
      createdAt: savedOrder.createdAt
    });

  } catch (error) {
    console.error('Sipariş oluşturma hatası:', error);

    res.status(500).json({
      success: false,
      message: 'Sipariş oluşturulurken bir hata oluştu'
    });
  }

// Sipariş sorgulama (opsiyonel)
const getOrder = async (req, res) => {
  try {
    const { orderCode } = req.params;

    const order = await Order.findOne({ orderCode }).populate('cart.product_id');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Sipariş bulunamadı'
      });
    }

    res.json({
      success: true,
      order: order
    });

  } catch (error) {
    console.error('Sipariş sorgulama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sipariş sorgulanırken hata oluştu'
    });
  }
};

// Sipariş durumu güncelleme (admin için)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderCode } = req.params;
    const { orderStatus, trackingNumber } = req.body;

    const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz sipariş durumu'
      });
    }

    const updateData = { orderStatus };
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { orderCode },
      updateData,
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Sipariş bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Sipariş durumu güncellendi',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Sipariş güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sipariş güncellenirken hata oluştu'
    });
  }
};

// Kullanıcının siparişlerini getir
const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate('cart.product_id');

    res.json({
      success: true,
      orders: orders
    });

  } catch (error) {
    console.error('Kullanıcı siparişleri hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Siparişler yüklenirken hata oluştu'
    });
  }
};





const viewOrders = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Token gerekli' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Token geçersiz veya süresi dolmuş' });
    }

    const userEmail = decoded.email;

    // MongoDB'den kullanıcının siparişlerini çek
    const userOrders = await Order.find({ email: userEmail });



    //console.log(userOrders);

    res.status(200).json({
      success: true,
      email: userEmail,
      orders: userOrders,
      totalOrders: userOrders.length
    });

  } catch (error) {
    console.error('Sipariş görüntüleme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucuda bir hata oluştu' });
  }
};





module.exports = {
  createOrder,
  getOrder,
  updateOrderStatus,
  getUserOrders,
  generateOrderCode,
  viewOrders
};