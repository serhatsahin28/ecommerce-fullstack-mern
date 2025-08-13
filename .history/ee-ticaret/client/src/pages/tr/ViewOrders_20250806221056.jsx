// import React, { useEffect, useState } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import {
//     Container, Spinner, Alert, Card, Row, Col,
//     Badge, Button, ProgressBar, Table
// } from 'react-bootstrap';
// import {
//     BsCalendarCheck, BsCurrencyDollar, BsPerson, BsTelephone, BsEnvelope, BsGeoAlt
// } from 'react-icons/bs';
// import axios from 'axios';

// const ViewOrdersPage = () => {
//     const [searchParams] = useSearchParams();
//     const token = searchParams.get('token');

//     const [loading, setLoading] = useState(true);
//     const [orders, setOrders] = useState([]);
//     const [filteredOrders, setFilteredOrders] = useState([]);
//     const [activeStatus, setActiveStatus] = useState('all');
//     const [message, setMessage] = useState('');
//     const [variant, setVariant] = useState('info');
//     const [expandedOrder, setExpandedOrder] = useState(null);

//     const filterOrders = (status) => {
//         setActiveStatus(status);
//         if (status === 'all') {
//             setFilteredOrders(orders);
//         } else {
//             setFilteredOrders(orders.filter(order => order.orderStatus === status));
//         }
//     };

//     const getStatusText = (status) => {
//         switch (status) {
//             case 'processing': return 'Hazırlanıyor';
//             case 'shipped': return 'Kargoya Verildi';
//             case 'delivered': return 'Teslim Edildi';
//             case 'cancelled': return 'İptal Edildi';
//             default: return status;
//         }
//     };

//     const getStatusVariant = (status) => {
//         switch (status) {
//             case 'processing': return 'primary';
//             case 'shipped': return 'warning';
//             case 'delivered': return 'success';
//             case 'cancelled': return 'danger';
//             default: return 'secondary';
//         }
//     };

//     const getPaymentMethodText = (method) => {
//         switch (method) {
//             case 'iyzico': return 'Kredi/Banka Kartı';
//             case 'cash': return 'Kapıda Ödeme';
//             default: return method;
//         }
//     };

//     const getDeliveryProgress = (status) => {
//         switch (status) {
//             case 'processing': return 30;
//             case 'shipped': return 70;
//             case 'delivered': return 100;
//             case 'cancelled': return 0;
//             default: return 0;
//         }
//     };

//     useEffect(() => {
//         const fetchOrders = async () => {
//             if (!token) {
//                 setVariant('danger');
//                 setMessage('Geçersiz bağlantı: Token bulunamadı.');
//                 setLoading(false);
//                 return;
//             }
//             try {
//                 // Kendi backend URL'ini yazmalısın
//                 const response = await axios.get(`http://localhost:5000/view-orders?token=${token}`
//                 );

//                 if (response.data.success) {
//                     setOrders(response.data.orders);
//                     setFilteredOrders(response.data.orders);
//                     setVariant('success');
//                     setMessage(`Toplam ${response.data.totalOrders} siparişiniz bulundu.`);
//                 } else {
//                     setVariant('warning');
//                     setMessage(response.data.message || 'Siparişler getirilemedi.');
//                     setOrders([]);
//                     setFilteredOrders([]);
//                 }
//             } catch (error) {
//                 setVariant('danger');
//                 setMessage(error.response?.data?.message || 'Sunucu hatası oluştu.');
//                 setOrders([]);
//                 setFilteredOrders([]);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchOrders();
//     }, [token]);

//     const toggleOrderExpand = (orderId) => {
//         setExpandedOrder(expandedOrder === orderId ? null : orderId);
//     };

//     return (
//         <Container className="py-4 py-md-5">
//             <div className="text-center mb-4 mb-md-5">
//                 <h1 className="fw-bold text-danger mb-3">Siparişlerim</h1>
//                 <p className="text-muted fs-5">Tüm siparişlerinizi buradan takip edebilirsiniz</p>
//             </div>

//             {loading ? (
//                 <div className="text-center py-5">
//                     <Spinner animation="border" variant="danger" size="lg" />
//                     <p className="mt-3 fs-5">Siparişleriniz yükleniyor...</p>
//                 </div>
//             ) : (
//                 <>
//                     {message && <Alert variant={variant} className="mb-4">{message}</Alert>}

//                     {orders.length > 0 ? (
//                         <>
//                             <div className="d-flex justify-content-center mb-4 flex-wrap">
//                                 <Button
//                                     variant={activeStatus === 'all' ? 'danger' : 'outline-secondary'}
//                                     className="me-2 mb-2 rounded-pill px-3"
//                                     onClick={() => filterOrders('all')}
//                                 >
//                                     Tüm Siparişler
//                                 </Button>
//                                 <Button
//                                     variant={activeStatus === 'processing' ? 'danger' : 'outline-secondary'}
//                                     className="me-2 mb-2 rounded-pill px-3"
//                                     onClick={() => filterOrders('processing')}
//                                 >
//                                     Hazırlananlar
//                                 </Button>
//                                 <Button
//                                     variant={activeStatus === 'shipped' ? 'danger' : 'outline-secondary'}
//                                     className="me-2 mb-2 rounded-pill px-3"
//                                     onClick={() => filterOrders('shipped')}
//                                 >
//                                     Kargodakiler
//                                 </Button>
//                                 <Button
//                                     variant={activeStatus === 'delivered' ? 'danger' : 'outline-secondary'}
//                                     className="me-2 mb-2 rounded-pill px-3"
//                                     onClick={() => filterOrders('delivered')}
//                                 >
//                                     Teslim Edilenler
//                                 </Button>
//                                 <Button
//                                     variant={activeStatus === 'cancelled' ? 'danger' : 'outline-secondary'}
//                                     className="mb-2 rounded-pill px-3"
//                                     onClick={() => filterOrders('cancelled')}
//                                 >
//                                     İptal Edilenler
//                                 </Button>
//                             </div>

//                             {filteredOrders.map(order => (
//                                 <Card key={order._id} className="mb-4 shadow-sm border-0">
//                                     <Card.Body>
//                                         <Row className="align-items-center">
//                                             <Col md={3}>
//                                                 <h5 className="mb-1">{order.orderCode}</h5>
//                                                 <Badge bg={getStatusVariant(order.orderStatus)}>
//                                                     {getStatusText(order.orderStatus)}
//                                                 </Badge>
//                                             </Col>
//                                             <Col md={3}>
//                                                 <p className="mb-1"><BsCalendarCheck /> {new Date(order.createdAt).toLocaleString()}</p>
//                                                 <p className="mb-1"><BsCurrencyDollar /> {order.totalAmount.toFixed(2)} ₺</p>
//                                             </Col>
//                                             <Col md={3}>
//                                                 <ProgressBar
//                                                     now={getDeliveryProgress(order.orderStatus)}
//                                                     label={`${getDeliveryProgress(order.orderStatus)}%`}
//                                                     variant="danger"
//                                                 />
//                                             </Col>
//                                             <Col md={3} className="text-md-end">
//                                                 <Button
//                                                     variant="outline-danger"
//                                                     size="sm"
//                                                     onClick={() => toggleOrderExpand(order._id)}
//                                                 >
//                                                     {expandedOrder === order._id ? 'Kapat' : 'Detay'}
//                                                 </Button>
//                                             </Col>
//                                         </Row>

//                                         {expandedOrder === order._id && (
//                                             <div className="mt-3">
//                                                 <Row>
//                                                     <Col md={6}>
//                                                         <h6>Müşteri Bilgileri</h6>
//                                                         <p><BsPerson /> {order.firstName} {order.lastName}</p>
//                                                         <p><BsEnvelope /> {order.email}</p>
//                                                         <p><BsTelephone /> {order.phone}</p>
//                                                     </Col>
//                                                     <Col md={6}>
//                                                         <h6>Teslimat Adresi</h6>
//                                                         <p><BsGeoAlt /> {order.shippingInfo.address}, {order.shippingInfo.district}, {order.shippingInfo.city} - {order.shippingInfo.postalCode}</p>
//                                                         <p>Notlar: {order.shippingInfo.notes}</p>
//                                                     </Col>
//                                                 </Row>

//                                                 <h6>Ürünler</h6>
//                                                 <Table bordered hover responsive className="mt-2">
//                                                     <thead>
//                                                         <tr>
//                                                             <th>Ürün</th>
//                                                             <th>Kategori</th>
//                                                             <th>Adet</th>
//                                                             <th>Birim Fiyat</th>
//                                                             <th>Tutar</th>
//                                                         </tr>
//                                                     </thead>
//                                                     <tbody>
//                                                         {order.cart.map(item => (
//                                                             <tr key={item._id}>
//                                                                 <td>{item.name}</td>
//                                                                 <td>{item.category}</td>
//                                                                 <td>{item.quantity}</td>
//                                                                 <td>{item.price.toFixed(2)} ₺</td>
//                                                                 <td>{(item.price * item.quantity).toFixed(2)} ₺</td>
//                                                             </tr>
//                                                         ))}
//                                                     </tbody>
//                                                 </Table>

//                                                 <Row className="mt-3">
//                                                     <Col md={6}>
//                                                         <h6>Ödeme Bilgileri</h6>
//                                                         <p>Yöntem: {getPaymentMethodText(order.payment.method)}</p>
//                                                         <p>Durum: {order.payment.status === 'success' ? 'Başarılı' : 'Başarısız'}</p>
//                                                         <p>İyzico Referans: {order.payment.iyzicoReference}</p>
//                                                         <p>Tarih: {new Date(order.payment.date).toLocaleString()}</p>
//                                                     </Col>
//                                                 </Row>
//                                             </div>
//                                         )}
//                                     </Card.Body>
//                                 </Card>
//                             ))}
//                         </>
//                     ) : (
//                         <p className="text-center fs-5 text-muted">Gösterilecek sipariş yok.</p>
//                     )}
//                 </>
//             )}
//         </Container>
//     );
// };

// export default ViewOrdersPage;
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Container, Spinner, Alert, Card, Row, Col,
    Badge, Button, ProgressBar, Table
} from 'react-bootstrap';
import {
    BsCalendarCheck, BsCurrencyDollar, BsPerson, BsTelephone, BsEnvelope, BsGeoAlt
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

    const filterOrders = (status) => {
        setActiveStatus(status);
        if (status === 'all') {
            setFilteredOrders(orders);
        } else {
            setFilteredOrders(orders.filter(order => order.orderStatus === status));
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'processing': return 'Hazırlanıyor';
            case 'shipped': return 'Kargoya Verildi';
            case 'delivered': return 'Teslim Edildi';
            case 'cancelled': return 'İptal Edildi';
            default: return status;
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'processing': return 'primary';
            case 'shipped': return 'warning';
            case 'delivered': return 'success';
            case 'cancelled': return 'danger';
            default: return 'secondary';
        }
    };

    const getPaymentMethodText = (method) => {
        switch (method) {
            case 'iyzico': return 'Kredi/Banka Kartı';
            case 'cash': return 'Kapıda Ödeme';
            default: return method;
        }
    };

    const getDeliveryProgress = (status) => {
        switch (status) {
            case 'processing': return 30;
            case 'shipped': return 70;
            case 'delivered': return 100;
            case 'cancelled': return 0;
            default: return 0;
        }
    };

    useEffect(() => {
        const fetchOrders = async () => {
            if (!token) {
                setVariant('danger');
                setMessage('Geçersiz bağlantı: Token bulunamadı.');
                setLoading(false);
                return;
            }
            try {
                // Kendi backend URL'ini yazmalısın
                const response = await axios.get(`http://localhost:5000/view-orders?token=${token}`
                );

                if (response.data.success) {
                    setOrders(response.data.orders);
                    setFilteredOrders(response.data.orders);
                    setVariant('success');
                    setMessage(`Toplam ${response.data.totalOrders} siparişiniz bulundu.`);
                } else {
                    setVariant('warning');
                    setMessage(response.data.message || 'Siparişler getirilemedi.');
                    setOrders([]);
                    setFilteredOrders([]);
                }
            } catch (error) {
                setVariant('danger');
                setMessage(error.response?.data?.message || 'Sunucu hatası oluştu.');
                setOrders([]);
                setFilteredOrders([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [token]);

    const toggleOrderExpand = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
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
                    {message && <Alert variant={variant} className="mb-4">{message}</Alert>}

                    {orders.length > 0 ? (
                        <>
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
