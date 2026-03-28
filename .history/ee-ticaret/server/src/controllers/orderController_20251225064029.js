const Order = require('../models/orders');
const Product = require('../models/products');
const Basket = require('../models/basket');
const Home = require('../models/home');

const jwt = require('jsonwebtoken');
require('dotenv').config();

// Sipariş kodu oluşturmak için yardımcı fonksiyon
function generateOrderCode() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp.slice(-6)}${random}`;
}

// Sipariş oluşturma controller'ı
const createOrder = async (req, res) => {
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
      payment // Frontend'den gelen payment objesi
    } = req.body;

    // --- 1. Veri Doğrulamaları ---
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email adresi zorunludur.' });
    }
    if (!cart || cart.length === 0) {
      return res.status(400).json({ success: false, message: 'Sepet boş olamaz.' });
    }

    // Toplam tutarı doğrula (güvenlik için)
    const calculatedTotal = cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      return res.status(400).json({ success: false, message: 'Toplam tutar hesaplama hatası.' });
    }

    // --- 2. Sipariş Verisini Hazırla ---
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
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1
      })),

      totalAmount: parseFloat(totalAmount),

      shippingInfo: {
        address: shippingInfo?.address || '',
        city: shippingInfo?.city || '',
        district: shippingInfo?.district || '',
        postalCode: shippingInfo?.postalCode || '',
        notes: shippingInfo?.notes || ''
      },

      // ✅ GÜNCELLENEN ÖDEME BÖLÜMÜ
      payment: {
        method: payment?.method || 'iyzico',
        status: payment?.status || 'success',
        // Frontend'den gelen yeni isimleri alıyoruz
        transactionId: payment?.transactionId || '', 
        referenceId: payment?.referenceId || '',
        // Eski şemanla uyum için transactionId'yi iyzicoReference'a da yazıyoruz
        iyzicoReference: payment?.transactionId || '', 
        date: payment?.date || new Date()
      },

      orderStatus: 'processing',
      orderCode: generateOrderCode(), // Bu fonksiyonun tanımlı olduğunu varsayıyoruz
      createdAt: new Date()
    };

    // --- 3. Veritabanına Kaydet ---
    const newOrder = new Order(orderData);
    const savedOrder = await newOrder.save();

    // --- 4. Stok Güncelleme ve Rollback (Geri Alma) Mantığı ---
    try {
      for (const item of cart) {
        // Ana ürün stok düşürme
        const updatedProduct = await Product.findOneAndUpdate(
          {
            _id: item.product_id,
            stock: { $gte: item.quantity }
          },
          { $inc: { stock: -item.quantity } }
        );

        if (!updatedProduct) {
          throw new Error(`Ürün stokta kalmadı: ${item.name}`);
        }

        // Home sayfasındaki kategorili stok düşürme (opsiyonel)
        await Home.findOneAndUpdate(
          {
            "categories.products.product_id": item.product_id,
            "categories.products.stock": { $gte: item.quantity }
          },
          {
            $inc: { "categories.$[].products.$[p].stock": -item.quantity }
          },
          {
            arrayFilters: [{ "p.product_id": item.product_id }],
            new: true
          }
        );
      }
    } catch (err) {
      // Stok düşerken hata çıkarsa (stok yetersizse vb.) oluşturulan siparişi sil
      await Order.findByIdAndDelete(savedOrder._id);
      return res.status(400).json({ success: false, message: err.message });
    }

    // --- 5. Sepeti Temizle ---
    if (userId) {
      await Basket.findOneAndDelete({ userId });
    }

    // --- 6. Başarılı Yanıt ---
    res.status(201).json({
      success: true,
      message: 'Sipariş başarıyla oluşturuldu',
      orderId: savedOrder._id,
      orderCode: savedOrder.orderCode,
      totalAmount: savedOrder.totalAmount,
      paymentDetails: {
        transactionId: savedOrder.payment.transactionId,
        referenceId: savedOrder.payment.referenceId
      }
    });

  } catch (error) {
    console.error('❌ Sipariş oluşturma hatası:', error);

    // MongoDB Unique Hatası (Sipariş kodu çakışması)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Sipariş kodu çakışması oluştu, lütfen tekrar deneyin.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Sipariş oluşturulurken bir hata oluştu',
      error: error.message
    });
  }
};

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