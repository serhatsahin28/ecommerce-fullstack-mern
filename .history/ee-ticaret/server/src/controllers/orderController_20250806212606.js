const Order = require('../models/orders');
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
    console.log('📥 Sipariş oluşturma isteği alındı:', req.body);

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

    // Veri doğrulaması
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

    // Toplam tutarı doğrula (güvenlik için)
    const calculatedTotal = cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Küçük farkları tolere et (floating point hataları için)
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      console.warn('⚠️ Toplam tutar uyuşmazlığı:', {
        calculated: calculatedTotal,
        received: totalAmount
      });

      return res.status(400).json({
        success: false,
        message: 'Toplam tutar hesaplama hatası.'
      });
    }

    // Sipariş verisini hazırla
    const orderData = {
      userId: userId || null, // Misafir kullanıcılar için null
      email: email.toLowerCase().trim(),
      firstName: firstName || '',
      lastName: lastName || '',
      phone: phone || '',

      // Sepet bilgileri
      cart: cart.map(item => ({
        product_id: item.product_id,
        name: item.name || 'Ürün',
        category: item.category || 'Genel',
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1
      })),

      // Toplam tutar
      totalAmount: parseFloat(totalAmount),

      // Kargo bilgileri
      shippingInfo: {
        address: shippingInfo?.address || '',
        city: shippingInfo?.city || '',
        district: shippingInfo?.district || '',
        postalCode: shippingInfo?.postalCode || '',
        notes: shippingInfo?.notes || ''
      },

      // Ödeme bilgileri
      payment: {
        method: payment?.method || 'iyzico',
        status: payment?.status || 'success',
        iyzicoReference: payment?.iyzicoReference || '',
        date: payment?.date || new Date()
      },

      // Sipariş durumu
      orderStatus: 'processing',

      // Benzersiz sipariş kodu
      orderCode: generateOrderCode(),

      createdAt: new Date()
    };

    console.log('💾 Veritabanına kaydedilecek sipariş verisi:', orderData);

    // Veritabanına kaydet
    const newOrder = new Order(orderData);
    const savedOrder = await newOrder.save();

    console.log('✅ Sipariş başarıyla kaydedildi:', {
      id: savedOrder._id,
      orderCode: savedOrder.orderCode,
      email: savedOrder.email,
      totalAmount: savedOrder.totalAmount
    });

    // Başarılı yanıt
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
    console.error('❌ Sipariş oluşturma hatası:', error);

    // MongoDB validation hataları
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Veri doğrulama hatası',
        errors: validationErrors
      });
    }

    // Duplicate key hatası (orderCode unique)
    if (error.code === 11000) {
      console.log('🔄 Sipariş kodu çakışması, yeniden deneniyor...');

      // Yeni kod ile tekrar dene (basit retry)
      try {
        const retryOrderData = { ...req.body };
        retryOrderData.orderCode = generateOrderCode();

        const retryOrder = new Order(retryOrderData);
        const retrySavedOrder = await retryOrder.save();

        return res.status(201).json({
          success: true,
          message: 'Sipariş başarıyla oluşturuldu',
          orderId: retrySavedOrder._id,
          orderCode: retrySavedOrder.orderCode,
          totalAmount: retrySavedOrder.totalAmount
        });

      } catch (retryError) {
        console.error('❌ Retry hatası:', retryError);
        return res.status(500).json({
          success: false,
          message: 'Sipariş oluşturulurken teknik bir hata oluştu'
        });
      }
    }

    // Genel hata
    res.status(500).json({
      success: false,
      message: 'Sipariş oluşturulurken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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


// const viewOrders = async (req, res) => {
//   try {
//     const { token } = req.query;

//     if (!token) {
//       return res.status(400).json({ success: false, message: 'Token gerekli' });
//     }

//     let decoded;
//     try {
//       decoded = jwt.verify(token, process.env.JWT_SECRET);
//     } catch (err) {
//       return res.status(401).json({ success: false, message: 'Token geçersiz veya süresi dolmuş' });
//     }

//     const userEmail = decoded.email;

//     // MongoDB'den kullanıcının siparişlerini çek
//     const userOrders = await Order.find({ email:"sahinserhat923@gmail.com" });


// console.log(userOrders);
//     res.status(200).json({
//       success: true,
//       email: userEmail,
//       orders: userOrders,
//     });

//   } catch (error) {
//     console.error('Sipariş görüntüleme hatası:', error);
//     res.status(500).json({ success: false, message: 'Sunucuda bir hata oluştu' });
//   }
// };



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