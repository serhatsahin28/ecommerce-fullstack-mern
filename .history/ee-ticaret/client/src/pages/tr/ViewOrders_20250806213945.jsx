import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Spinner, Alert, Card, Row, Col, ListGroup, Badge } from 'react-bootstrap';
import axios from 'axios';

const ViewOrdersPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('info');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!token) {
          setVariant('danger');
          setMessage('Geçersiz bağlantı: Token bulunamadı.');
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://localhost:5000/view-orders?token=${token}`);

        if (response.data.success) {
          setOrders(response.data.orders);
          setVariant('success');
          setMessage(`Hoş geldiniz! Toplam ${response.data.totalOrders} siparişiniz bulundu.`);
        } else {
          setVariant('warning');
          setMessage(response.data.message || 'Siparişler getirilemedi.');
        }
      } catch (err) {
        setVariant('danger');
        setMessage(err.response?.data?.message || 'Sunucu hatası oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  // Yardımcı fonksiyon: Durumu renkli badge ile göster
  const renderStatusBadge = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'teslim edildi':
        return <Badge bg="success">Teslim Edildi</Badge>;
      case 'kargoda':
        return <Badge bg="info">Kargoda</Badge>;
      case 'hazırlanıyor':
        return <Badge bg="warning" text="dark">Hazırlanıyor</Badge>;
      case 'iptal edildi':
        return <Badge bg="danger">İptal Edildi</Badge>;
      default:
        return <Badge bg="secondary">Beklemede</Badge>;
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: '1000px' }}>
      <h2 className="mb-4 text-center text-danger">Siparişlerim</h2>

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
          <p className="mt-3">Siparişleriniz yükleniyor...</p>
        </div>
      )}

      {!loading && message && <Alert variant={variant}>{message}</Alert>}

      {!loading && orders.length > 0 && (
        <Row className="g-4">
          {orders.map((order) => (
            <Col md={12} key={order._id}>
              <Card className="shadow-sm border-0">
                <Card.Header className="d-flex justify-content-between align-items-center bg-danger text-white">
                  <h5 className="mb-0">Sipariş #{order._id.slice(-6)}</h5>
                  <small>{new Date(order.createdAt).toLocaleString()}</small>
                </Card.Header>

                <Card.Body>
                  <ListGroup variant="flush">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item) => (
                        <ListGroup.Item key={item.productId} className="d-flex align-items-center">
                          <img
                            src={item.image || '/default-product.png'}
                            alt={item.name}
                            style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, marginRight: 16 }}
                          />
                          <div className="flex-grow-1">
                            <h6 className="mb-1">{item.name}</h6>
                            <small>Adet: {item.quantity}</small><br />
                            <small>Birim Fiyatı: {item.price.toFixed(2)} ₺</small>
                          </div>
                          <div style={{ minWidth: 100, textAlign: 'right', fontWeight: 'bold' }}>
                            {(item.price * item.quantity).toFixed(2)} ₺
                          </div>
                        </ListGroup.Item>
                      ))
                    ) : (
                      <ListGroup.Item>Bu sipariş için ürün bulunamadı.</ListGroup.Item>
                    )}
                  </ListGroup>
                </Card.Body>

                <Card.Footer className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Toplam Tutar:</strong> {order.totalPrice?.toFixed(2)} ₺
                  </div>
                  <div>
                    <strong>Kargo Durumu: </strong> {renderStatusBadge(order.shippingStatus || order.status)}
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {!loading && !orders.length && (
        <div className="text-center mt-5">
          <p>Henüz siparişiniz bulunmamaktadır.</p>
        </div>
      )}
    </Container>
  );
};

export default ViewOrdersPage;
