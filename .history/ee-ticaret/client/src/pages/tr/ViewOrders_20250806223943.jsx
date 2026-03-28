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
  BsReceipt, BsSearch
} from 'react-icons/bs';
import axios from 'axios';

const ViewOrdersPage = () => {
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

  // Sipariş durumlarına göre filtreleme
  const filterOrders = (status) => {
    setActiveStatus(status);
    if (status === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.orderStatus === status));
    }
  };

  // Sipariş durumunu Türkçe'ye çevirme
  const getStatusText = (status) => {
    switch (status) {
      case 'processing': return 'Hazırlanıyor';
      case 'shipped': return 'Kargoya Verildi';
      case 'delivered': return 'Teslim Edildi';
      case 'cancelled': return 'İptal Edildi';
      default: return status;
    }
  };

  // Duruma göre badge rengi
  const getStatusVariant = (status) => {
    switch (status) {
      case 'processing': return 'primary';
      case 'shipped': return 'warning';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  // Ödeme yöntemini Türkçe'ye çevirme
  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'iyzico': return 'Kredi/Banka Kartı';
      case 'cash': return 'Kapıda Ödeme';
      default: return method;
    }
  };

  // Sipariş iptal etme
  const handleCancelOrder = (orderId) => {
    if (window.confirm('Bu siparişi iptal etmek istediğinize emin misiniz?')) {
      // API'ye iptal isteği gönderme
      axios.put(`http://localhost:5000/cancel-order/${orderId}`, { token })
        .then(response => {
          if (response.data.success) {
            // Sipariş durumunu güncelle
            setOrders(orders.map(order => 
              order._id === orderId ? {...order, orderStatus: 'cancelled'} : order
            ));
            setFilteredOrders(filteredOrders.map(order => 
              order._id === orderId ? {...order, orderStatus: 'cancelled'} : order
            ));
            
            setVariant('success');
            setMessage('Sipariş başarıyla iptal edildi!');
          }
        })
        .catch(err => {
          setVariant('danger');
          setMessage('Sipariş iptal edilemedi: ' + (err.response?.data?.message || 'Sunucu hatası'));
        });
    }
  };

  // Sipariş ara
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
          setMessage('Geçersiz bağlantı: Token bulunamadı.');
          setLoading(false);
          return;
        }

        // API'den sipariş verilerini çekme
        const response = await axios.get(`http://localhost:5000/view-orders?token=${token}`);

        if (response.data.success) {
          // Siparişleri tarihe göre sırala (en yeni üstte)
          const sortedOrders = response.data.orders.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          
          setOrders(sortedOrders);
          setFilteredOrders(sortedOrders);
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

  // Siparişi genişlet/daralt
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
        <h1 className="fw-bold text-danger mb-3">Siparişlerim</h1>
        <p className="text-muted fs-5">Tüm siparişlerinizi buradan takip edebilirsiniz</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" size="lg" />
          <p className="mt-3 fs-5">Siparişleriniz yükleniyor...</p>
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
              {/* Sipariş Arama */}
              <div className="mb-4">
                <InputGroup>
                  <InputGroup.Text className="bg-white">
                    <BsSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Sipariş numarası ile ara..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </InputGroup>
              </div>
              
              {/* Filtreleme Butonları */}
              <div className="d-flex justify-content-center mb-4 flex-wrap">
                <Button 
                  variant={activeStatus === 'all' ? 'danger' : 'outline-secondary'} 
                  className="me-2 mb-2 rounded-pill px-3"
                  onClick={() => filterOrders('all')}
                >
                  Tüm Siparişler
                </Button>
                <Button 
                  variant={activeStatus === 'processing' ? 'danger' : 'outline-secondary'} 
                  className="me-2 mb-2 rounded-pill px-3"
                  onClick={() => filterOrders('processing')}
                >
                  Hazırlananlar
                </Button>
                <Button 
                  variant={activeStatus === 'shipped' ? 'danger' : 'outline-secondary'} 
                  className="me-2 mb-2 rounded-pill px-3"
                  onClick={() => filterOrders('shipped')}
                >
                  Kargodakiler
                </Button>
                <Button 
                  variant={activeStatus === 'delivered' ? 'danger' : 'outline-secondary'} 
                  className="me-2 mb-2 rounded-pill px-3"
                  onClick={() => filterOrders('delivered')}
                >
                  Teslim Edilenler
                </Button>
                <Button 
                  variant={activeStatus === 'cancelled' ? 'danger' : 'outline-secondary'} 
                  className="mb-2 rounded-pill px-3"
                  onClick={() => filterOrders('cancelled')}
                >
                  İptal Edilenler
                </Button>
              </div>
              
              {/* Sipariş Listesi */}
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
                            Sipariş No: {order.orderCode}
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
                              {/* Sipariş Detayları */}
                              <Col md={6} className="mb-4 mb-md-0">
                                <h5 className="text-danger mb-3 d-flex align-items-center">
                                  <BsCalendarCheck className="me-2" /> Sipariş Bilgileri
                                </h5>
                                <Table borderless size="sm" className="mb-4">
                                  <tbody>
                                    <tr>
                                      <td className="text-muted fw-bold" width="40%">Sipariş Tarihi:</td>
                                      <td>{new Date(order.createdAt).toLocaleString('tr-TR')}</td>
                                    </tr>
                                    <tr>
                                      <td className="text-muted fw-bold">Sipariş Durumu:</td>
                                      <td>
                                        <Badge bg={getStatusVariant(order.orderStatus)}>
                                          {getStatusText(order.orderStatus)}
                                        </Badge>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="text-muted fw-bold">Toplam Tutar:</td>
                                      <td className="fw-bold">{order.totalAmount.toFixed(2)} ₺</td>
                                    </tr>
                                  </tbody>
                                </Table>
                                
                                <h5 className="text-danger mb-3 d-flex align-items-center">
                                  <BsGeoAlt className="me-2" /> Teslimat Bilgileri
                                </h5>
                                <div className="border rounded p-3 bg-light">
                                  <p className="mb-1">
                                    <strong>Adres:</strong> {order.shippingInfo.address}, {order.shippingInfo.district}, 
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
                                      <strong>Not:</strong> {order.shippingInfo.notes}
                                    </p>
                                  )}
                                </div>
                              </Col>
                              
                              {/* Ödeme ve Ürün Bilgileri */}
                              <Col md={6}>
                                <h5 className="text-danger mb-3 d-flex align-items-center">
                                  <BsCreditCard className="me-2" /> Ödeme Bilgileri
                                </h5>
                                <div className="border rounded p-3 bg-light mb-4">
                                  <p className="mb-1">
                                    <strong>Yöntem:</strong> {getPaymentMethodText(order.payment.method)}
                                  </p>
                                  <p className="mb-1">
                                    <strong>Durum:</strong> 
                                    {order.payment.status === 'success' ? (
                                      <Badge bg="success" className="ms-2">Başarılı</Badge>
                                    ) : (
                                      <Badge bg="warning" className="ms-2">Beklemede</Badge>
                                    )}
                                  </p>
                                  <p className="mb-1">
                                    <strong>Referans:</strong> {order.payment.iyzicoReference || '-'}
                                  </p>
                                  <p className="mb-0">
                                    <strong>Tarih:</strong> {new Date(order.payment.date).toLocaleString('tr-TR')}
                                  </p>
                                </div>
                                
                                <h5 className="text-danger mb-3 d-flex align-items-center">
                                  <BsBoxSeam className="me-2" /> Ürünler
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
                                    <span>Toplam:</span>
                                    <span className="fw-bold text-danger fs-5">
                                      {order.totalAmount.toFixed(2)} ₺
                                    </span>
                                  </div>
                                </div>
                              </Col>
                            </Row>
                          </Card.Body>
                          
                          <Card.Footer className="bg-light d-flex justify-content-between">
                            <Button 
                              variant="outline-danger" 
                              size="sm" 
                              className="rounded-pill px-4"
                              onClick={() => handleCancelOrder(order._id)}
                              disabled={order.orderStatus !== 'processing'}
                            >
                              Siparişi İptal Et
                            </Button>
                            <Button variant="danger" size="sm" className="rounded-pill px-4">
                              Tekrar Sipariş Ver
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
              <Card.Title className="fs-4">Sipariş Bulunamadı</Card.Title>
              <Card.Text className="text-muted mb-4">
                Arama kriterlerinize uygun sipariş bulunamadı
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
                Tüm Siparişleri Göster
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

export default ViewOrdersPage;