// import React, { useState, useEffect } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import { 
//   Spinner, Alert, Badge, Button, Card, Table, 
//   Container, Row, Col, InputGroup, Form, Accordion
// } from 'react-bootstrap';
// import { 
//   BagCheck, Search, Calendar, Person, CurrencyDollar,
//   Truck, CheckCircle, XCircle, InfoCircle, GeoAlt,
//   Cart, CreditCard, Envelope, Telephone, Box, ListUl, ChevronDown, ChevronUp
// } from 'react-bootstrap-icons';

// const OrdersPage = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [activeAccordion, setActiveAccordion] = useState(null);
//   useEffect(() => {
//     fetchOrders();
//   }, []);
//   const fetchOrders = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const token = localStorage.getItem('token');
//       if (!token) {
//         throw new Error('Oturum açmanız gerekiyor');
//       }

//       const response = await fetch('http://localhost:5000/view/orders', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Siparişler yüklenemedi');
//       }

//       const data = await response.json();
      
//       // Tarihe göre sırala (en yeni en üstte)
//       const sortedOrders = (data.query || []).sort((a, b) => {
//         const dateA = new Date(a.createdAt.$date || a.createdAt);
//         const dateB = new Date(b.createdAt.$date || b.createdAt);
//         return dateB - dateA;
//       });
      
//       setOrders(sortedOrders);
      
//       // İlk siparişi açık olarak ayarla
//       if (sortedOrders.length > 0) {
//         setActiveAccordion(sortedOrders[0]._id.$oid);
//       }
      
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatDate = (dateString) => {
//     let date;
//     if (dateString.$date) {
//       date = new Date(dateString.$date);
//     } else {
//       date = new Date(dateString);
//     }
//     return date.toLocaleDateString('tr-TR', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const formatPrice = (price) => {
//     return new Intl.NumberFormat('tr-TR', {
//       style: 'currency',
//       currency: 'TRY'
//     }).format(price);
//   };

//   const getStatusBadge = (status) => {
//     const statusMap = {
//       'processing': {
//         variant: 'warning',
//         text: 'İşleniyor',
//         icon: <span className="me-1">⏳</span>
//       },
//       'shipped': {
//         variant: 'info',
//         text: 'Kargoya Verildi',
//         icon: <Truck className="me-1" />
//       },
//       'delivered': {
//         variant: 'success',
//         text: 'Teslim Edildi',
//         icon: <CheckCircle className="me-1" />
//       },
//       'cancelled': {
//         variant: 'danger',
//         text: 'İptal Edildi',
//         icon: <XCircle className="me-1" />
//       }
//     };

//     const statusInfo = statusMap[status] || {
//       variant: 'secondary',
//       text: status,
//       icon: <InfoCircle className="me-1" />
//     };

//     return (
//       <Badge bg={statusInfo.variant} className="px-3 py-2">
//         {statusInfo.icon}
//         {statusInfo.text}
//       </Badge>
//     );
//   };

//   const toggleAccordion = (orderId) => {
//     setActiveAccordion(activeAccordion === orderId ? null : orderId);
//   };

//   const filteredOrders = orders.filter(order => {
//     const matchesSearch = order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       `${order.firstName} ${order.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus = filterStatus === 'all' || order.orderStatus === filterStatus;
//     return matchesSearch && matchesStatus;
//   });

//   if (loading) {
//     return (
//       <Container className="my-5 py-5">
//         <Row className="justify-content-center">
//           <Col md={6} className="text-center">
//             <Spinner animation="border" variant="primary" />
//             <h5 className="mt-3">Siparişleriniz yükleniyor...</h5>
//             <p className="text-muted">Lütfen bekleyiniz</p>
//           </Col>
//         </Row>
//       </Container>
//     );
//   }

//   if (error) {
//     return (
//       <Container className="my-5 py-5">
//         <Row className="justify-content-center">
//           <Col md={6}>
//             <Alert variant="danger">
//               <Alert.Heading>Bir Hata Oluştu</Alert.Heading>
//               <p>{error}</p>
//               <hr />
//               <div className="d-flex justify-content-end">
//                 <Button variant="outline-danger" onClick={fetchOrders}>
//                   Tekrar Dene
//                 </Button>
//               </div>
//             </Alert>
//           </Col>
//         </Row>
//       </Container>
//     );
//   }

//   if (orders.length === 0) {
//     return (
//       <Container className="my-5 py-5">
//         <Row className="justify-content-center">
//           <Col md={6} className="text-center">
//             <Card className="border-0 shadow-sm">
//               <Card.Body className="py-5">
//                 <BagCheck size={48} className="text-muted mb-3" />
//                 <h3 className="text-muted">Henüz Sipariş Yok</h3>
//                 <p className="text-muted mb-4">
//                   Alışverişe başlayarak ilk siparişinizi oluşturun.
//                 </p>
//                 <Button variant="primary">Alışverişe Başla</Button>
//               </Card.Body>
//             </Card>
//           </Col>
//         </Row>
//       </Container>
//     );
//   }

//   return (
//     <Container className="my-4">
//       {/* Başlık ve Filtreleme */}
//       <Row className="mb-4 align-items-center">
//         <Col md={6}>
//           <h2 className="mb-0">
//             <BagCheck className="text-primary me-2" />
//             Siparişlerim
//           </h2>
//         </Col>
//         <Col md={6}>
//           <InputGroup>
//             <InputGroup.Text>
//               <Search />
//             </InputGroup.Text>
//             <Form.Control
//               placeholder="Sipariş ara..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//             <Form.Select 
//               style={{ maxWidth: '200px' }}
//               value={filterStatus}
//               onChange={(e) => setFilterStatus(e.target.value)}
//             >
//               <option value="all">Tüm Durumlar</option>
//               <option value="processing">İşleniyor</option>
//               <option value="shipped">Kargoya Verildi</option>
//               <option value="delivered">Teslim Edildi</option>
//               <option value="cancelled">İptal Edildi</option>
//             </Form.Select>
//           </InputGroup>
//         </Col>
//       </Row>

//       {/* Sipariş Listesi */}
//       {filteredOrders.length > 0 ? (
//         <Accordion activeKey={activeAccordion}>
//           {filteredOrders.map((order) => (
//             <Card key={order._id.$oid} className="mb-3 shadow-sm">
//               <Accordion.Item eventKey={order._id.$oid}>
//                 <Card.Header className="bg-light p-0">
//                   <Accordion.Button 
//                     as={Button} 
//                     variant="link" 
//                     className="w-100 text-start p-3 d-flex justify-content-between align-items-center"
//                     onClick={() => toggleAccordion(order._id.$oid)}
//                   >
//                     <div className="d-flex align-items-center">
//                       {activeAccordion === order._id.$oid ? 
//                         <ChevronUp className="me-2" /> : 
//                         <ChevronDown className="me-2" />
//                       }
//                       <div>
//                         <h5 className="mb-1 d-inline-flex align-items-center">
//                           <span className="me-2">#{order.orderCode}</span>
//                           {getStatusBadge(order.orderStatus)}
//                         </h5>
//                         <small className="text-muted d-block">
//                           <Calendar className="me-1" />
//                           {formatDate(order.createdAt)}
//                         </small>
//                       </div>
//                     </div>
//                     <div className="d-flex align-items-center">
//                       <h5 className="text-primary mb-0 me-3">
//                         <CurrencyDollar className="me-1" />
//                         {formatPrice(order.totalAmount)}
//                       </h5>
//                     </div>
//                   </Accordion.Button>
//                 </Card.Header>

//                 <Accordion.Collapse eventKey={order._id.$oid}>
//                   <Card.Body>
//                     <div className="p-3">
//                       <h5 className="mb-4 text-primary">
//                         <Cart className="me-2" />
//                         Sipariş Detayları
//                       </h5>

//                       {/* Müşteri ve Teslimat Bilgileri */}
//                       <Row className="mb-4">
//                         <Col md={6}>
//                           <h6 className="text-muted mb-3">
//                             <Person className="me-2" />
//                             Müşteri Bilgileri
//                           </h6>
//                           <p className="mb-1">
//                             <strong>{order.firstName} {order.lastName}</strong>
//                           </p>
//                           <p className="mb-1 text-muted">
//                             <Envelope className="me-2" />
//                             {order.email}
//                           </p>
//                           <p className="mb-0 text-muted">
//                             <Telephone className="me-2" />
//                             {order.phone}
//                           </p>
//                         </Col>
                        
//                         <Col md={6} className="mt-4 mt-md-0">
//                           <h6 className="text-muted mb-3">
//                             <GeoAlt className="me-2" />
//                             Teslimat Adresi
//                           </h6>
//                           <p className="mb-1">{order.shippingInfo.address}</p>
//                           <p className="mb-1">
//                             {order.shippingInfo.district}, {order.shippingInfo.city}
//                           </p>
//                           <p className="mb-0 text-muted">
//                             Posta Kodu: {order.shippingInfo.postalCode}
//                           </p>
//                           {order.shippingInfo.notes && (
//                             <p className="mt-2 text-muted">
//                               <small>
//                                 <InfoCircle className="me-1" />
//                                 {order.shippingInfo.notes}
//                               </small>
//                             </p>
//                           )}
//                         </Col>
//                       </Row>

//                       {/* Ürünler */}
//                       <div className="table-responsive">
//                         <Table bordered hover className="mb-4">
//                           <thead className="table-light">
//                             <tr>
//                               <th>Ürün</th>
//                               <th>Kategori</th>
//                               <th className="text-center">Adet</th>
//                               <th className="text-end">Birim Fiyat</th>
//                               <th className="text-end">Toplam</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {order.cart.map((item) => (
//                               <tr key={item._id}>
//                                 <td>
//                                   <div className="d-flex align-items-center">
//                                     {item.image ? (
//                                       <img 
//                                         src={item.image} 
//                                         alt={item.name}
//                                         className="me-3 rounded"
//                                         style={{ width: '50px', height: '50px', objectFit: 'cover' }}
//                                       />
//                                     ) : (
//                                       <div className="me-3 bg-light rounded d-flex align-items-center justify-content-center"
//                                         style={{ width: '50px', height: '50px' }}>
//                                         <Box size={20} className="text-muted" />
//                                       </div>
//                                     )}
//                                     <div>
//                                       <div className="fw-medium">{item.name}</div>
//                                       <small className="text-muted">
//                                         {item.product_id?.substring(0, 8)}...
//                                       </small>
//                                     </div>
//                                   </div>
//                                 </td>
//                                 <td>
//                                   <Badge bg="secondary">{item.category}</Badge>
//                                 </td>
//                                 <td className="text-center">{item.quantity}</td>
//                                 <td className="text-end">{formatPrice(item.price)}</td>
//                                 <td className="text-end fw-medium">
//                                   {formatPrice(item.price * item.quantity)}
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                           <tfoot className="table-light">
//                             <tr>
//                               <td colSpan="4" className="text-end fw-bold">Ara Toplam</td>
//                               <td className="text-end fw-bold">{formatPrice(order.totalAmount)}</td>
//                             </tr>
//                             <tr>
//                               <td colSpan="4" className="text-end">Kargo</td>
//                               <td className="text-end">
//                                 <Badge bg="success">Ücretsiz</Badge>
//                               </td>
//                             </tr>
//                             <tr>
//                               <td colSpan="4" className="text-end fw-bold">Genel Toplam</td>
//                               <td className="text-end fw-bold text-primary">
//                                 {formatPrice(order.totalAmount)}
//                               </td>
//                             </tr>
//                           </tfoot>
//                         </Table>
//                       </div>

//                       {/* Ödeme Bilgileri */}
//                       <Row className="border-top pt-3">
//                         <Col md={6}>
//                           <h6 className="text-muted mb-3">
//                             <CreditCard className="me-2" />
//                             Ödeme Bilgileri
//                           </h6>
//                           <p className="mb-1">
//                             Yöntem: <Badge bg="primary">{order.payment.method}</Badge>
//                           </p>
//                           <p className="mb-1">
//                             Durum: <Badge bg="success">{order.payment.status}</Badge>
//                           </p>
//                           <p className="mb-0 text-muted">
//                             <small>Referans: {order.payment.iyzicoReference}</small>
//                           </p>
//                         </Col>
//                         <Col md={6} className="text-md-end mt-3 mt-md-0">
//                           <h4 className="text-primary">
//                             {formatPrice(order.totalAmount)}
//                           </h4>
//                         </Col>
//                       </Row>
//                     </div>
//                   </Card.Body>
//                 </Accordion.Collapse>
//               </Accordion.Item>
//             </Card>
//           ))}
//         </Accordion>
//       ) : (
//         <Row className="justify-content-center">
//           <Col md={6} className="text-center py-5">
//             <Search size={48} className="text-muted mb-3" />
//             <h4>Arama Sonucu Bulunamadı</h4>
//             <p className="text-muted mb-4">
//               Filtre kriterlerinize uygun sipariş bulunamadı.
//             </p>
//             <Button 
//               variant="outline-primary"
//               onClick={() => {
//                 setSearchTerm('');
//                 setFilterStatus('all');
//               }}
//             >
//               Filtreleri Temizle
//             </Button>
//           </Col>
//         </Row>
//       )}
//     </Container>
//   );
// };

// export default OrdersPage;
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { 
  Spinner, Alert, Badge, Button, Card, Table, 
  Container, Row, Col, InputGroup, Form, Accordion
} from 'react-bootstrap';
import { 
  BagCheck, Search, Calendar, Person, CurrencyDollar,
  Truck, CheckCircle, XCircle, InfoCircle, GeoAlt,
  Cart, CreditCard, Envelope, Telephone, Box, ListUl, ChevronDown, ChevronUp
} from 'react-bootstrap-icons';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeAccordion, setActiveAccordion] = useState(null);
  useEffect(() => {
    fetchOrders();
  }, []);
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Oturum açmanız gerekiyor');
      }

      const response = await fetch('http://localhost:5000/view/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Siparişler yüklenemedi');
      }

      const data = await response.json();
      
      // Tarihe göre sırala (en yeni en üstte)
      const sortedOrders = (data.query || []).sort((a, b) => {
        const dateA = new Date(a.createdAt.$date || a.createdAt);
        const dateB = new Date(b.createdAt.$date || b.createdAt);
        return dateB - dateA;
      });
      
      setOrders(sortedOrders);
      
      // İlk siparişi açık olarak ayarla
      if (sortedOrders.length > 0) {
        setActiveAccordion(sortedOrders[0]._id.$oid);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    let date;
    if (dateString.$date) {
      date = new Date(dateString.$date);
    } else {
      date = new Date(dateString);
    }
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'processing': {
        variant: 'warning',
        text: 'İşleniyor',
        icon: <span className="me-1">⏳</span>
      },
      'shipped': {
        variant: 'info',
        text: 'Kargoya Verildi',
        icon: <Truck className="me-1" />
      },
      'delivered': {
        variant: 'success',
        text: 'Teslim Edildi',
        icon: <CheckCircle className="me-1" />
      },
      'cancelled': {
        variant: 'danger',
        text: 'İptal Edildi',
        icon: <XCircle className="me-1" />
      }
    };

    const statusInfo = statusMap[status] || {
      variant: 'secondary',
      text: status,
      icon: <InfoCircle className="me-1" />
    };

    return (
      <Badge bg={statusInfo.variant} className="px-3 py-2">
        {statusInfo.icon}
        {statusInfo.text}
      </Badge>
    );
  };

  const toggleAccordion = (orderId) => {
    setActiveAccordion(activeAccordion === orderId ? null : orderId);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${order.firstName} ${order.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.orderStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Container className="my-5 py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <Spinner animation="border" variant="primary" />
            <h5 className="mt-3">Siparişleriniz yükleniyor...</h5>
            <p className="text-muted">Lütfen bekleyiniz</p>
          </Col>
        </Row>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5 py-5">
        <Row className="justify-content-center">
          <Col md={6}>
            <Alert variant="danger">
              <Alert.Heading>Bir Hata Oluştu</Alert.Heading>
              <p>{error}</p>
              <hr />
              <div className="d-flex justify-content-end">
                <Button variant="outline-danger" onClick={fetchOrders}>
                  Tekrar Dene
                </Button>
              </div>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container className="my-5 py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <Card className="border-0 shadow-sm">
              <Card.Body className="py-5">
                <BagCheck size={48} className="text-muted mb-3" />
                <h3 className="text-muted">Henüz Sipariş Yok</h3>
                <p className="text-muted mb-4">
                  Alışverişe başlayarak ilk siparişinizi oluşturun.
                </p>
                <Button variant="primary">Alışverişe Başla</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      {/* Başlık ve Filtreleme */}
      <Row className="mb-4 align-items-center">
        <Col md={6}>
          <h2 className="mb-0">
            <BagCheck className="text-primary me-2" />
            Siparişlerim
          </h2>
        </Col>
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <Search />
            </InputGroup.Text>
            <Form.Control
              placeholder="Sipariş ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Form.Select 
              style={{ maxWidth: '200px' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tüm Durumlar</option>
              <option value="processing">İşleniyor</option>
              <option value="shipped">Kargoya Verildi</option>
              <option value="delivered">Teslim Edildi</option>
              <option value="cancelled">İptal Edildi</option>
            </Form.Select>
          </InputGroup>
        </Col>
      </Row>

      {/* Sipariş Listesi */}
      {filteredOrders.length > 0 ? (
        <Accordion activeKey={activeAccordion}>
          {filteredOrders.map((order) => (
            <Card key={order._id.$oid} className="mb-3 shadow-sm">
              <Accordion.Item eventKey={order._id.$oid}>
                <Card.Header className="bg-light p-0">
                  <Accordion.Button 
                    as={Button} 
                    variant="link" 
                    className="w-100 text-start p-3 d-flex justify-content-between align-items-center"
                    onClick={() => toggleAccordion(order._id.$oid)}
                  >
                    <div className="d-flex align-items-center">
                      {activeAccordion === order._id.$oid ? 
                        <ChevronUp className="me-2" /> : 
                        <ChevronDown className="me-2" />
                      }
                      <div>
                        <h5 className="mb-1 d-inline-flex align-items-center">
                          <span className="me-2">#{order.orderCode}</span>
                          {getStatusBadge(order.orderStatus)}
                        </h5>
                        <small className="text-muted d-block">
                          <Calendar className="me-1" />
                          {formatDate(order.createdAt)}
                        </small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <h5 className="text-primary mb-0 me-3">
                        <CurrencyDollar className="me-1" />
                        {formatPrice(order.totalAmount)}
                      </h5>
                    </div>
                  </Accordion.Button>
                </Card.Header>

                <Accordion.Collapse eventKey={order._id.$oid}>
                  <Card.Body>
                    <div className="p-3">
                      <h5 className="mb-4 text-primary">
                        <Cart className="me-2" />
                        Sipariş Detayları
                      </h5>

                      {/* Müşteri ve Teslimat Bilgileri */}
                      <Row className="mb-4">
                        <Col md={6}>
                          <h6 className="text-muted mb-3">
                            <Person className="me-2" />
                            Müşteri Bilgileri
                          </h6>
                          <p className="mb-1">
                            <strong>{order.firstName} {order.lastName}</strong>
                          </p>
                          <p className="mb-1 text-muted">
                            <Envelope className="me-2" />
                            {order.email}
                          </p>
                          <p className="mb-0 text-muted">
                            <Telephone className="me-2" />
                            {order.phone}
                          </p>
                        </Col>
                        
                        <Col md={6} className="mt-4 mt-md-0">
                          <h6 className="text-muted mb-3">
                            <GeoAlt className="me-2" />
                            Teslimat Adresi
                          </h6>
                          <p className="mb-1">{order.shippingInfo.address}</p>
                          <p className="mb-1">
                            {order.shippingInfo.district}, {order.shippingInfo.city}
                          </p>
                          <p className="mb-0 text-muted">
                            Posta Kodu: {order.shippingInfo.postalCode}
                          </p>
                          {order.shippingInfo.notes && (
                            <p className="mt-2 text-muted">
                              <small>
                                <InfoCircle className="me-1" />
                                {order.shippingInfo.notes}
                              </small>
                            </p>
                          )}
                        </Col>
                      </Row>

                      {/* Ürünler */}
                      <div className="table-responsive">
                        <Table bordered hover className="mb-4">
                          <thead className="table-light">
                            <tr>
                              <th>Ürün</th>
                              <th>Kategori</th>
                              <th className="text-center">Adet</th>
                              <th className="text-end">Birim Fiyat</th>
                              <th className="text-end">Toplam</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.cart.map((item) => (
                              <tr key={item._id}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    {item.image ? (
                                      <img 
                                        src={item.image} 
                                        alt={item.name}
                                        className="me-3 rounded"
                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                      />
                                    ) : (
                                      <div className="me-3 bg-light rounded d-flex align-items-center justify-content-center"
                                        style={{ width: '50px', height: '50px' }}>
                                        <Box size={20} className="text-muted" />
                                      </div>
                                    )}
                                    <div>
                                      <div className="fw-medium">{item.name}</div>
                                      <small className="text-muted">
                                        {item.product_id?.substring(0, 8)}...
                                      </small>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <Badge bg="secondary">{item.category}</Badge>
                                </td>
                                <td className="text-center">{item.quantity}</td>
                                <td className="text-end">{formatPrice(item.price)}</td>
                                <td className="text-end fw-medium">
                                  {formatPrice(item.price * item.quantity)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="table-light">
                            <tr>
                              <td colSpan="4" className="text-end fw-bold">Ara Toplam</td>
                              <td className="text-end fw-bold">{formatPrice(order.totalAmount)}</td>
                            </tr>
                            <tr>
                              <td colSpan="4" className="text-end">Kargo</td>
                              <td className="text-end">
                                <Badge bg="success">Ücretsiz</Badge>
                              </td>
                            </tr>
                            <tr>
                              <td colSpan="4" className="text-end fw-bold">Genel Toplam</td>
                              <td className="text-end fw-bold text-primary">
                                {formatPrice(order.totalAmount)}
                              </td>
                            </tr>
                          </tfoot>
                        </Table>
                      </div>

                      {/* Ödeme Bilgileri */}
                      <Row className="border-top pt-3">
                        <Col md={6}>
                          <h6 className="text-muted mb-3">
                            <CreditCard className="me-2" />
                            Ödeme Bilgileri
                          </h6>
                          <p className="mb-1">
                            Yöntem: <Badge bg="primary">{order.payment.method}</Badge>
                          </p>
                          <p className="mb-1">
                            Durum: <Badge bg="success">{order.payment.status}</Badge>
                          </p>
                          <p className="mb-0 text-muted">
                            <small>Referans: {order.payment.iyzicoReference}</small>
                          </p>
                        </Col>
                        <Col md={6} className="text-md-end mt-3 mt-md-0">
                          <h4 className="text-primary">
                            {formatPrice(order.totalAmount)}
                          </h4>
                        </Col>
                      </Row>
                    </div>
                  </Card.Body>
                </Accordion.Collapse>
              </Accordion.Item>
            </Card>
          ))}
        </Accordion>
      ) : (
        <Row className="justify-content-center">
          <Col md={6} className="text-center py-5">
            <Search size={48} className="text-muted mb-3" />
            <h4>Arama Sonucu Bulunamadı</h4>
            <p className="text-muted mb-4">
              Filtre kriterlerinize uygun sipariş bulunamadı.
            </p>
            <Button 
              variant="outline-primary"
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
            >
              Filtreleri Temizle
            </Button>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default OrdersPage;