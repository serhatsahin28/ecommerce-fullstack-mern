import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Container, Spinner, Alert, Card, Row, Col, 
  Table, Badge, Button, Form, InputGroup
} from 'react-bootstrap';
import { 
  BsCalendarCheck, BsCreditCard, BsTruck, 
  BsBoxSeam, BsCheckCircle, BsChevronDown,
  BsGeoAlt, BsPerson, BsTelephone, BsEnvelope,
  BsReceipt, BsSearch, BsXCircle
} from 'react-icons/bs';
import axios from 'axios';

const ViewOrdersPageEn = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [activeStatus, setActiveStatus] = useState('all');
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('info');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter orders by status
  const filterOrders = (status) => {
    setActiveStatus(status);
    if (status === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.orderStatus === status));
    }
  };

  // Translate order status to English
  const getStatusText = (status) => {
    switch (status) {
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  // Status badge variant
  const getStatusVariant = (status) => {
    switch (status) {
      case 'processing': return 'primary';
      case 'shipped': return 'warning';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  // Translate payment method to English
  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'iyzico': return 'Credit/Debit Card';
      case 'cash': return 'Cash on Delivery';
      default: return method;
    }
  };

  // Cancel order
  const handleCancelOrder = (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      // Send cancel request to API
      axios.put(`http://localhost:5000/cancel-order/${orderId}`, { token })
        .then(response => {
          if (response.data.success) {
            // Update order status
            setOrders(orders.map(order => 
              order._id === orderId ? {...order, orderStatus: 'cancelled'} : order
            ));
            setFilteredOrders(filteredOrders.map(order => 
              order._id === orderId ? {...order, orderStatus: 'cancelled'} : order
            ));
            
            setVariant('success');
            setMessage('Order has been successfully cancelled!');
          }
        })
        .catch(err => {
          setVariant('danger');
          setMessage('Failed to cancel order: ' + (err.response?.data?.message || 'Server error'));
        });
    }
  };

  // Search orders
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === '') {
      filterOrders(activeStatus);
      return;
    }
    
    setFilteredOrders(
      orders.filter(order => 
        order.orderCode.toLowerCase().includes(term) && 
        (activeStatus === 'all' || order.orderStatus === activeStatus)
      )
    );
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        if (!token) {
          setVariant('danger');
          setMessage('Invalid link: Token not found.');
          setLoading(false);
          return;
        }

        // Fetch orders from API
        const response = await axios.get(`http://localhost:5000/view-orders?token=${token}`);

        if (response.data.success) {
          // Sort orders by date (newest first)
          const sortedOrders = response.data.orders.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          
          setOrders(sortedOrders);
          setFilteredOrders(sortedOrders);
          setVariant('success');
          setMessage(`Welcome! You have ${response.data.totalOrders} orders.`);
        } else {
          setVariant('warning');
          setMessage(response.data.message || 'Failed to load orders.');
        }
      } catch (err) {
        setVariant('danger');
        setMessage(err.response?.data?.message || 'Server error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  // Expand/collapse order
  const toggleOrderExpand = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  return (
    <Container className="py-4 py-md-5">
      <div className="text-center mb-4 mb-md-5">
        <h1 className="fw-bold text-danger mb-3">My Orders</h1>
        <p className="text-muted fs-5">Track all your orders here</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" size="lg" />
          <p className="mt-3 fs-5">Loading your orders...</p>
        </div>
      ) : (
        <>
          {message && (
            <Alert variant={variant} className="mb-4">
              {message}
            </Alert>
          )}
          
          {orders.length > 0 ? (
            <>
              {/* Order Search */}
              <div className="mb-4">
                <InputGroup>
                  <InputGroup.Text className="bg-white">
                    <BsSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search by order number..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </InputGroup>
              </div>
              
              {/* Filter Buttons */}
              <div className="d-flex justify-content-center mb-4 flex-wrap">
                <Button 
                  variant={activeStatus === 'all' ? 'danger' : 'outline-secondary'} 
                  className="me-2 mb-2 rounded-pill px-3"
                  onClick={() => filterOrders('all')}
                >
                  All Orders
                </Button>
                <Button 
                  variant={activeStatus === 'processing' ? 'danger' : 'outline-secondary'} 
                  className="me-2 mb-2 rounded-pill px-3"
                  onClick={() => filterOrders('processing')}
                >
                  Processing
                </Button>
                <Button 
                  variant={activeStatus === 'shipped' ? 'danger' : 'outline-secondary'} 
                  className="me-2 mb-2 rounded-pill px-3"
                  onClick={() => filterOrders('shipped')}
                >
                  Shipped
                </Button>
                <Button 
                  variant={activeStatus === 'delivered' ? 'danger' : 'outline-secondary'} 
                  className="me-2 mb-2 rounded-pill px-3"
                  onClick={() => filterOrders('delivered')}
                >
                  Delivered
                </Button>
                <Button 
                  variant={activeStatus === 'cancelled' ? 'danger' : 'outline-secondary'} 
                  className="mb-2 rounded-pill px-3"
                  onClick={() => filterOrders('cancelled')}
                >
                  Cancelled
                </Button>
              </div>
              
              {/* Orders List */}
              <Row className="g-4">
                {filteredOrders.map((order) => (
                  <Col xs={12} key={order._id}>
                    <Card className="border-0 shadow-sm overflow-hidden mb-4">
                      <Card.Header 
                        className="bg-light d-flex justify-content-between align-items-center cursor-pointer py-3"
                        onClick={() => toggleOrderExpand(order._id)}
                      >
                        <div className="d-flex flex-column flex-md-row align-items-md-center">
                          <span className="fw-bold me-0 me-md-3 mb-2 mb-md-0">
                            <BsReceipt className="me-2 text-danger" />
                            Order #: {order.orderCode}
                          </span>
                          <Badge 
                            bg={getStatusVariant(order.orderStatus)} 
                            className="fs-6 align-self-start align-self-md-center"
                          >
                            {getStatusText(order.orderStatus)}
                          </Badge>
                        </div>
                        <div className="d-flex align-items-center">
                          <span className="text-danger fw-bold me-2 fs-5">
                            {order.totalAmount.toFixed(2)} ₺
                          </span>
                          <BsChevronDown 
                            className={`fs-5 transition ${expandedOrder === order._id ? 'rotate' : ''}`} 
                          />
                        </div>
                      </Card.Header>
                      
                      {expandedOrder === order._id && (
                        <>
                          <Card.Body>
                            <Row>
                              {/* Left Column - Products */}
                              <Col md={6} className="mb-4 mb-md-0">
                                <h5 className="text-danger mb-3 d-flex align-items-center">
                                  <BsBoxSeam className="me-2" /> Products
                                </h5>
                                <div className="border rounded overflow-hidden">
                                  {order.cart.map((item, index) => (
                                    <div 
                                      key={item._id} 
                                      className={`d-flex align-items-center p-3 ${index < order.cart.length - 1 ? 'border-bottom' : ''}`}
                                    >
                                      <div className="bg-light rounded me-3 d-flex align-items-center justify-content-center" 
                                           style={{ width: '60px', height: '60px' }}>
                                        <BsBoxSeam className="text-muted fs-4" />
                                      </div>
                                      <div className="flex-grow-1">
                                        <div className="fw-bold">
                                          <a 
                                            href={`/product/${item.product_id}`} 
                                            className="text-decoration-none text-dark product-link"
                                          >
                                            {item.name}
                                          </a>
                                        </div>
                                        <div className="text-muted small">{item.category}</div>
                                        <div className="mt-1">
                                          {item.price.toFixed(2)} ₺ × {item.quantity}
                                        </div>
                                      </div>
                                      <div className="text-end fw-bold">
                                        {(item.price * item.quantity).toFixed(2)} ₺
                                      </div>
                                    </div>
                                  ))}
                                  <div className="bg-light p-3 d-flex justify-content-between">
                                    <span>Total:</span>
                                    <span className="fw-bold text-danger fs-5">
                                      {order.totalAmount.toFixed(2)} ₺
                                    </span>
                                  </div>
                                </div>
                              </Col>
                              
                              {/* Right Column - Order and Delivery Info */}
                              <Col md={6}>
                                <div className="mb-4">
                                  <h5 className="text-danger mb-3 d-flex align-items-center">
                                    <BsCalendarCheck className="me-2" /> Order Information
                                  </h5>
                                  <Table borderless size="sm" className="mb-4">
                                    <tbody>
                                      <tr>
                                        <td className="text-muted fw-bold" width="40%">Order Date:</td>
                                        <td>{new Date(order.createdAt).toLocaleString('en-US')}</td>
                                      </tr>
                                      <tr>
                                        <td className="text-muted fw-bold">Order Status:</td>
                                        <td>
                                          <Badge bg={getStatusVariant(order.orderStatus)}>
                                            {getStatusText(order.orderStatus)}
                                          </Badge>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td className="text-muted fw-bold">Total Amount:</td>
                                        <td className="fw-bold">{order.totalAmount.toFixed(2)} ₺</td>
                                      </tr>
                                    </tbody>
                                  </Table>
                                  
                                  <h5 className="text-danger mb-3 d-flex align-items-center">
                                    <BsGeoAlt className="me-2" /> Delivery Information
                                  </h5>
                                  <div className="border rounded p-3 bg-light mb-4">
                                    <p className="mb-1">
                                      <strong>Address:</strong> {order.shippingInfo.address}, {order.shippingInfo.district}, 
                                      {order.shippingInfo.city} {order.shippingInfo.postalCode}
                                    </p>
                                    <p className="mb-1">
                                      <BsPerson className="me-2" /> 
                                      {order.firstName} {order.lastName}
                                    </p>
                                    <p className="mb-1">
                                      <BsTelephone className="me-2" /> 
                                      {order.phone}
                                    </p>
                                    <p className="mb-0">
                                      <BsEnvelope className="me-2" /> 
                                      {order.email}
                                    </p>
                                    {order.shippingInfo.notes && (
                                      <p className="mt-2 mb-0">
                                        <strong>Note:</strong> {order.shippingInfo.notes}
                                      </p>
                                    )}
                                  </div>
                                  
                                  <h5 className="text-danger mb-3 d-flex align-items-center">
                                    <BsCreditCard className="me-2" /> Payment Information
                                  </h5>
                                  <div className="border rounded p-3 bg-light">
                                    <p className="mb-1">
                                      <strong>Method:</strong> {getPaymentMethodText(order.payment.method)}
                                    </p>
                                    <p className="mb-1">
                                      <strong>Status:</strong> 
                                      {order.payment.status === 'success' ? (
                                        <Badge bg="success" className="ms-2">Success</Badge>
                                      ) : (
                                        <Badge bg="warning" className="ms-2">Pending</Badge>
                                      )}
                                    </p>
                                    <p className="mb-1">
                                      <strong>Reference:</strong> {order.payment.iyzicoReference || '-'}
                                    </p>
                                    <p className="mb-0">
                                      <strong>Date:</strong> {new Date(order.payment.date).toLocaleString('en-US')}
                                    </p>
                                  </div>
                                </div>
                              </Col>
                            </Row>
                          </Card.Body>
                          
                          <Card.Footer className="bg-light d-flex justify-content-end">
                            <Button 
                              variant="outline-danger" 
                              size="sm" 
                              className="rounded-pill px-4 d-flex align-items-center"
                              onClick={() => handleCancelOrder(order._id)}
                              disabled={order.orderStatus !== 'processing'}
                            >
                              <BsXCircle className="me-2" /> Cancel Order
                            </Button>
                          </Card.Footer>
                        </>
                      )}
                    </Card>
                  </Col>
                ))}
              </Row>
            </>
          ) : (
            <Card className="border-0 shadow-sm text-center py-5">
              <BsCheckCircle className="text-success fs-1 mx-auto mb-3" />
              <Card.Title className="fs-4">No Orders Found</Card.Title>
              <Card.Text className="text-muted mb-4">
                No orders match your search criteria
              </Card.Text>
              <Button 
                variant="outline-danger" 
                size="lg" 
                className="rounded-pill px-4"
                onClick={() => {
                  setSearchTerm('');
                  filterOrders('all');
                }}
              >
                Show All Orders
              </Button>
            </Card>
          )}
        </>
      )}
      
      <style>{`
        .cursor-pointer {
          cursor: pointer;
        }
        
        .transition {
          transition: transform 0.3s ease;
        }
        
        .rotate {
          transform: rotate(180deg);
        }
        
        .bg-light {
          background-color: #f8f9fa !important;
        }
        
        .text-danger {
          color: #dc3545 !important;
        }
        
        .btn-danger {
          background-color: #dc3545;
          border-color: #dc3545;
        }
        
        .btn-outline-danger {
          color: #dc3545;
          border-color: #dc3545;
        }
        
        .btn-outline-danger:hover {
          background-color: #dc3545;
          border-color: #dc3545;
          color: white;
        }
        
        .card {
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .card:hover {
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
        }
        
        .shadow-sm {
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
        }
        
        .badge {
          padding: 0.5em 0.75em;
          font-weight: 500;
        }
        
        @media (max-width: 768px) {
          .fs-5 {
            font-size: 1rem !important;
          }
        }
        
        .product-link {
          color: #333;
          text-decoration: none;
          transition: color 0.2s;
        }
        
        .product-link:hover {
          color: #dc3545;
          text-decoration: underline;
        }
      `}</style>
    </Container>
  );
};

export default ViewOrdersPageEn;