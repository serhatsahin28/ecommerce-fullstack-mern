import React, { useEffect, useState } from 'react';

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
          firstName: "qqq",
          lastName: "qqq", 
          phone: "11111",
          cart: [
            {
              product_id: { $oid: "68652558953059c152a9ba94" },
              name: "Huawei Watch GT 5 Pro Black(46mm) Smart Watch(55020DKD)",
              category: "Elektronik",
              price: 0.39,
              quantity: 1,
              _id: { $oid: "68928c31332568cd46bdcf61" }
            },
            {
              product_id: { $oid: "686528c6953059c152a9ba9a" },
              name: "Linen Blend Brown Shirt",
              category: "Moda", 
              price: 0.37,
              quantity: 1,
              _id: { $oid: "68928c31332568cd46bdcf62" }
            },
            {
              product_id: { $oid: "686527d8953059c152a9ba98" },
              name: "White T-shirt",
              category: "Fashion",
              price: 0.39,
              quantity: 1,
              _id: { $oid: "68928c31332568cd46bdcf63" }
            }
          ],
          totalAmount: 1.15,
          shippingInfo: {
            address: "sdad",
            city: "dsad",
            district: "ssad",
            postalCode: "asdasd",
            notes: ""
          },
          payment: {
            method: "iyzico",
            status: "success",
            iyzicoReference: "25100775",
            date: { $date: "2025-08-05T22:56:49.057Z" }
          },
          orderStatus: "processing",
          orderCode: "ORD-609064006",
          createdAt: { $date: "2025-08-05T22:56:49.064Z" },
          __v: 0
        };

        // Simulate API call delay
        setTimeout(() => {
          setOrders([mockOrder]);
          setMessage(`Hoş geldiniz! Toplam 1 siparişiniz bulundu.`);
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
      'pending': { color: '#ffc107', bgColor: '#fff3cd', text: 'Beklemede' },
      'processing': { color: '#0d6efd', bgColor: '#cfe2ff', text: 'İşleniyor' },
      'shipped': { color: '#6c757d', bgColor: '#e2e3e5', text: 'Kargoda' },
      'delivered': { color: '#198754', bgColor: '#d1e7dd', text: 'Teslim Edildi' },
      'cancelled': { color: '#dc3545', bgColor: '#f8d7da', text: 'İptal Edildi' }
    };
    
    const config = statusConfig[status] || { color: '#6c757d', bgColor: '#e2e3e5', text: status || 'Bilinmiyor' };
    return (
      <span style={{
        backgroundColor: config.bgColor,
        color: config.color,
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {config.text}
      </span>
    );
  };

  const getCargoStatus = (orderStatus) => {
    const cargoStatusConfig = {
      'pending': 'Sipariş alındı',
      'processing': 'Hazırlanıyor',
      'shipped': 'Kargoya verildi',
      'delivered': 'Teslim edildi',
      'cancelled': 'İptal edildi'
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

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            color: '#dc3545', 
            fontWeight: 'bold', 
            marginBottom: '1rem' 
          }}>
            Siparişlerim
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#6c757d' }}>
            Tüm siparişlerinizi buradan takip edebilirsiniz
          </p>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #dc3545',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            <h5 style={{ color: '#6c757d' }}>Siparişleriniz yükleniyor...</h5>
          </div>
        )}

        {!loading && message && (
          <div style={{
            backgroundColor: variant === 'success' ? '#d1e7dd' : variant === 'danger' ? '#f8d7da' : '#cff4fc',
            color: variant === 'success' ? '#0f5132' : variant === 'danger' ? '#721c24' : '#055160',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            border: '1px solid',
            borderColor: variant === 'success' ? '#badbcc' : variant === 'danger' ? '#f5c2c7' : '#b6effb'
          }}>
            {message}
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div>
            {orders.map((order) => (
              <div key={order._id?.$oid || order._id} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                marginBottom: '2rem'
              }}>
                {/* Sipariş Başlığı */}
                <div style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  padding: '1.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h5 style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
                        Sipariş #{getOrderId(order)}
                      </h5>
                      <small style={{ opacity: 0.9 }}>
                        {formatDate(order.createdAt)}
                      </small>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {order.totalAmount?.toFixed(2)} ₺
                      </div>
                      <small style={{ opacity: 0.9 }}>
                        {order.cart?.length || 0} ürün
                      </small>
                    </div>
                    <div>
                      {getStatusBadge(order.orderStatus)}
                    </div>
                  </div>
                </div>

                <div style={{ padding: '2rem' }}>
                  {/* Ürünler */}
                  {order.cart && order.cart.length > 0 && (
                    <div style={{ marginBottom: '2rem' }}>
                      <h6 style={{ 
                        color: '#dc3545', 
                        fontWeight: 'bold', 
                        marginBottom: '1.5rem',
                        fontSize: '1.1rem'
                      }}>
                        🛍️ Sipariş İçeriği
                      </h6>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                        {order.cart.map((item, index) => (
                          <div key={item._id?.$oid || index} style={{
                            backgroundColor: '#f8f9fa',
                            borderRadius: '8px',
                            padding: '1rem',
                            display: 'flex',
                            gap: '1rem'
                          }}>
                            <div style={{
                              width: '80px',
                              height: '80px',
                              backgroundColor: '#e9ecef',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '2rem'
                            }}>
                              {item.category === 'Elektronik' ? '📱' : 
                               item.category === 'Moda' || item.category === 'Fashion' ? '👕' : '📦'}
                            </div>
                            <div style={{ flex: 1 }}>
                              <h6 style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                {item.name}
                              </h6>
                              <p style={{ margin: '0 0 0.5rem 0', color: '#6c757d', fontSize: '0.8rem' }}>
                                Kategori: {item.category}
                              </p>
                              <p style={{ margin: '0 0 0.5rem 0', color: '#6c757d', fontSize: '0.8rem' }}>
                                Adet: <span style={{ fontWeight: 'bold' }}>{item.quantity}</span>
                              </p>
                              <p style={{ margin: 0, color: '#dc3545', fontWeight: 'bold' }}>
                                {item.price?.toFixed(2)} ₺
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Teslimat ve Kargo Bilgileri */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    <div style={{
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      padding: '1.5rem'
                    }}>
                      <h6 style={{ 
                        color: '#dc3545', 
                        fontWeight: 'bold', 
                        marginBottom: '1rem',
                        fontSize: '1.1rem'
                      }}>
                        🚚 Kargo Durumu
                      </h6>
                      <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6c757d' }}>Durum:</span>
                        <span style={{ fontWeight: 'bold' }}>{getCargoStatus(order.orderStatus)}</span>
                      </div>
                      <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6c757d' }}>Kargo Firması:</span>
                        <span style={{ fontWeight: 'bold' }}>Ücretsiz Kargo</span>
                      </div>
                      {order.orderStatus === 'shipped' && (
                        <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#6c757d' }}>Takip No:</span>
                          <span style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>TK{order.orderCode?.replace('ORD-', '')}</span>
                        </div>
                      )}
                    </div>

                    <div style={{
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      padding: '1.5rem'
                    }}>
                      <h6 style={{ 
                        color: '#dc3545', 
                        fontWeight: 'bold', 
                        marginBottom: '1rem',
                        fontSize: '1.1rem'
                      }}>
                        📍 Teslimat Adresi
                      </h6>
                      <div style={{ color: '#6c757d' }}>
                        {order.shippingInfo ? (
                          <>
                            <div style={{ fontWeight: 'bold', color: '#212529', marginBottom: '0.5rem' }}>
                              {order.firstName} {order.lastName}
                            </div>
                            <div style={{ marginBottom: '0.25rem' }}>{order.shippingInfo.address}</div>
                            <div style={{ marginBottom: '0.25rem' }}>
                              {order.shippingInfo.district}, {order.shippingInfo.city}
                            </div>
                            <div style={{ marginBottom: '0.5rem' }}>
                              Posta Kodu: {order.shippingInfo.postalCode}
                            </div>
                            {order.phone && (
                              <div style={{ marginTop: '0.5rem' }}>
                                📞 {order.phone}
                              </div>
                            )}
                          </>
                        ) : (
                          <span>Adres bilgisi bulunamadı</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ödeme Bilgileri */}
                  <div style={{ 
                    marginTop: '2rem', 
                    paddingTop: '2rem', 
                    borderTop: '1px solid #dee2e6' 
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'center' }}>
                      <div>
                        <h6 style={{ 
                          color: '#dc3545', 
                          fontWeight: 'bold', 
                          marginBottom: '1rem',
                          fontSize: '1.1rem'
                        }}>
                          💳 Ödeme Bilgileri
                        </h6>
                        <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#6c757d' }}>Ödeme Yöntemi:</span>
                          <span style={{ fontWeight: 'bold' }}>
                            {order.payment?.method === 'iyzico' ? 'Kredi Kartı (Iyzico)' : 'Kredi Kartı'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#6c757d' }}>Ödeme Durumu:</span>
                          <span style={{
                            backgroundColor: order.payment?.status === 'success' ? '#d1e7dd' : '#fff3cd',
                            color: order.payment?.status === 'success' ? '#0f5132' : '#664d03',
                            padding: '2px 8px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {order.payment?.status === 'success' ? 'Ödendi' : 'Beklemede'}
                          </span>
                        </div>
                        {order.payment?.iyzicoReference && (
                          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#6c757d' }}>
                            Referans: {order.payment.iyzicoReference}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <span style={{ color: '#6c757d' }}>Ara Toplam: </span>
                          <span style={{ fontWeight: 'bold' }}>{order.totalAmount?.toFixed(2)} ₺</span>
                        </div>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <span style={{ color: '#6c757d' }}>Kargo: </span>
                          <span style={{ fontWeight: 'bold' }}>Ücretsiz</span>
                        </div>
                        <div style={{ 
                          borderTop: '1px solid #dee2e6', 
                          paddingTop: '0.5rem',
                          marginTop: '0.5rem'
                        }}>
                          <span style={{ color: '#dc3545', fontWeight: 'bold', fontSize: '1.2rem' }}>
                            Toplam: {order.totalAmount?.toFixed(2)} ₺
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Aksiyon Butonları */}
                  <div style={{ 
                    marginTop: '2rem', 
                    paddingTop: '1.5rem', 
                    borderTop: '1px solid #dee2e6',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {order.orderStatus === 'shipped' && (
                        <button style={{
                          backgroundColor: 'transparent',
                          border: '1px solid #dc3545',
                          color: '#dc3545',
                          padding: '0.375rem 0.75rem',
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                          cursor: 'pointer'
                        }}>
                          🚚 Kargo Takip
                        </button>
                      )}
                      <button style={{
                        backgroundColor: 'transparent',
                        border: '1px solid #6c757d',
                        color: '#6c757d',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        cursor: 'pointer'
                      }}>
                        📄 Fatura İndir
                      </button>
                      {order.orderStatus === 'pending' && (
                        <button style={{
                          backgroundColor: 'transparent',
                          border: '1px solid #ffc107',
                          color: '#ffc107',
                          padding: '0.375rem 0.75rem',
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                          cursor: 'pointer'
                        }}>
                          ❌ Siparişi İptal Et
                        </button>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                      Son güncelleme: {formatDate(order.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && orders.length === 0 && !message.includes('Token') && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛍️</div>
            <h4 style={{ color: '#6c757d', marginBottom: '1rem' }}>Henüz siparişiniz bulunmuyor</h4>
            <p style={{ color: '#6c757d', marginBottom: '2rem' }}>İlk siparişinizi vermek için alışverişe başlayın!</p>
            <button style={{
              backgroundColor: '#dc3545',
              border: 'none',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
              🛒 Alışverişe Başla
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        button:hover {
          opacity: 0.8;
        }
      `}</style>
    </div>
  );