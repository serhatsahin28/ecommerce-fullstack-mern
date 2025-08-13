import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Spinner, Alert, Card, Row, Col, Badge } from 'react-bootstrap';
import axios from 'axios';

// Sipariş durumuna göre Bootstrap Badge rengini döndüren yardımcı fonksiyon.
const getStatusBadgeVariant = (status) => {
  switch (status?.toLowerCase()) {
    case 'teslim edildi':
      return 'success';
    case 'kargoya verildi':
      return 'info';
    case 'iptal edildi':
      return 'danger';
    case 'hazırlanıyor':
      return 'warning';
    case 'sipariş alındı':
    default:
      return 'primary';
  }
};

const ViewOrdersPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) {
        setError('Geçersiz bağlantı. Lütfen size gönderilen linki kontrol edin.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // NOT: Bu API adresi ve veri yapısı varsayımsaldır.
        // Kendi backend'inize göre URL'yi ve veri alanlarını (örn: item.imageUrl) düzenlemeniz gerekir.
        const response = await axios.get(`http://localhost:5000/api/orders/view-by-token?token=${token}`);
        
        if (response.data.success) {
          setOrders(response.data.orders);
          if (response.data.orders.length > 0) {
              setWelcomeMessage(`Hoş geldiniz! Hesabınıza ait toplam ${response.data.totalOrders} adet sipariş bulundu.`);
          }
        } else {
          setError(response.data.message || 'Siparişleriniz getirilirken bir sorun oluştu.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Sunucuya bağlanılamadı veya bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  // Yükleme Arayüzü
  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="danger" style={{ width: '3rem', height: '3rem' }} />
        <p className="mt-3 fs-5">Siparişleriniz yükleniyor...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5" style={{ maxWidth: '1000px' }}>
      <h1 className="mb-4 text-center text-danger fw-bold">Siparişlerim</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {welcomeMessage && !error && <Alert variant="success">{welcomeMessage}</Alert>}

      {!error && orders.length > 0 ? (
        <div className="d-flex flex-column gap-4 mt-4">
          {orders.map((order) => (
            <Card key={order._id} className="shadow-sm w-100">
              
              {/* Sipariş Başlığı */}
              <Card.Header className="bg-light p-3">
                <Row className="align-items-center">
                  <Col md={6}>
                    <h5 className="mb-1 fw-bold text-danger">Sipariş No: #{order.orderNumber || order._id.slice(-8)}</h5>
                    <small className="text-muted">
                      Sipariş Tarihi: {new Date(order.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </small>
                  </Col>
                  <Col md={6} className="text-md-end mt-2 mt-md-0">
                    <span className="me-2">Durum:</span>
                    <Badge pill bg={getStatusBadgeVariant(order.status)}>
                      {order.status || 'Bilinmiyor'}
                    </Badge>
                  </Col>
                </Row>
              </Card.Header>

              {/* Sipariş İçeriği (Ürünler) */}
              <Card.Body className="p-4">
                <h6 className="mb-3 text-secondary">SİPARİŞ İÇERİĞİ</h6>
                <div className="d-flex flex-column gap-3">
                  {order.items?.map((item) => (
                    <div key={item._id || item.productId} className="d-flex align-items-center border-bottom pb-3">
                      <img
                        src={item.imageUrl || 'https://via.placeholder.com/80x80.png?text=Urun'}
                        alt={item.name}
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                        className="rounded me-3"
                      />
                      <div className="flex-grow-1">
                        <h6 className="fw-bold mb-1">{item.name}</h6>
                        <p className="text-muted mb-0">
                          {item.quantity} Adet x {item.price?.toFixed(2)} ₺
                        </p>
                      </div>
                      <div className="ms-3 text-end">
                        <p className="fw-bold mb-0">{(item.quantity * item.price).toFixed(2)} ₺</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>

              {/* Sipariş Alt Bilgisi (Kargo ve Toplam Fiyat) */}
              <Card.Footer className="bg-light p-3">
                <Row>
                  <Col md={6}>
                    <h6 className="fw-bold">Kargo Bilgileri</h6>
                    {order.shippingInfo ? (
                      <>
                        <p className="mb-1">Kargo Firması: <strong>{order.shippingInfo.provider}</strong></p>
                        <p className="mb-0">Takip No: <strong>{order.shippingInfo.trackingNumber || 'Henüz atanmadı'}</strong></p>
                      </>
                    ) : (
                      <p className="mb-0 text-muted">Kargo bilgisi bulunmuyor.</p>
                    )}
                  </Col>
                  <Col md={6} className="text-md-end mt-3 mt-md-0">
                    <h6 className="fw-bold">Ödeme Özeti</h6>
                    <p className="mb-1">Ödeme Yöntemi: <strong>{order.paymentMethod || 'Belirtilmemiş'}</strong></p>
                    <h5 className="fw-bolder text-danger mb-0">
                      Toplam: {order.totalPrice?.toFixed(2)} ₺
                    </h5>
                  </Col>
                </Row>
              </Card.Footer>
            </Card>
          ))}
        </div>
      ) : (
        !loading && !error && (
            <Alert variant="info" className="text-center mt-4">
                Görüntülenecek herhangi bir siparişiniz bulunmuyor.
            </Alert>
        )
      )}
    </Container>
  );
};

export default ViewOrdersPage;