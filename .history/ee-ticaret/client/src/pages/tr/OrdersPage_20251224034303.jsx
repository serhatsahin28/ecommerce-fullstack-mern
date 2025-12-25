import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Accordion, Table, Spinner, Form, InputGroup } from 'react-bootstrap';
import { Search, Truck, GeoAlt, CreditCard, Box } from 'react-bootstrap-icons';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/view/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setOrders(data.query || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const formatPrice = (p) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <Container className="py-4 bg-light min-vh-100">
      <h3 className="fw-bold mb-4">Siparişlerim</h3>

      {/* Arama Barı */}
      <InputGroup className="mb-4 shadow-sm">
        <InputGroup.Text className="bg-white border-end-0"><Search /></InputGroup.Text>
        <Form.Control 
          placeholder="Sipariş kodu ile ara..." 
          className="border-start-0"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>

      {/* Sipariş Listesi - 'alwaysOpen={false}' sayesinde biri açılınca diğeri kapanır */}
      <Accordion>
        {orders.filter(o => o.orderCode.includes(searchTerm)).map((order, idx) => (
          <Card key={idx} className="mb-3 border-0 shadow-sm rounded-3 overflow-hidden">
            <Accordion.Item eventKey={idx.toString()}>
              <Accordion.Header>
                <div className="d-flex justify-content-between w-100 me-3 align-items-center">
                  <div>
                    <span className="text-muted small d-block">Sipariş No</span>
                    <strong className="text-primary">#{order.orderCode}</strong>
                  </div>
                  <div className="text-center">
                    <span className="text-muted small d-block">Durum</span>
                    <Badge bg="info">{order.orderStatus}</Badge>
                  </div>
                  <div className="text-end text-nowrap">
                    <span className="text-muted small d-block">Toplam</span>
                    <strong className="text-dark">{formatPrice(order.totalAmount)}</strong>
                  </div>
                </div>
              </Accordion.Header>

              <Accordion.Body className="bg-white">
                <Row className="g-4">
                  {/* Ürünler */}
                  <Col lg={8}>
                    <h6 className="fw-bold mb-3"><Box className="me-2"/>Ürünler</h6>
                    <div className="table-responsive">
                      <Table hover align="middle">
                        <tbody>
                          {order.cart.map((item, i) => (
                            <tr key={i}>
                              <td style={{ width: '60px' }}>
                                <img src={item.image} alt="" className="rounded border" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                              </td>
                              <td>
                                <div className="fw-bold small">{item.name}</div>
                                <div className="text-muted small">{item.quantity} Adet x {formatPrice(item.price)}</div>
                              </td>
                              <td className="text-end fw-bold">{formatPrice(item.price * item.quantity)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Col>

                  {/* Adres ve Özet */}
                  <Col lg={4}>
                    <div className="p-3 bg-light rounded-3 mb-3">
                      <h6 className="fw-bold small"><GeoAlt className="me-2"/>Teslimat Adresi</h6>
                      <p className="small text-muted mb-0">
                        {order.shippingInfo.address}<br/>
                        {order.shippingInfo.district} / {order.shippingInfo.city}
                      </p>
                    </div>

                    <div className="p-3 bg-light rounded-3">
                      <h6 className="fw-bold small"><CreditCard className="me-2"/>Sipariş Özeti</h6>
                      <div className="d-flex justify-content-between small mb-1">
                        <span>Ara Toplam:</span>
                        <span>{formatPrice(order.totalAmount)}</span>
                      </div>
                      <div className="d-flex justify-content-between small mb-1">
                        <span>Kargo:</span>
                        <span className="text-success fw-bold">Ücretsiz</span>
                      </div>
                      <hr/>
                      <div className="d-flex justify-content-between fw-bold text-primary">
                        <span>Genel Toplam:</span>
                        <span>{formatPrice(order.totalAmount)}</span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>
          </Card>
        ))}
      </Accordion>
    </Container>
  );
};

export default OrdersPage;