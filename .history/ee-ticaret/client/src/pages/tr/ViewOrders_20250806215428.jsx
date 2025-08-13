import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Spinner,
  Alert,
  Card,
  Row,
  Col,
  ListGroup,
  Badge,
  Image,
} from 'react-bootstrap';
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

        const response = await axios.get(
          `http://localhost:5000/view-orders?token=${token}`
        );

        if (response.data.success) {
          setOrders(response.data.orders);
          setVariant('success');
          setMessage(
            `Hoş geldiniz! Toplam ${response.data.totalOrders} siparişiniz bulundu.`
          );
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

  const renderStatusBadge = (status) => {
    if (!status) return <Badge bg="secondary">Bilinmiyor</Badge>;

    switch (status.toLowerCase()) {
      case 'delivered':
      case 'teslim edildi':
        return <Badge bg="success">Teslim Edildi</Badge>;
      case 'shipped':
      case 'kargoda':
        return <Badge bg="info">Kargoda</Badge>;
      case 'processing':
      case 'hazırlanıyor':
        return (
          <Badge bg="warning" text="dark">
            Hazırlanıyor
          </Badge>
        );
      case 'cancelled':
      case 'iptal edildi':
        return <Badge bg="danger">İptal Edildi</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: '1100px' }}>
      <h2 className="mb-4 text-center text-danger">Siparişlerim</h2>

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
          <p className="mt-3">Siparişleriniz yükleniyor...</p>
        </div>
      )}

      {!loading && message && <Alert variant={variant}>{message}</Alert>}

      {!loading &&
        orders.length > 0 &&
        orders.map((order) => (
          <Card className="mb-5 shadow-sm border-0" key={order._id}>
            <Card.Header className="d-flex justify-content-between align-items-center bg-danger text-white flex-column flex-md-row">
              <h5 className="mb-2 mb-md-0">
                Sipariş #{order.orderCode || order._id.slice(-6)}
              </h5>
              <small>{new Date(order.createdAt).toLocaleString()}</small>
            </Card.Header>

            <Card.Body>
              {/* Ürünler */}
              <h6 className="mb-3 text-danger">Ürünler</h6>
              <ListGroup variant="flush" className="mb-4">
                {order.cart.map((item) => (
                  <ListGroup.Item
                    key={item._id?.$oid || item._id}
                    className="d-flex flex-column flex-sm-row align-items-center gap-3"
                  >
                    <Image
                      src="/default-product.png"
                      alt={item.name}
                      rounded
                      style={{ width: 90, height: 90, objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{item.name}</h6>
                      <small className="text-muted">{item.category}</small>
                    </div>
                    <div
                      className="d-flex flex-column align-items-end"
                      style={{ minWidth: 110 }}
                    >
                      <span>
                        <strong>Adet:</strong> {item.quantity}
                      </span>
                      <span>
                        <strong>Birim Fiyat:</strong> {item.price.toFixed(2)} ₺
                      </span>
                      <span>
                        <strong>Toplam:</strong> {(item.price * item.quantity).toFixed(2)} ₺
                      </span>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>

              <Row>
                {/* Teslimat Adresi */}
                <Col xs={12} md={6} className="mb-4">
                  <h6 className="mb-3 text-danger">Teslimat Adresi</h6>
                  <ListGroup className="border rounded p-3">
                    <ListGroup.Item>
                      <strong>Adres:</strong> {order.shippingInfo?.address || '-'}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>İlçe:</strong> {order.shippingInfo?.district || '-'}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Şehir:</strong> {order.shippingInfo?.city || '-'}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Posta Kodu:</strong> {order.shippingInfo?.postalCode || '-'}
                    </ListGroup.Item>
                    {order.shippingInfo?.notes && (
                      <ListGroup.Item>
                        <strong>Notlar:</strong> {order.shippingInfo.notes}
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </Col>

                {/* Ödeme ve Sipariş Durumu */}
                <Col xs={12} md={6}>
                  <h6 className="mb-3 text-danger">Ödeme & Sipariş Durumu</h6>
                  <ListGroup className="border rounded p-3">
                    <ListGroup.Item>
                      <strong>Ödeme Yöntemi:</strong> {order.payment?.method || '-'}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Ödeme Durumu:</strong>{' '}
                      {order.payment?.status === 'success' ? (
                        <Badge bg="success">Başarılı</Badge>
                      ) : (
                        <Badge bg="danger">Başarısız</Badge>
                      )}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Ödeme Tarihi:</strong>{' '}
                      {order.payment?.date
                        ? new Date(order.payment.date.$date || order.payment.date).toLocaleString()
                        : '-'}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Sipariş Durumu:</strong> {renderStatusBadge(order.orderStatus)}
                    </ListGroup.Item>
                    {order.orderCode && (
                      <ListGroup.Item>
                        <strong>Sipariş Kodu:</strong> {order.orderCode}
                      </ListGroup.Item>
                    )}
                    {order.payment?.iyzicoReference && (
                      <ListGroup.Item>
                        <strong>İyzico Referans:</strong> {order.payment.iyzicoReference}
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </Col>
              </Row>

              <div className="mt-4 text-end">
                <h5>
                  Toplam Tutar:{' '}
                  <span className="text-danger">{order.totalAmount?.toFixed(2)} ₺</span>
                </h5>
              </div>
            </Card.Body>
          </Card>
        ))}
    </Container>
  );
};

export default ViewOrdersPage;
