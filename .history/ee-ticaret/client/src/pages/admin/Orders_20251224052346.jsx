import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Spinner, Alert, Badge, InputGroup, Form, Modal, Button } from 'react-bootstrap';
import { Search, InfoCircle, XCircle, Truck, CheckCircle, ClockHistory, GeoAlt, CreditCard, BoxSeam } from 'react-bootstrap-icons';
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [newStatus, setNewStatus] = useState('processing');

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        if (selectedOrder) setNewStatus(selectedOrder.orderStatus);
    }, [selectedOrder]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/admin/ordersAll', {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            if (!res.ok) throw new Error('Siparişler yüklenemedi');
            const data = await res.json();
            // Tarihe göre sırala (En yeni en üstte)
            const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(sorted);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            processing: { variant: 'warning', text: 'İşleniyor', icon: <ClockHistory className="me-1"/> },
            shipped: { variant: 'info', text: 'Kargoda', icon: <Truck className="me-1"/> },
            delivered: { variant: 'success', text: 'Teslim Edildi', icon: <CheckCircle className="me-1"/> },
            cancel_pending: { variant: 'orange', text: 'İptal Talebi Var', icon: <InfoCircle className="me-1"/> }, // Özel renk
            cancelled: { variant: 'danger', text: 'İptal Edildi', icon: <XCircle className="me-1"/> }
        };
        const s = statusMap[status] || { variant: 'secondary', text: status, icon: null };
        
        // Bootstrap'te 'orange' rengi yoksa manuel style verelim
        const style = status === 'cancel_pending' ? { backgroundColor: '#fd7e14', color: 'white' } : {};
        
        return <Badge bg={s.variant !== 'orange' ? s.variant : ''} style={style} className="px-2 py-1">{s.icon}{s.text}</Badge>;
    };

    const handleUpdateStatus = async () => {
        if (!selectedOrder) return;
        setUpdating(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/admin/OrdersStatusUpdate', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ order_id: selectedOrder._id, status: newStatus })
            });

            if (!res.ok) throw new Error('Durum güncellenemedi');

            setOrders(prev => prev.map(o => o._id === selectedOrder._id ? { ...o, orderStatus: newStatus } : o));
            setSelectedOrder(prev => ({ ...prev, orderStatus: newStatus }));
            alert('Sipariş durumu güncellendi!');
        } catch (err) {
            alert(err.message);
        } finally {
            setUpdating(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const fullName = `${order.firstName} ${order.lastName}`.toLowerCase();
        const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || order.orderCode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || order.orderStatus === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <Container className="my-5">
            <Row className="mb-4 align-items-center">
                <Col md={6}><h2 className="fw-bold">📦 Sipariş Yönetimi</h2></Col>
                <Col md={6}>
                    <InputGroup className="shadow-sm">
                        <InputGroup.Text className="bg-white"><Search /></InputGroup.Text>
                        <Form.Control
                            placeholder="Müşteri veya Sipariş No..."
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Form.Select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{ maxWidth: '200px' }}
                        >
                            <option value="all">Tüm Durumlar</option>
                            <option value="cancel_pending">⚠️ İptal Talepleri</option>
                            <option value="processing">İşleniyor</option>
                            <option value="shipped">Kargoda</option>
                            <option value="delivered">Teslim Edildi</option>
                            <option value="cancelled">İptal Edilenler</option>
                        </Form.Select>
                    </InputGroup>
                </Col>
            </Row>

            {loading ? (
                <div className="text-center py-5"><Spinner animation="grow" variant="primary" /></div>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : (
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                    <Table hover responsive className="align-middle mb-0">
                        <thead className="table-light">
                            <tr className="text-muted small">
                                <th className="ps-4">SİPARİŞ NO</th>
                                <th>MÜŞTERİ</th>
                                <th>DURUM</th>
                                <th>TOPLAM</th>
                                <th>TARİH</th>
                                <th className="text-center">ÜRETİCİ/ÜRÜN</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => (
                                <tr key={order._id} style={{ cursor: 'pointer' }} onClick={() => setSelectedOrder(order)}>
                                    <td className="ps-4 fw-bold text-primary">#{order.orderCode}</td>
                                    <td>
                                        <div className="fw-bold">{order.firstName} {order.lastName}</div>
                                        <div className="small text-muted">{order.email}</div>
                                    </td>
                                    <td>{getStatusBadge(order.orderStatus)}</td>
                                    <td className="fw-bold text-dark">{order.totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</td>
                                    <td className="small">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</td>
                                    <td className="text-center"><Badge bg="light" text="dark" className="border">{order.cart.length} Ürün</Badge></td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card>
            )}

            {/* Sipariş Detay Modalı */}
            <Modal show={!!selectedOrder} onHide={() => setSelectedOrder(null)} size="lg" centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">Sipariş Detayı #{selectedOrder?.orderCode}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-0">
                    {selectedOrder && (
                        <>
                            {/* İPTAL TALEBİ UYARISI */}
                            {(selectedOrder.orderStatus === 'cancel_pending' || selectedOrder.cancelReason) && (
                                <Alert variant="danger" className="d-flex align-items-center rounded-3 mb-4">
                                    <XCircle size={24} className="me-3" />
                                    <div>
                                        <h6 className="mb-1 fw-bold">Müşteri İptal Talebi</h6>
                                        <p className="mb-0 small">
                                            <strong>Neden:</strong> {selectedOrder.cancelReason || "Neden belirtilmemiş."}
                                        </p>
                                    </div>
                                </Alert>
                            )}

                            <Row className="g-4 mb-4">
                                <Col md={6}>
                                    <div className="bg-light p-3 rounded-3 h-100 border border-white">
                                        <h6 className="fw-bold small text-muted text-uppercase mb-3"><GeoAlt className="me-2"/>Teslimat Bilgileri</h6>
                                        <p className="mb-1 fw-bold">{selectedOrder.firstName} {selectedOrder.lastName}</p>
                                        <p className="small mb-1 text-muted">{selectedOrder.phone}</p>
                                        <p className="small mb-0 text-muted">{selectedOrder.shippingInfo.address}</p>
                                        <p className="small mb-0 text-muted">{selectedOrder.shippingInfo.district} / {selectedOrder.shippingInfo.city.toUpperCase()}</p>
                                        {selectedOrder.shippingInfo.notes && (
                                            <div className="mt-2 p-2 bg-white rounded small text-danger border">
                                                <strong>Not:</strong> {selectedOrder.shippingInfo.notes}
                                            </div>
                                        )}
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="bg-light p-3 rounded-3 h-100 border border-white">
                                        <h6 className="fw-bold small text-muted text-uppercase mb-3"><CreditCard className="me-2"/>Ödeme & Durum</h6>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="small">Yöntem:</span>
                                            <span className="small fw-bold">{selectedOrder.payment.method}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-3">
                                            <span className="small">Ödeme Durumu:</span>
                                            <Badge bg="success" size="sm">{selectedOrder.payment.status}</Badge>
                                        </div>
                                        <hr/>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">Durum Güncelle</Form.Label>
                                            <Form.Select 
                                                value={newStatus} 
                                                onChange={(e) => setNewStatus(e.target.value)}
                                                className="form-select-sm"
                                                disabled={updating}
                                            >
                                                <option value="processing">İşleniyor</option>
                                                <option value="shipped">Kargoya Verildi</option>
                                                <option value="delivered">Teslim Edildi</option>
                                                <option value="cancelled">İptal Et / Onayla</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </div>
                                </Col>
                            </Row>

                            <h6 className="fw-bold small text-muted text-uppercase mb-3"><BoxSeam className="me-2"/>Ürünler</h6>
                            <Table responsive borderless className="align-middle border rounded-3 overflow-hidden">
                                <thead className="table-light small">
                                    <tr>
                                        <th>Ürün</th>
                                        <th className="text-center">Adet</th>
                                        <th className="text-end">Fiyat</th>
                                        <th className="text-end">Toplam</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.cart.map((item, i) => (
                                        <tr key={i} className="border-bottom">
                                            <td>
                                                <div className="fw-bold small">{item.name}</div>
                                                <div className="text-muted" style={{fontSize: '11px'}}>{item.category}</div>
                                            </td>
                                            <td className="text-center small">{item.quantity}</td>
                                            <td className="text-end small">{item.price.toLocaleString('tr-TR')} TL</td>
                                            <td className="text-end small fw-bold">{(item.price * item.quantity).toLocaleString('tr-TR')} TL</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-light">
                                    <tr>
                                        <td colSpan="3" className="text-end fw-bold">Genel Toplam:</td>
                                        <td className="text-end fw-bold text-primary fs-5">{selectedOrder.totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</td>
                                    </tr>
                                </tfoot>
                            </Table>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button variant="light" onClick={() => setSelectedOrder(null)}>Kapat</Button>
                    <Button variant="primary" className="px-4" onClick={handleUpdateStatus} disabled={updating}>
                        {updating ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AdminOrdersPage;