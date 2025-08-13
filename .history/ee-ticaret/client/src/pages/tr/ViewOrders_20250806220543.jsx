import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Container, Spinner, Alert, Card, Row, Col, 
  Badge, Button, ProgressBar, Table 
} from 'react-bootstrap';
import { 
  BsCalendarCheck, BsCreditCard, BsTruck, 
  BsBoxSeam, BsCheckCircle, BsChevronDown,
  BsGeoAlt, BsPerson, BsTelephone, BsEnvelope,
  BsCurrencyDollar, BsReceipt
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

  // Demo sipariş verisi
  const mockOrder = {
    _id: "68928c31332568cd46bdcf60",
    userId: null,
    email: "sahinserhat923@gmail.com",
    firstName: "Serhat",
    lastName: "Şahin",
    phone: "5551234567",
    cart: [
      {
        product_id: "68652558953059c152a9ba94",
        name: "Huawei Watch GT 5 Pro Black(46mm) Smart Watch",
        category: "Elektronik",
        price: 0.39,
        quantity: 1,
        _id: "68928c31332568cd46bdcf61"
      },
      {
        product_id: "686528c6953059c152a9ba9a",
        name: "Linen Blend Brown Shirt",
        category: "Moda",
        price: 0.37,
        quantity: 1,
        _id: "68928c31332568cd46bdcf62"
      },
      {
        product_id: "686527d8953059c152a9ba98",
        name: "White T-shirt",
        category: "Fashion",
        price: 0.39,
        quantity: 1,
        _id: "68928c31332568cd46bdcf63"
      }
    ],
    totalAmount: 1.15,
    shippingInfo: {
      address: "Örnek Mah. Demo Cad. No:123",
      city: "İstanbul",
      district: "Kadıköy",
      postalCode: "34700",
      notes: "Kapıyı çalmadan teslim ediniz"
    },
    payment: {
      method: "iyzico",
      status: "success",
      iyzicoReference: "25100775",
      date: "2025-08-05T22:56:49.057Z"
    },
    orderStatus: "processing",
    orderCode: "ORD-609064006",
    createdAt: "2025-08-05T22:56:49.064Z",
    __v: 0
  };

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

  // Teslimat durumu için ilerleme çubuğu
  const getDeliveryProgress = (status) => {
    switch (status) {
      case 'processing': return 30;
      case 'shipped': return 70;
      case 'delivered': return 100;
      case 'cancelled': return 0;
      default: return 0;
    }
  };

  // Siparişleri API'den çekme
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!token) {
          setVariant('danger');
          setMessage('Geçersiz bağlantı: Token bulunamadı.');
          setLoading(false);
          return;
        }

        // Buraya kendi gerçek API endpoint'inizi koyun
        const response = await axios.get(`https://api.example.com/view-orders?token=${token}`);

        if (response.data.success) {
          const ordersData = response.data.orders;
          setOrders(ordersData);
          setFilteredOrders(ordersData);
          setVariant('success');
          setMessage(`Hoş geldiniz! Toplam ${response.data.totalOrders} siparişiniz bulundu.`);
        } else {
          setVariant('warning');
          setMessage(response.data.message || 'Siparişler getirilemedi.');
          setOrders([]);
          setFilteredOrders([]);
        }
      } catch (err) {
        setVariant('danger');
        setMessage(err.response?.data?.message || 'Sunucu hatası oluştu.');
        setOrders([]);
        setFilteredOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  // Demo veri gösterme (API’den veri yoksa)
  useEffect(() => {
    if (!loading && orders.length === 0) {
      setOrders([mockOrder]);
      setFilteredOrders([mockOrder]);
      setMessage("Demo sipariş bilgileri gösteriliyor");
      setVariant("info");
    }
  }, [loading, orders]);

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
              {filteredOrders.map(order => (
                <Card key={order._id} className="mb-4 shadow-sm border-0">
                  <Card.Body>
                    <Row className="align-items-center">
                      <Col md={3}>
                        <h5 className="mb-1">{order.orderCode}</h5>
                        <Badge bg={getStatusVariant(order.orderStatus)}>
                          {getStatusText(order.orderStatus)}
                        </Badge>
                      </Col>
                      <Col md={3}>
                        <p className="mb-1"><BsCalendarCheck /> {new Date(order.createdAt).toLocaleString()}</p>
                        <p className="mb-1"><BsCurrencyDollar /> {order.totalAmount.toFixed(2)} ₺</p>
                      </Col>
                      <Col md={3}>
                        <ProgressBar 
                          now={getDeliveryProgress(order.orderStatus)} 
                          label={`${getDeliveryProgress(order.orderStatus)}%`} 
                          variant="danger"
                        />
                      </Col>
                      <Col md={3} className="text-md-end">
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          onClick={() => toggleOrderExpand(order._id)}
                        >
                          {expandedOrder === order._id ? 'Kapat' : 'Detay'}
                        </Button>
                      </Col>
                    </Row>

                    {expandedOrder === order._id && (
                      <div className="mt-3">
                        {/* Sipariş Detayları */}
                        <Row>
                          <Col md={6}>
                            <h6>Müşteri Bilgileri</h6>
                            <p><BsPerson /> {order.firstName} {order.lastName}</p>
                            <p><BsEnvelope /> {order.email}</p>
                            <p><BsTelephone /> {order.phone}</p>
                          </Col>
                          <Col md={6}>
                            <h6>Teslimat Adresi</h6>
                            <p><BsGeoAlt /> {order.shippingInfo.address}, {order.shippingInfo.district}, {order.shippingInfo.city} - {order.shippingInfo.postalCode}</p>
                            <p>Notlar: {order.shippingInfo.notes}</p>
                          </Col>
                        </Row>

                        <h6>Ürünler</h6>
                        <Table bordered hover responsive className="mt-2">
                          <thead>
                            <tr>
                              <th>Ürün</th>
                              <th>Kategori</th>
                              <th>Adet</th>
                              <th>Birim Fiyat</th>
                              <th>Tutar</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.cart.map(item => (
                              <tr key={item._id}>
                                <td>{item.name}</td>
                                <td>{item.category}</td>
                                <td>{item.quantity}</td>
                                <td>{item.price.toFixed(2)} ₺</td>
                                <td>{(item.price * item.quantity).toFixed(2)} ₺</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>

                        <Row className="mt-3">
                          <Col md={6}>
                            <h6>Ödeme Bilgileri</h6>
                            <p>Yöntem: {getPaymentMethodText(order.payment.method)}</p>
                            <p>Durum: {order.payment.status === 'success' ? 'Başarılı' : 'Başarısız'}</p>
                            <p>İyzico Referans: {order.payment.iyzicoReference}</p>
                            <p>Tarih: {new Date(order.payment.date).toLocaleString()}</p>
                          </Col>
                        </Row>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              ))}
            </>
          ) : (
            <p className="text-center fs-5 text-muted">Gösterilecek sipariş yok.</p>
          )}
        </>
      )}
    </Container>
  );
};

export default ViewOrdersPage;
