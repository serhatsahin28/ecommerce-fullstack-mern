// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import {
//   Spinner, Alert, Badge, Button, Card, Table,
//   Form, InputGroup, Container, Row, Col, Modal, Accordion
// } from 'react-bootstrap';
// import {
//   BagCheck, Search, Calendar, Person, CurrencyDollar,
//   ChevronDown, ChevronUp, XCircle, InfoCircle, GeoAlt,
//   Cart, CreditCard, Envelope, Telephone, Box, ListUl, Truck, CheckCircle
// } from 'react-bootstrap-icons';

// const OrdersPage = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [orderToCancel, setOrderToCancel] = useState(null);
//   const [activeAccordion, setActiveAccordion] = useState(null);
//   const [cancelReason, setCancelReason] = useState("");

//   const navigate = useNavigate();

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
// const getStatusBadge = (status) => {
//   const statusMap = {
//     processing: {
//       variant: 'warning',
//       text: 'İşleniyor',
//       icon: <span className="me-1">⏳</span>
//     },
//     shipped: {
//       variant: 'info',
//       text: 'Kargoya Verildi',
//       icon: <Truck className="me-1" />
//     },
//     delivered: {
//       variant: 'success',
//       text: 'Teslim Edildi',
//       icon: <CheckCircle className="me-1" />
//     },
//     cancel_pending: {
//       variant: 'warning',
//       text: 'İptal Onayı Bekliyor',
//       icon: <span className="me-1">⏳</span>
//     },
//     cancelled: {
//       variant: 'danger',
//       text: 'İptal Edildi',
//       icon: <XCircle className="me-1" />
//     }
//   };





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

//   const handleAccordionToggle = (orderId) => {
//     setActiveAccordion(activeAccordion === orderId ? null : orderId);
//   };

//   const handleCancelOrder = (orderCode) => {
//     setOrderToCancel(orderCode);
//     setShowCancelModal(true);
//   };

//   const confirmCancelOrder = async () => {
//     try {
//       const response = await fetch("http://localhost:5000/admin/OrdersCancelRequest", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           order_code: orderToCancel,
//           cancelReason
//         })


//       });

//       // if (!response.ok) {
//       //   throw new Error("İptal başarısız");
//       // }

//       // alert(`${orderToCancel} nolu sipariş başarıyla iptal edildi.`);

//       setShowCancelModal(false);
//       setOrderToCancel(null);
//       setCancelReason("");
//       window.location.reload();
//       // burada sipariş listesini yenileyebilirsin
//     } catch (err) {
//       alert("Sipariş iptal edilirken hata oluştu");
//       console.error(err);
//     }
//   };


//   const filteredOrders = orders.filter(order => {
//     const matchesSearch = order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       `${order.firstName} ${order.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus = filterStatus === 'all' || order.orderStatus === filterStatus;
//     return matchesSearch && matchesStatus;
//   });

//   if (loading) {
//     return (
//       <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
//         <div className="text-center">
//           <Spinner animation="border" role="status" className="mb-3" style={{ width: '4rem', height: '4rem' }}>
//             <span className="visually-hidden">Yükleniyor...</span>
//           </Spinner>
//           <h4>Siparişleriniz yükleniyor...</h4>
//           <p className="text-muted">Lütfen bekleyiniz</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
//         <Container>
//           <Row className="justify-content-center">
//             <Col md={8} lg={6}>
//               <Card className="border-0 shadow">
//                 <Card.Body className="p-5 text-center">
//                   <div className="text-danger mb-4">
//                     <InfoCircle size={48} />
//                   </div>
//                   <h3 className="mb-3">Bir Hata Oluştu</h3>
//                   <p className="mb-4 fs-5">{error}</p>
//                   <Button
//                     variant="primary"
//                     size="lg"
//                     onClick={fetchOrders}
//                   >
//                     Tekrar Dene
//                   </Button>
//                 </Card.Body>
//               </Card>
//             </Col>
//           </Row>
//         </Container>
//       </div>
//     );
//   }

//   if (orders.length === 0) {
//     return (
//       <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
//         <Container>
//           <Row className="justify-content-center">
//             <Col md={8} lg={6}>
//               <Card className="border-0 shadow">
//                 <Card.Body className="p-5 text-center">
//                   <div className="text-muted mb-4">
//                     <BagCheck size={48} />
//                   </div>
//                   <h3 className="mb-3">Henüz Sipariş Yok</h3>
//                   <p className="mb-4 fs-5">
//                     Alışverişe başlayarak ilk siparişinizi oluşturun.
//                   </p>
//                   <Button variant="primary" size="lg" onClick={() => navigate('/products')}>
//                     Alışverişe Başla
//                   </Button>
//                 </Card.Body>
//               </Card>
//             </Col>
//           </Row>
//         </Container>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-light min-vh-100">
//       {/* Header Section */}
//       <div className="bg-white shadow-sm">
//         <Container className="py-4">
//           <Row className="align-items-center">
//             <Col md={8}>
//               <h1 className="display-6 fw-bold mb-2">
//                 <BagCheck className="text-primary me-3" size={32} />
//                 Siparişlerim
//               </h1>
//               <p className="mb-0">Tüm siparişlerinizi buradan takip edebilirsiniz</p>
//             </Col>
//             <Col md={4} className="text-md-end mt-3 mt-md-0">
//               <div className="d-flex align-items-center justify-content-md-end">
//                 <Badge bg="primary" className="px-3 py-2 fs-6">
//                   <ListUl className="me-2" />
//                   {filteredOrders.length} sipariş
//                 </Badge>
//               </div>
//             </Col>
//           </Row>
//         </Container>
//       </div>

//       <Container className="py-5">
//         {/* Search and Filter Section */}
//         <Row className="mb-4">
//           <Col lg={8} className="mb-3 mb-lg-0">
//             <InputGroup className="mb-3">
//               <InputGroup.Text className="bg-white">
//                 <Search />
//               </InputGroup.Text>
//               <Form.Control
//                 placeholder="Sipariş kodu veya müşteri adı ile ara..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </InputGroup>
//           </Col>
//           <Col lg={4}>
//             <Form.Select
//               value={filterStatus}
//               onChange={(e) => setFilterStatus(e.target.value)}
//             >
//               <option value="all">Tüm Durumlar</option>
//               <option value="processing">İşleniyor</option>
//               <option value="shipped">Kargoya Verildi</option>
//               <option value="delivered">Teslim Edildi</option>
//               <option value="cancel_pending">İptal Talebinde</option>
//               <option value="cancelled">İptal Edildi</option>
//             </Form.Select>
//           </Col>
//         </Row>

//         {/* Orders List */}
//         <Accordion activeKey={activeAccordion} flush>
//           {filteredOrders.map((order) => (
//             <Card key={order._id} className="mb-3 border-0 shadow-sm">
//               <Accordion.Item eventKey={order._id.$oid}>
//                 <Card.Header className="bg-white p-0">
//                   <Accordion.Button
//                     className="w-100 text-start p-4 d-flex justify-content-between align-items-center"
//                     onClick={() => handleAccordionToggle(order._id.$oid)}
//                   >
//                     <div className="d-flex flex-column flex-md-row align-items-md-center w-100">
//                       <div className="d-flex align-items-center mb-2 mb-md-0 me-md-4">
//                         {activeAccordion === order._id.$oid ?
//                           <ChevronUp className="me-2 text-primary" /> :
//                           <ChevronDown className="me-2 text-primary" />
//                         }
//                         <h6 className="mb-0 fw-bold text-dark">#{order.orderCode}</h6>
//                       </div>
//                       <div className="d-flex flex-wrap flex-grow-1 justify-content-between">
//                         <div className="me-3 mb-2 mb-md-0">
//                           <small className="text-muted d-block">Tarih</small>
//                           <span className="text-dark">
//                             <Calendar className="me-1" />
//                             {formatDate(order.createdAt)}
//                           </span>
//                         </div>
//                         <div className="me-3 mb-2 mb-md-0">
//                           <small className="text-muted d-block">Müşteri</small>
//                           <span className="text-dark">
//                             <Person className="me-1" />
//                             {order.firstName} {order.lastName}
//                           </span>
//                         </div>
//                         <div className="me-3 mb-2 mb-md-0">
//                           <small className="text-muted d-block">Durum</small>
//                           {getStatusBadge(order.orderStatus)}
//                         </div>
//                         <div className="me-3 mb-2 mb-md-0">
//                           <small className="text-muted d-block">Toplam</small>
//                           <span className="text-primary fw-bold">
//                             <CurrencyDollar className="me-1" />
//                             {formatPrice(order.totalAmount)}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   </Accordion.Button>
//                 </Card.Header>

//                 <Accordion.Collapse eventKey={order._id.$oid}>
//                   <Card.Body className="pt-0">
//                     <div className="p-3">
//                       <h5 className="mb-4 text-primary d-flex align-items-center">
//                         <Cart className="me-2" />
//                         Sipariş Detayları
//                       </h5>

//                       {/* Customer and Shipping Info */}
//                       <Row className="mb-4">
//                         <Col lg={6} className="mb-4 mb-lg-0">
//                           <Card className="bg-light border-0 h-100">
//                             <Card.Body className="p-4">
//                               <h6 className="mb-4 fw-bold d-flex align-items-center">
//                                 <Person className="text-primary me-2" />
//                                 Müşteri Bilgileri
//                               </h6>
//                               <div className="vstack gap-3">
//                                 <div className="d-flex align-items-center">
//                                   <Person className="text-primary me-3" />
//                                   <div>
//                                     <div className="fw-medium">{order.firstName} {order.lastName}</div>
//                                   </div>
//                                 </div>
//                                 <div className="d-flex align-items-center">
//                                   <Envelope className="text-primary me-3" />
//                                   <div>{order.email}</div>
//                                 </div>
//                                 <div className="d-flex align-items-center">
//                                   <Telephone className="text-primary me-3" />
//                                   <div>{order.phone}</div>
//                                 </div>
//                               </div>
//                             </Card.Body>
//                           </Card>
//                         </Col>

//                         <Col lg={6}>
//                           <Card className="bg-light border-0 h-100">
//                             <Card.Body className="p-4">
//                               <h6 className="mb-4 fw-bold d-flex align-items-center">
//                                 <GeoAlt className="text-primary me-2" />
//                                 Teslimat Adresi
//                               </h6>
//                               <div className="vstack gap-2">
//                                 <div>{order.shippingInfo.address}</div>
//                                 <div>
//                                   {order.shippingInfo.district}, {order.shippingInfo.city}
//                                 </div>
//                                 <div>
//                                   <span className="me-2">📮</span>
//                                   Posta Kodu: {order.shippingInfo.postalCode}
//                                 </div>
//                                 {order.shippingInfo.notes && (
//                                   <div className="mt-3 p-3 bg-white rounded border-start border-primary border-4">
//                                     <small>
//                                       <InfoCircle className="me-2" />
//                                       {order.shippingInfo.notes}
//                                     </small>
//                                   </div>
//                                 )}
//                               </div>
//                             </Card.Body>
//                           </Card>
//                         </Col>
//                       </Row>

//                       {/* Order Items */}
//                       <div className="mb-4">
//                         <div className="table-responsive">
//                           <Table hover className="align-middle">
//                             <thead className="table-light">
//                               <tr>
//                                 <th className="border-0 py-3">Ürün</th>
//                                 <th className="border-0 py-3">Kategori</th>
//                                 <th className="border-0 py-3 text-center">Adet</th>
//                                 <th className="border-0 py-3 text-end">Birim Fiyat</th>
//                                 <th className="border-0 py-3 text-end">Toplam</th>
//                               </tr>
//                             </thead>
//                             <tbody>
//                               {order.cart.map((item) => (
//                                 <tr key={item._id} className="border-0">
//                                   <td className="py-3">
//                                     <div className="d-flex align-items-center">
//                                       <div className="position-relative me-3" style={{ width: '60px', height: '60px' }}>
//                                         {item.image ? (
//                                           <img
//                                             src={`${item.image}`}
//                                             alt={item.name}
//                                             className="img-fluid rounded-3"
//                                             style={{
//                                               width: '100%',
//                                               height: '100%',
//                                               objectFit: 'cover',
//                                               border: '2px solid #f8f9fa'
//                                             }}
//                                             onError={(e) => {
//                                               e.target.style.display = 'none';
//                                               e.target.nextSibling.style.display = 'flex';
//                                             }}
//                                           />
//                                         ) : null}
//                                         <div
//                                           className="bg-primary bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center"
//                                           style={{
//                                             width: '100%',
//                                             height: '100%',
//                                             display: item.image ? 'none' : 'flex'
//                                           }}
//                                         >
//                                           <Box size={24} className="text-primary" />
//                                         </div>
//                                       </div>
//                                       <div>
//                                         <div className="fw-medium">{item.name}</div>
//                                         <small className="text-muted">
//                                           {item._id && item.product_id ?
//                                             `ID: ${item.product_id.substring(0, 8)}...` :
//                                             'Ürün ID bulunamadı'
//                                           }
//                                         </small>
//                                       </div>
//                                     </div>
//                                   </td>
//                                   <td className="py-3">
//                                     <Badge bg="secondary" className="px-3 py-2">
//                                       {item.category}
//                                     </Badge>
//                                   </td>
//                                   <td className="py-3 text-center">
//                                     <Badge bg="light" text="dark" className="px-3 py-2">
//                                       {item.quantity}
//                                     </Badge>
//                                   </td>
//                                   <td className="py-3 text-end">{formatPrice(item.price)}</td>
//                                   <td className="py-3 text-end fw-bold">{formatPrice(item.price * item.quantity)}</td>
//                                 </tr>
//                               ))}
//                             </tbody>
//                             <tfoot className="table-light">
//                               <tr>
//                                 <td colSpan="4" className="text-end fw-bold py-3">Ara Toplam</td>
//                                 <td className="text-end fw-bold py-3">{formatPrice(order.totalAmount)}</td>
//                               </tr>
//                               <tr>
//                                 <td colSpan="4" className="text-end py-3">Kargo</td>
//                                 <td className="text-end py-3">
//                                   <Badge bg="success" className="px-3 py-2">
//                                     Ücretsiz
//                                   </Badge>
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <td colSpan="4" className="text-end fw-bold py-3 fs-5">Genel Toplam</td>
//                                 <td className="text-end fw-bold py-3 fs-5 text-primary">{formatPrice(order.totalAmount)}</td>
//                               </tr>
//                             </tfoot>
//                           </Table>
//                         </div>
//                       </div>

//                       {/* Payment Info */}
//                       <div className="mb-4">
//                         <h6 className="mb-4 fw-bold d-flex align-items-center">
//                           <CreditCard className="text-primary me-2" />
//                           Ödeme Bilgileri
//                         </h6>
//                         <Card className="bg-light border-0">
//                           <Card.Body className="p-4">
//                             <Row className="align-items-center">
//                               <Col md={8}>
//                                 <div className="d-flex align-items-center">
//                                   <div className="bg-primary bg-opacity-15 rounded-3 p-3 me-3">
//                                     <CreditCard size={24} className="text-primary" />
//                                   </div>
//                                   <div>
//                                     <div className="mb-2">
//                                       <span className="me-2">Yöntem:</span>
//                                       <Badge bg="primary" className="px-3 py-2">
//                                         {order.payment.method}
//                                       </Badge>
//                                     </div>
//                                     <div className="mb-2">
//                                       <span className="me-2">Durum:</span>
//                                       <Badge bg="success" className="px-3 py-2">
//                                         {order.payment.status}
//                                       </Badge>
//                                     </div>
//                                     <div>
//                                       <span className="me-2">Referans:</span>
//                                       <code className="bg-white px-2 py-1 rounded">
//                                         {order.payment.iyzicoReference}
//                                       </code>
//                                     </div>
//                                     <div className="mt-2">
//                                       <span className="me-2">Tarih:</span>
//                                       <span>{formatDate(order.payment.date)}</span>
//                                     </div>
//                                   </div>
//                                 </div>
//                               </Col>
//                             </Row>
//                           </Card.Body>
//                         </Card>
//                       </div>
//                     </div>

//                     {/* Action Buttons */}
//                     <div className="d-flex justify-content-end p-3">
//                       {order.orderStatus === 'processing' && (
//                         <Button
//                           variant="outline-danger"
//                           onClick={() => handleCancelOrder(order.orderCode)}
//                         >
//                           <XCircle className="me-2" />
//                           Siparişi İptal Et
//                         </Button>
//                       )}
//                     </div>
//                   </Card.Body>
//                 </Accordion.Collapse>
//               </Accordion.Item>
//             </Card>
//           ))}
//         </Accordion>

//         {/* No Results */}
//         {filteredOrders.length === 0 && orders.length > 0 && (
//           <div className="text-center py-5">
//             <div className="mb-3">
//               <Search size={48} className="text-muted" />
//             </div>
//             <h4>Arama Sonucu Bulunamadı</h4>
//             <p className="text-muted">Arama kriterlerinizi değiştirerek tekrar deneyin.</p>
//             <Button
//               variant="outline-primary"
//               onClick={() => {
//                 setSearchTerm('');
//                 setFilterStatus('all');
//               }}
//             >
//               Filtreleri Temizle
//             </Button>
//           </div>
//         )}
//       </Container>

//       {/* Cancel Order Modal */}

//       <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Sipariş İptali</Modal.Title>
//         </Modal.Header>

//         <Modal.Body>
//           <p>
//             <strong>{orderToCancel}</strong> nolu siparişi iptal etmek istediğinizden emin misiniz?
//           </p>

//           <Form.Group className="mt-3">
//             <Form.Label>İptal Nedeni (Opsiyonel)</Form.Label>
//             <Form.Control
//               as="textarea"
//               rows={3}
//               placeholder="Örn: Stok problemi, müşteri talebi, ödeme hatası..."
//               value={cancelReason}
//               onChange={(e) => setCancelReason(e.target.value)}
//             />
//           </Form.Group>
//         </Modal.Body>

//         <Modal.Footer>
//           <Button
//             variant="secondary"
//             onClick={() => setShowCancelModal(false)}
//           >
//             Vazgeç
//           </Button>

//           <Button
//             variant="danger"
//             onClick={() => confirmCancelOrder(cancelReason)}
//           >
//             İptal Et
//           </Button>
//         </Modal.Footer>
//       </Modal>
//       {/* Footer */}
//       <footer className="bg-white border-top mt-5">
//         <Container className="py-4">
//           <div className="text-center">
//             <p className="mb-0 text-muted">© {new Date().getFullYear()} Sipariş Yönetim Sistemi - Tüm hakları saklıdır</p>
//           </div>
//         </Container>
//       </footer>
//     </div>
//   );
// };

// export default OrdersPage;

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Accordion, Table, Spinner, Form } from 'react-bootstrap';
import { Calendar3, GeoAlt, BoxSeam, CreditCard, Funnel } from 'react-bootstrap-icons';

const statusTR = {
  processing: { text: "Hazırlanıyor", color: "warning" },
  shipped: { text: "Kargoya Verildi", color: "info" },
  delivered: { text: "Teslim Edildi", color: "success" },
  cancelled: { text: "İptal Edildi", color: "danger" },
  cancel_pending: { text: "İptal Bekliyor", color: "secondary" }
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
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
    fetchOrders();
  }, []);

  const formatDate = (d) => new Date(d.$date || d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  const formatPrice = (p) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p);

  const filteredOrders = orders.filter(o => filter === 'all' || o.orderStatus === filter);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <Container className="py-4" style={{ maxWidth: '900px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h4 className="fw-bold mb-0">Siparişlerim</h4>
        
        {/* Filtreleme Kısmı */}
        <div className="d-flex align-items-center gap-2">
          <Funnel className="text-muted" />
          <Form.Select size="sm" className="rounded-pill px-3" onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Tüm Siparişler</option>
            <option value="processing">Hazırlanıyor</option>
            <option value="shipped">Kargoda</option>
            <option value="delivered">Teslim Edilenler</option>
            <option value="cancelled">İptal Edilenler</option>
          </Form.Select>
        </div>
      </div>

      <Accordion flush>
        {filteredOrders.map((order, idx) => (
          <Card key={idx} className="mb-3 border shadow-sm rounded-3 overflow-hidden">
            <Accordion.Item eventKey={idx.toString()}>
              <Accordion.Header>
                <Row className="w-100 g-2 align-items-center small">
                  <Col xs={6} md={3}>
                    <span className="text-muted d-block">Sipariş Kodu</span>
                    <span className="fw-bold">#{order.orderCode}</span>
                  </Col>
                  <Col xs={6} md={3}>
                    <span className="text-muted d-block">Tarih</span>
                    <span><Calendar3 className="me-1" /> {formatDate(order.createdAt)}</span>
                  </Col>
                  <Col xs={6} md={3}>
                    <span className="text-muted d-block">Durum</span>
                    <Badge bg={statusTR[order.orderStatus]?.color || "dark"}>
                      {statusTR[order.orderStatus]?.text || order.orderStatus}
                    </Badge>
                  </Col>
                  <Col xs={6} md={3} className="text-md-end">
                    <span className="text-muted d-block">Toplam</span>
                    <span className="fw-bold text-primary">{formatPrice(order.totalAmount)}</span>
                  </Col>
                </Row>
              </Accordion.Header>

              <Accordion.Body className="bg-white border-top">
                <Row className="g-4">
                  {/* Sol: Ürün Listesi */}
                  <Col lg={7}>
                    <h6 className="fw-bold mb-3 border-bottom pb-2 small uppercase"><BoxSeam className="me-2"/>Sipariş İçeriği</h6>
                    {order.cart.map((item, i) => (
                      <div key={i} className="d-flex align-items-center mb-3 p-2 border-bottom border-light">
                        <img src={item.image} alt="" className="rounded border me-3" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                        <div className="flex-grow-1">
                          <div className="fw-bold small">{item.name}</div>
                          <div className="text-muted small">{item.quantity} Adet x {formatPrice(item.price)}</div>
                        </div>
                        <div className="fw-bold small">{formatPrice(item.price * item.quantity)}</div>
                      </div>
                    ))}
                  </Col>

                  {/* Sağ: Adres ve Özet */}
                  <Col lg={5}>
                    <div className="p-3 bg-light rounded-3 mb-3 border">
                      <h6 className="fw-bold small mb-2"><GeoAlt className="me-2"/>Teslimat Adresi</h6>
                      <div className="small text-dark fw-medium">{order.firstName} {order.lastName}</div>
                      <div className="small text-muted">{order.shippingInfo.address}</div>
                      <div className="small text-muted">{order.shippingInfo.district} / {order.shippingInfo.city.toUpperCase()}</div>
                    </Col>

                    <div className="p-3 bg-light rounded-3 border">
                      <h6 className="fw-bold small mb-2"><CreditCard className="me-2"/>Ödeme Özeti</h6>
                      <div className="d-flex justify-content-between small mb-1">
                        <span>Ara Toplam</span>
                        <span>{formatPrice(order.totalAmount)}</span>
                      </div>
                      <div className="d-flex justify-content-between small mb-1 text-success">
                        <span>Kargo</span>
                        <span>Ücretsiz</span>
                      </div>
                      <div className="d-flex justify-content-between fw-bold mt-2 pt-2 border-top text-primary">
                        <span>Genel Toplam</span>
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
      
      {filteredOrders.length === 0 && (
        <div className="text-center py-5 text-muted border rounded bg-white">
          Aranan kriterde sipariş bulunamadı.
        </div>
      )}
    </Container>
  );
};

export default OrdersPage;