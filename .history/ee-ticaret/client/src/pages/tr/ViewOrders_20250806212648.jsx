import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Spinner, Alert, Card, Row, Col } from 'react-bootstrap';
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

        const response = await axios.get(`http://localhost:5000/mail/view-orders?token=${token}`);

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

  return (
    <Container className="py-5" style={{ maxWidth: '900px' }}>
      <h2 className="mb-4 text-center text-danger">Siparişlerim</h2>

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
          <p className="mt-3">Siparişleriniz yükleniyor...</p>
        </div>
      )}

      {!loading && message && <Alert variant={variant}>{message}</Alert>}

      {!loading && orders.length > 0 && (
        <Row className="mt-4">
          {orders.map((order) => (
            <Col md={6} lg={4} key={order._id} className="mb-4">
              <Card className="shadow-sm border-0 h-100">
                <Card.Body>
                  <Card.Title className="text-danger">Sipariş #{order._id.slice(-6)}</Card.Title>
                  <Card.Text>
                    <strong>Tarih:</strong> {new Date(order.createdAt).toLocaleString()} <br />
                    <strong>Toplam:</strong> {order.totalPrice?.toFixed(2)} ₺ <br />
                    <strong>Durum:</strong> {order.status || 'Beklemede'}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default ViewOrdersPage;
