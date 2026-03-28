

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Spinner, Badge, Button, Card, Form, InputGroup, Container, Row, Col, Modal } from 'react-bootstrap';
import { BagCheck, Search, XCircle, Eye } from 'react-bootstrap-icons';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const navigate = useNavigate();

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Oturum açmanız gerekiyor');

      const res = await fetch('http://localhost:5000/view/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Siparişler yüklenemedi');
      const data = await res.json();
      const sorted = (data.query || []).sort((a, b) => 
        new Date(b.createdAt.$date || b.createdAt) - new Date(a.createdAt.$date || a.createdAt)
      );
      setOrders(sorted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => new Date(d.$date || d).toLocaleDateString('tr-TR', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const formatPrice = (p) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p);

  const statusMap = {
    processing: { bg: 'warning', text: '⏳ İşleniyor' },
    shipped: { bg: 'info', text: '🚚 Kargoya Verildi' },
    delivered: { bg: 'success', text: '✅ Teslim Edildi' },
    cancel_pending: { bg: 'warning', text: '⏳ İptal Bekliyor' },
    cancelled: { bg: 'danger', text: '❌ İptal Edildi' }
  };

  const confirmCancel = async () => {
    try {
      await fetch("http://localhost:5000/admin/OrdersCancelRequest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_code: orderToCancel, cancelReason })
      });
      setShowCancelModal(false);
      setCancelReason("");
      window.location.reload();
    } catch (err) {
      alert("İptal hatası");
    }
  };

  const filtered = orders.filter(o => {
    const s = o.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${o.firstName} ${o.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const f = filterStatus === 'all' || o.orderStatus === filterStatus;
    return s && f;
  });

  if (loading) return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <Spinner animation="border" style={{ width: '4rem', height: '4rem' }} />
    </div>
  );

  if (error) return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-3">
      <Card className="border-0 shadow" style={{ maxWidth: '400px' }}>
        <Card.Body className="p-4 text-center">
          <h4 className="mb-3">❌ Hata</h4>
          <p>{error}</p>
          <Button onClick={fetchOrders}>Tekrar Dene</Button>
        </Card.Body>
      </Card>
    </div>
  );

  if (orders.length === 0) return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <Card className="border-0 shadow" style={{ maxWidth: '400px' }}>
        <Card.Body className="p-4 text-center">
          <BagCheck size={48} className="text-primary mb-3" />
          <h4>Henüz Sipariş Yok</h4>
          <Button className="mt-3" onClick={() => navigate('/products')}>Alışverişe Başla</Button>
        </Card.Body>
      </Card>
    </div>
  );

  return (
    <div className="bg-light min-vh-100">
      <div className="bg-white shadow-sm border-bottom">
        <Container className="py-4">
          <h3 className="fw-bold">
            <BagCheck className="me-2" />
            Siparişlerim ({filtered.length})
          </h3>
        </Container>
      </div>

      <Container className="py-4">
        <Row className="g-3 mb-4">
          <Col md={8}>
            <InputGroup>
              <InputGroup.Text><Search /></InputGroup.Text>
              <Form.Control placeholder="Ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </InputGroup>
          </Col>
          <Col md={4}>
            <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">Tümü</option>
              <option value="processing">İşleniyor</option>
              <option value="shipped">Kargoda</option>
              <option value="delivered">Teslim Edildi</option>
              <option value="cancel_pending">İptal Onayı Bekliyor</option>

              <option value="cancelled">İptal</option>
            </Form.Select>
          </Col>
        </Row>

        {filtered.map(o => {
          const st = statusMap[o.orderStatus] || { bg: 'secondary', text: o.orderStatus };
          return (
            <Card key={o._id} className="mb-3 border-0 shadow-sm">
              <Card.Body className="p-4">
                <Row className="align-items-center mb-3 pb-3 border-bottom">
                  <Col xs={6} md={3}>
                    <small className="text-muted">Sipariş No</small>
                    <div className="fw-bold text-primary">#{o.orderCode}</div>
                  </Col>
                  <Col xs={6} md={3}>
                    <small className="text-muted">Tarih</small>
                    <div className="small">{formatDate(o.createdAt)}</div>
                  </Col>
                  <Col xs={6} md={3}>
                    <small className="text-muted">Müşteri</small>
                    <div className="small">{o.firstName} {o.lastName}</div>
                  </Col>
                  <Col xs={6} md={3}>
                    <Badge bg={st.bg} className="w-100 py-2">{st.text}</Badge>
                  </Col>
                </Row>

                <Row className="align-items-center">
                  <Col xs={6}>
                    <div className="fs-4 fw-bold text-primary">{formatPrice(o.totalAmount)}</div>
                    <small className="text-muted">{o.cart.length} ürün</small>
                  </Col>
                  <Col xs={6} className="text-end">
                    <Button size="sm" variant="primary" className="me-2" onClick={() => {
                      setSelectedOrder(o);
                      setShowDetailModal(true);
                    }}>
                      <Eye className="me-1" /> Detay
                    </Button>
                    {o.orderStatus === 'processing' && (
                      <Button size="sm" variant="outline-danger" onClick={() => {
                        setOrderToCancel(o.orderCode);
                        setShowCancelModal(true);
                      }}>
                        <XCircle className="me-1" /> İptal
                      </Button>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-5">
            <h5>Sonuç bulunamadı</h5>
            <Button variant="outline-primary" onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}>
              Temizle
            </Button>
          </div>
        )}
      </Container>

      {/* Detay Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Sipariş Detayları</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <div className="mb-4 p-3 bg-light rounded">
                <Row>
                  <Col xs={6}>
                    <small className="text-muted">Sipariş No</small>
                    <div className="fw-bold">#{selectedOrder.orderCode}</div>
                  </Col>
                  <Col xs={6}>
                    <small className="text-muted">Durum</small>
                    <div>
                      <Badge bg={statusMap[selectedOrder.orderStatus]?.bg || 'secondary'}>
                        {statusMap[selectedOrder.orderStatus]?.text || selectedOrder.orderStatus}
                      </Badge>
                    </div>
                  </Col>
                </Row>
              </div>

              <h6 className="fw-bold mb-3">Ürünler</h6>
              {selectedOrder.cart.map((item, i) => (
                <div key={i} className="d-flex align-items-center mb-3 p-2 border rounded">
                  <div style={{ width: '60px', height: '60px', minWidth: '60px' }} className="me-3">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-100 h-100 rounded" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className="bg-secondary bg-opacity-10 w-100 h-100 rounded d-flex align-items-center justify-content-center">
                        📦
                      </div>
                    )}
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-medium">{item.name}</div>
                    <small className="text-muted">Adet: {item.quantity}</small>
                  </div>
                  <div className="text-end">
                    <div className="fw-bold">{formatPrice(item.price * item.quantity)}</div>
                    <small className="text-muted">{formatPrice(item.price)} / adet</small>
                  </div>
                </div>
              ))}

              <div className="border-top pt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Ara Toplam</span>
                  <span className="fw-bold">{formatPrice(selectedOrder.totalAmount)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Kargo</span>
                  <Badge bg="success">Ücretsiz</Badge>
                </div>
                <div className="d-flex justify-content-between fs-5 fw-bold text-primary border-top pt-2">
                  <span>Genel Toplam</span>
                  <span>{formatPrice(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-light rounded">
                <h6 className="fw-bold mb-2">📍 Teslimat Adresi</h6>
                <div>{selectedOrder.shippingInfo.address}</div>
                <div>{selectedOrder.shippingInfo.district}, {selectedOrder.shippingInfo.city}</div>
                <div className="mt-2">
                  <Badge bg="secondary">📮 {selectedOrder.shippingInfo.postalCode}</Badge>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* İptal Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Sipariş İptali</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>#{orderToCancel} nolu siparişi iptal etmek istediğinize emin misiniz?</p>
          <Form.Control as="textarea" rows={3} placeholder="İptal nedeni (opsiyonel)"
            value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>Vazgeç</Button>
          <Button variant="danger" onClick={confirmCancel}>İptal Et</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrdersPage;