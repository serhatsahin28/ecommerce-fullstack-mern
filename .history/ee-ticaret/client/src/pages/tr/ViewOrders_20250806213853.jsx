const calculateSubtotal = (cart) => {
    return cart?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;
  };

  return (
    <>
      <div className="orders-page">
        <div className="container">
          {/* Header */}
          <div className="header">
            <h1 className="page-title">Siparişlerim</h1>
            <p className="page-subtitle">Tüm siparişlerinizi buradan takip edebilirsiniz</p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="loading-container">
              <div className="spinner"></div>
              <h5 className="loading-text">Siparişleriniz yükleniyor...</h5>
            </div>
          )}

          {/* Message Alert */}
          {!loading && message && (
            <div className={`alert alert-${variant}`}>
              <div className="alert-content">
                <span className="alert-icon">
                  {variant === 'success' ? '✅' : variant === 'danger' ? '❌' : 'ℹ️'}
                </span>
                {message}
              </div>
            </div>
          )}

          {/* Orders List */}
          {!loading && orders.length > 0 && (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order._id?.$oid || order._id} className="order-card">
                  {/* Order Header */}
                  <div className="order-header">
                    <div className="order-info">
                      <h3 className="order-title">Sipariş #{getOrderId(order)}</h3>
                      <p className="order-date">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="order-summary">
                      <div className="order-total">{order.totalAmount?.toFixed(2)} ₺</div>
                      <p className="order-items-count">{order.cart?.length || 0} ürün</p>
                    </div>
                    <div className="order-status-container">
                      {getStatusBadge(order.orderStatus)}
                    </div>
                  </div>

                  <div className="order-body">
                    {/* Products Section */}
                    {order.cart && order.cart.length > 0 && (
                      <div className="section">
                        <h4 className="section-title">
                          <span className="section-icon">🛍️</span>
                          Sipariş İçeriği
                        </h4>
                        <div className="products-grid">
                          {order.cart.map((item, index) => (
                            <div key={item._id?.$oid || index} className="product-card">
                              <div className="product-image-container">
                                <img
                                  src={item.image || `https://via.placeholder.com/100x100/f8f9fa/6c757d?text=${item.category === 'Elektronik' ? '📱' : item.category === 'Moda' || item.category === 'Fashion' ? '👕' : '📦'}`}
                                  alt={item.name}
                                  className="product-image"
                                  onError={(e) => {
                                    e.target.src = `https://via.placeholder.com/100x100/f8f9fa/6c757d?text=${item.category === 'Elektronik' ? '📱' : item.category === 'Moda' || item.category === 'Fashion' ? '👕' : '📦'}`;
                                  }}
                                />
                              </div>
                              <div className="product-details">
                                <h5 className="product-name">{item.name}</h5>
                                <p className="product-category">Kategori: {item.category}</p>
                                <div className="product-price-qty">
                                  <span className="product-quantity">Adet: {item.quantity}</span>
                                  <span className="product-price">{item.price?.toFixed(2)} ₺</span>
                                </div>
                                <div className="product-total">
                                  Toplam: <strong>{(item.price * item.quantity).toFixed(2)} ₺</strong>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Shipping and Payment Info */}
                    <div className="info-grid">
                      {/* Cargo Status */}
                      <div className="info-card">
                        <h4 className="info-title">
                          <span className="info-icon">🚚</span>
                          Kargo Durumu
                        </h4>
                        <div className="info-content">
                          <div className="info-row">
                            <span className="info-label">Durum:</span>
                            <span className="info-value">{getCargoStatus(order.orderStatus)}</span>
                          </div>
                          {order.trackingNumber && (
                            <div className="info-row">
                              <span className="info-label">Takip No:</span>
                              <span className="info-value tracking-number">{order.trackingNumber}</span>
                            </div>
                          )}
                          <div className="info-row">
                            <span className="info-label">Kargo Firması:</span>
                            <span className="info-value">MNG Kargo</span>
                          </div>
                          {order.estimatedDelivery && (
                            <div className="info-row">
                              <span className="info-label">Tahmini Teslimat:</span>
                              <span className="info-value delivery-date">
                                {new Date(order.estimatedDelivery).toLocaleDateString('tr-TR')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div className="info-card">
                        <h4 className="info-title">
                          <span className="info-icon">📍</span>
                          Teslimat Adresi
                        </h4>
                        <div className="info-content address-content">
                          {order.shippingInfo ? (
                            <>
                              <div className="customer-name">
                                {order.firstName} {order.lastName}
                              </div>
                              <div className="address-line">{order.shippingInfo.address}</div>
                              <div className="address-line">
                                {order.shippingInfo.district}, {order.shippingInfo.city}
                              </div>
                              <div className="address-line">
                                Posta Kodu: {order.shippingInfo.postalCode}
                              </div>
                              {order.phone && (
                                <div className="phone-line">
                                  📞 {order.phone}
                                </div>
                              )}
                              {order.shippingInfo.notes && (
                                <div className="notes-line">
                                  <strong>Not:</strong> {order.shippingInfo.notes}
                                </div>
                              )}
                            </>
                          ) : (
                            <span>Adres bilgisi bulunamadı</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="payment-summary">
                      <div className="payment-info">
                        <h4 className="info-title">
                          <span className="info-icon">💳</span>
                          Ödeme Bilgileri
                        </h4>
                        <div className="payment-details">
                          <div className="info-row">
                            <span className="info-label">Ödeme Yöntemi:</span>
                            <span className="info-value">
                              {order.payment?.method === 'iyzico' ? 'Kredi Kartı (Iyzico)' : 'Kredi Kartı'}
                            </span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Ödeme Durumu:</span>
                            <span className={`payment-status ${order.payment?.status === 'success' ? 'success' : 'pending'}`}>
                              {order.payment?.status === 'success' ? 'Ödendi ✅' : 'Beklemede ⏳'}
                            </span>
                          </div>
                          {order.payment?.iyzicoReference && (
                            <div className="reference-info">
                              Referans: {order.payment.iyzicoReference}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="price-breakdown">
                        <div className="price-row">
                          <span>Ara Toplam:</span>
                          <span>{calculateSubtotal(order.cart).toFixed(2)} ₺</span>
                        </div>
                        <div className="price-row">
                          <span>Kargo:</span>
                          <span className="free-shipping">Ücretsiz</span>
                        </div>
                        <div className="price-row total-row">
                          <span>Toplam:</span>
                          <span className="total-amount">{order.totalAmount?.toFixed(2)} ₺</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-section">
                      <div className="action-buttons">
                        {order.orderStatus === 'shipped' && order.trackingNumber && (
                          <button className="btn btn-outline-primary">
                            🚚 Kargo Takip
                          </button>
                        )}
                        <button className="btn btn-outline-secondary">
                          📄 Fatura İndir
                        </button>
                        {order.orderStatus === 'pending' && (
                          <button className="btn btn-outline-warning">
                            ❌ Siparişi İptal Et
                          </button>
                        )}
                      </div>
                      <div className="last-update">
                        Son güncelleme: {formatDate(order.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && orders.length === 0 && !message.includes('Token') && (
            <div className="empty-state">
              <div className="empty-icon">🛍️</div>
              <h3 className="empty-title">Henüz siparişiniz bulunmuyor</h3>
              <p className="empty-subtitle">İlk siparişinizi vermek için alışverişe başlayın!</p>
              <button className="btn btn-primary btn-large">
                🛒 Alışverişe Başla
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .orders-page {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
          padding: 2rem 0;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .page-title {
          font-size: 3rem;
          font-weight: 700;
          color: #dc3545;
          margin-bottom: 1rem;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }

        .page-subtitle {
          font-size: 1.2rem;
          color: #6c757d;
          margin: 0;
        }

        .loading-container {
          text-align: center;
          padding: 4rem 0;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #dc3545;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1.5rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-text {
          color: #6c757d;
          font-size: 1.1rem;
          margin: 0;
        }

        .alert {
          padding: 1.25rem 1.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          border: 1px solid;
        }

        .alert-success {
          background-color: #d1e7dd;
          color: #0f5132;
          border-color: #badbcc;
        }

        .alert-danger {
          background-color: #f8d7da;
          color: #721c24;
          border-color: #f5c2c7;
        }

        .alert-info {
          background-color: #cff4fc;
          color: #055160;
          border-color: #b6effb;
        }

        .alert-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.1rem;
        }

        .alert-icon {
          font-size: 1.25rem;
        }

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .order-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .order-card:hover {
          transform: trimport React, { useEffect, useState } from 'react';

const ViewOrdersPage = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('info');

  // API'den veri çekme - token varsa
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // URL'den token al (gerçek uygulamada useSearchParams kullanılacak)
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
          setVariant('danger');
          setMessage('Geçersiz bağlantı: Token bulunamadı.');
          setLoading(false);
          return;
        }

        // Gerçek API çağrısı yerine demo data
        // const response = await fetch(`http://localhost:5000/view-orders?token=${token}`);
        // const data = await response.json();
        
        // Demo order - veritabanı yapısına uygun
        const mockOrder = {
          _id: { $oid: "68928c31332568cd46bdcf60" },
          userId: null,
          email: "sahinserhat923@gmail.com",
          firstName: "Serhat",
          lastName: "Şahin", 
          phone: "0532 123 45 67",
          cart: [
            {
              product_id: { $oid: "68652558953059c152a9ba94" },
              name: "Huawei Watch GT 5 Pro Black(46mm) Smart Watch(55020DKD)",
              category: "Elektronik",
              price: 2599.99,
              quantity: 1,
              _id: { $oid: "68928c31332568cd46bdcf61" },
              image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop"
            },
            {
              product_id: { $oid: "686528c6953059c152a9ba9a" },
              name: "Linen Blend Brown Shirt",
              category: "Moda", 
              price: 299.99,
              quantity: 2,
              _id: { $oid: "68928c31332568cd46bdcf62" },
              image: "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=300&h=300&fit=crop"
            },
            {
              product_id: { $oid: "686527d8953059c152a9ba98" },
              name: "White T-shirt",
              category: "Fashion",
              price: 149.99,
              quantity: 1,
              _id: { $oid: "68928c31332568cd46bdcf63" },
              image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop"
            }
          ],
          totalAmount: 3349.96,
          shippingInfo: {
            address: "Atatürk Mahallesi, Cumhuriyet Caddesi No:123 Daire:5",
            city: "İstanbul",
            district: "Kadıköy",
            postalCode: "34710",
            notes: "Kapı zilini çalmayın, arayın lütfen"
          },
          payment: {
            method: "iyzico",
            status: "success",
            iyzicoReference: "25100775",
            date: { $date: "2025-08-05T22:56:49.057Z" }
          },
          orderStatus: "shipped",
          orderCode: "ORD-609064006",
          createdAt: { $date: "2025-08-05T22:56:49.064Z" },
          trackingNumber: "TK609064006TR",
          estimatedDelivery: "2025-08-08",
          __v: 0
        };

        // Simulate API call delay
        setTimeout(() => {
          setOrders([mockOrder]);
          setMessage(`Hoş geldiniz ${mockOrder.firstName}! Toplam 1 siparişiniz bulundu.`);
          setVariant('success');
          setLoading(false);
        }, 1500);

      } catch (err) {
        setVariant('danger');
        setMessage('Sunucu hatası oluştu.');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { color: '#856404', bgColor: '#fff3cd', text: 'Beklemede', icon: '⏳' },
      'processing': { color: '#084298', bgColor: '#cfe2ff', text: 'Hazırlanıyor', icon: '📦' },
      'shipped': { color: '#495057', bgColor: '#e2e3e5', text: 'Kargoda', icon: '🚚' },
      'delivered': { color: '#0f5132', bgColor: '#d1e7dd', text: 'Teslim Edildi', icon: '✅' },
      'cancelled': { color: '#721c24', bgColor: '#f8d7da', text: 'İptal Edildi', icon: '❌' }
    };
    
    const config = statusConfig[status] || { color: '#495057', bgColor: '#e2e3e5', text: status || 'Bilinmiyor', icon: '❓' };
    return (
      <span className="status-badge" style={{
        backgroundColor: config.bgColor,
        color: config.color,
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <span>{config.icon}</span>
        {config.text}
      </span>
    );
  };

  const getCargoStatus = (orderStatus) => {
    const cargoStatusConfig = {
      'pending': 'Sipariş alındı, hazırlanıyor',
      'processing': 'Ürünler paketleniyor',
      'shipped': 'Kargo yolda, yakında teslim edilecek',
      'delivered': 'Başarıyla teslim edildi',
      'cancelled': 'Sipariş iptal edildi'
    };
    
    return cargoStatusConfig[orderStatus] || orderStatus;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Tarih bilgisi yok';
    const date = new Date(dateStr.$date || dateStr);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderId = (order) => {
    return order.orderCode || (order._id?.$oid?.slice(-8).toUpperCase()) || 'N/A';
  };

  const calculateSubtotal = (cart) => {