import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { 
  Spinner, Badge, Button, Card, Form, InputGroup, 
  Container, Row, Col, Modal 
} from 'react-bootstrap';
import { 
  BagCheck, Search, XCircle, Eye, Calendar, 
  Person, GeoAlt, Box, CreditCard, InfoCircle 
} from 'react-bootstrap-icons';

const OrdersPageEn = () => {
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
      if (!token) throw new Error('You need to log in');

      const res = await fetch('http://localhost:5000/view/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Could not load orders');
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

  const formatDate = (d) => new Date(d.$date || d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const formatPrice = (p) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p);

  // Status mapping with support for multiple backend strings
  const statusMap = {
    processing: { bg: 'warning', text: '⏳ Processing' },
    shipped: { bg: 'info', text: '🚚 Shipped' },
    delivered: { bg: 'success', text: '✅ Delivered' },
    cancel_pending: { bg: 'secondary', text: '⏳ Cancel Pending' },
    'iptal talebi var': { bg: 'secondary', text: '⏳ Cancel Pending' },
    cancelled: { bg: 'danger', text: '❌ Cancelled' },
    'iptal': { bg: 'danger', text: '❌ Cancelled' }
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
      fetchOrders(); // Reload orders after cancel
    } catch (err) {
      alert("Cancellation error");
    }
  };

  const filtered = orders.filter(o => {
    const s = o.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${o.firstName} ${o.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = filterStatus === 'all' || o.orderStatus === filterStatus;
    
    // Support for varied status strings in filtering
    if (filterStatus === 'cancel_pending' && (o.orderStatus === 'cancel_pending' || o.orderStatus === 'iptal talebi var')) matchesStatus = true;
    if (filterStatus === 'cancelled' && (o.orderStatus === 'cancelled' || o.orderStatus === 'iptal')) matchesStatus = true;
    
    return s && matchesStatus;
  });

  if (loading) return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <Spinner animation="border" variant="primary" style={{ width: '4rem', height: '4rem' }} />
    </div>
  );

  if (error) return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-3">
      <Card className="border-0 shadow" style={{ maxWidth: '400px' }}>
        <Card.Body className="p-4 text-center">
          <h4 className="mb-3 text-danger">❌ Error</h4>
          <p>{error}</p>
          <Button onClick={fetchOrders}>Try Again</Button>
        </Card.Body>
      </Card>
    </div>
  );

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* Header */}
      <div className="bg-white shadow-sm border-bottom mb-4">
        <Container className="py-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <h3 className="fw-bold mb-0">
              <BagCheck className="me-2 text-primary" />
              My Orders ({filtered.length})
            </h3>
            <Button variant="outline-primary" size="sm" onClick={() => navigate('/products')}>
              Continue Shopping
            </Button>
          </div>
        </Container>
      </div>

      <Container>
        {/* Filters */}
        <Row className="g-3 mb-4">
          <Col md={8}>
            <InputGroup className="shadow-sm">
              <InputGroup.Text className="bg-white border-end-0"><Search className="text-muted"/></InputGroup.Text>
              <Form.Control 
                className="border-start-0" 
                placeholder="Search by order code or name..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </InputGroup>
          </Col>
          <Col md={4}>
            <Form.Select className="shadow-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancel_pending">Cancel Pending</option>
              <option value="cancelled">Cancelled</option>
            </Form.Select>
          </Col>
        </Row>

        {/* Order Cards */}
        {filtered.map(o => {
          const st = statusMap[o.orderStatus] || { bg: 'secondary', text: o.orderStatus };
          return (
            <Card key={o._id.$oid || o._id} className="mb-3 border-0 shadow-sm hover-shadow transition">
              <Card.Body className="p-4">
                <Row className="align-items-center mb-3 pb-3 border-bottom">
                  <Col xs={6} md={3} className="mb-2 mb-md-0">
                    <small className="text-muted d-block uppercase small fw-bold">Order Code</small>
                    <div className="fw-bold text-primary">#{o.orderCode}</div>
                  </Col>
                  <Col xs={6} md={3} className="mb-2 mb-md-0">
                    <small className="text-muted d-block uppercase small fw-bold">Date</small>
                    <div className="small"><Calendar className="me-1"/>{formatDate(o.createdAt)}</div>
                  </Col>
                  <Col xs={6} md={3}>
                    <small className="text-muted d-block uppercase small fw-bold">Customer</small>
                    <div className="small text-truncate"><Person className="me-1"/>{o.firstName} {o.lastName}</div>
                  </Col>
                  <Col xs={6} md={3}>
                    <Badge bg={st.bg} className="w-100 py-2">{st.text}</Badge>
                  </Col>
                </Row>

                <Row className="align-items-center">
                  <Col xs={6}>
                    <div className="fs-4 fw-bold text-dark">{formatPrice(o.totalAmount)}</div>
                    <small className="text-muted">{o.cart.length} item(s)</small>
                  </Col>
                  <Col xs={6} className="text-end">
                    <Button size="sm" variant="primary" className="me-2 px-3" onClick={() => {
                      setSelectedOrder(o);
                      setShowDetailModal(true);
                    }}>
                      <Eye className="me-1" /> Details
                    </Button>
                    {o.orderStatus === 'processing' && (
                      <Button size="sm" variant="outline-danger" onClick={() => {
                        setOrderToCancel(o.orderCode);
                        setShowCancelModal(true);
                      }}>
                        <XCircle className="me-1" /> Cancel
                      </Button>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          );
        })}

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-5 bg-white rounded shadow-sm">
            <InfoCircle size={40} className="text-muted mb-3" />
            <h5>No orders found</h5>
            <Button variant="link" onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </Container>

      {/* Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          {selectedOrder && (
            <>
              <div className="mb-4 p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted d-block">Order ID</small>
                  <span className="fw-bold">#{selectedOrder.orderCode}</span>
                </div>
                <div className="text-end">
                  <small className="text-muted d-block">Status</small>
                  <Badge bg={statusMap[selectedOrder.orderStatus]?.bg || 'secondary'}>
                    {statusMap[selectedOrder.orderStatus]?.text || selectedOrder.orderStatus}
                  </Badge>
                </div>
              </div>

              <h6 className="fw-bold mb-3"><Box className="me-2 text-primary"/>Products</h6>
              <div className="mb-4">
                {selectedOrder.cart.map((item, i) => (
                  <div key={i} className="d-flex align-items-center mb-2 p-2 border rounded-3 bg-white">
                    <div style={{ width: '60px', height: '60px', minWidth: '60px' }} className="me-3">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-100 h-100 rounded" style={{ objectFit: 'cover' }} />
                      ) : (
                        <div className="bg-light w-100 h-100 rounded d-flex align-items-center justify-content-center text-muted">📦</div>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-bold small">{item.name}</div>
                      <small className="text-muted">Qty: {item.quantity}</small>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold small">{formatPrice(item.price * item.quantity)}</div>
                      <small className="text-muted" style={{fontSize: '0.75rem'}}>{formatPrice(item.price)} / ea</small>
                    </div>
                  </div>
                ))}
              </div>

              <Row className="g-3">
                <Col md={6}>
                  <div className="p-3 bg-light rounded-3 h-100">
                    <h6 className="fw-bold small mb-2"><GeoAlt className="me-2 text-primary"/>Shipping Address</h6>
                    <div className="small fw-bold">{selectedOrder.firstName} {selectedOrder.lastName}</div>
                    <div className="small text-muted">{selectedOrder.shippingInfo.address}</div>
                    <div className="small text-muted">{selectedOrder.shippingInfo.district}, {selectedOrder.shippingInfo.city}</div>
                    <div className="mt-2 small fw-medium">📮 {selectedOrder.shippingInfo.postalCode}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="p-3 bg-light rounded-3 h-100">
                    <h6 className="fw-bold small mb-3"><CreditCard className="me-2 text-primary"/>Order Summary</h6>
                    <div className="d-flex justify-content-between mb-1 small">
                      <span className="text-muted">Subtotal</span>
                      <span>{formatPrice(selectedOrder.totalAmount)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1 small text-success">
                      <span>Shipping</span>
                      <span className="fw-bold">Free</span>
                    </div>
                    <hr className="my-2"/>
                    <div className="d-flex justify-content-between fs-5 fw-bold text-primary">
                      <span>Total</span>
                      <span>{formatPrice(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Cancel Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-danger">Cancel Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">Are you sure you want to cancel order <strong>#{orderToCancel}</strong>?</p>
          <Form.Label className="small fw-bold">Reason for Cancellation (Optional)</Form.Label>
          <Form.Control 
            as="textarea" 
            rows={3} 
            placeholder="Please enter why you want to cancel..."
            value={cancelReason} 
            onChange={(e) => setCancelReason(e.target.value)} 
          />
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowCancelModal(false)}>Go Back</Button>
          <Button variant="danger" className="px-4" onClick={confirmCancel}>Confirm Cancellation</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrdersPageEn;