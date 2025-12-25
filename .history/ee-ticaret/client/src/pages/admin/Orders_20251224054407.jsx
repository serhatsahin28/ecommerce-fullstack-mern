import React, { useState, useEffect } from 'react';
import {
    Container, Row, Col, Table, Spinner, Alert, Badge,
    InputGroup, Form, Modal, Button, Card
} from 'react-bootstrap';
import { Search, InfoCircle, XCircle, CheckCircle, ExclamationTriangle } from 'react-bootstrap-icons';
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
            // En yeni sipariş en üstte
            setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Durum güncelleme fonksiyonu (Genel)
    const updateOrderStatus = async (orderId, targetStatus) => {
        setUpdating(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/admin/OrdersStatusUpdate', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ order_id: orderId, status: targetStatus })
            });

            if (!res.ok) throw new Error('Güncelleme başarısız oldu');

            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: targetStatus } : o));
            setSelectedOrder(prev => prev ? { ...prev, orderStatus: targetStatus } : null);
            alert(`Sipariş durumu "${targetStatus}" olarak güncellendi.`);
        } catch (err) {
            alert(err.message);
        } finally {
            setUpdating(false);
        }
    };

    const approveCancelOrder = async () => {
  try {
    await axios.post("http://localhost:5000/admin/OrdersCancelApprove", {
      order_code: orderCode
    });

    window.location.reload();
  } catch (err) {
    alert("İptal onayı başarısız");
  }
};


    const getStatusBadge = (status) => {
        const statusMap = {
            processing: { variant: 'warning', text: 'İşleniyor' },
            shipped: { variant: 'info', text: 'Kargoda' },
            delivered: { variant: 'success', text: 'Teslim Edildi' },
            cancel_pending: { variant: 'danger', text: 'İptal Talebi Var' },
            cancelled: { variant: 'dark', text: 'İptal Edildi' }
        };
        const s = statusMap[status] || { variant: 'secondary', text: status };
        return <Badge bg={s.variant}>{s.text}</Badge>;
    };

    const filteredOrders = orders.filter(order => {
        const fullName = `${order.firstName} ${order.lastName}`.toLowerCase();
        const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || order.orderCode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || order.orderStatus === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <Container className="my-5">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                    <Row className="align-items-center">
                        <Col md={6}>
                            <h2 className="fw-bold mb-0 text-primary">Sipariş Yönetimi</h2>
                        </Col>
                        <Col md={6}>
                            <InputGroup>
                                <InputGroup.Text className="bg-white"><Search /></InputGroup.Text>
                                <Form.Control
                                    placeholder="Sipariş No veya Müşteri Ara..."
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Form.Select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    style={{ maxWidth: '180px' }}
                                >
                                    <option value="all">Tüm Siparişler</option>
                                    <option value="cancel_pending">İptal Talepleri</option>
                                    <option value="processing">İşleniyor</option>
                                    <option value="shipped">Kargoda</option>
                                    <option value="delivered">Teslim Edildi</option>
                                    <option value="cancelled">İptal Edilenler</option>
                                </Form.Select>
                            </InputGroup>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {loading ? (
                <div className="text-center py-5"><Spinner animation="grow" variant="primary" /></div>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : (
                <Card className="border-0 shadow-sm">
                    <Table hover responsive className="mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-3">Sipariş No</th>
                                <th>Müşteri</th>
                                <th>Durum</th>
                                <th>Toplam</th>
                                <th>Tarih</th>
                                <th className="text-center">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => (
                                <tr key={order._id} className="align-middle">
                                    <td className="ps-3 fw-bold">#{order.orderCode}</td>
                                    <td>
                                        <div className="fw-bold">{order.firstName} {order.lastName}</div>
                                        <div className="small text-muted">{order.email}</div>
                                    </td>
                                    <td>{getStatusBadge(order.orderStatus)}</td>
                                    <td className="fw-bold">{order.totalAmount.toLocaleString('tr-TR')} TL</td>
                                    <td>{new Date(order.createdAt).toLocaleDateString('tr-TR')}</td>
                                    <td className="text-center">
                                        <Button variant="outline-primary" size="sm" onClick={() => setSelectedOrder(order)}>
                                            Detayları Gör
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card>
            )}

            {/* Sipariş Detay Modalı */}
            <Modal show={!!selectedOrder} onHide={() => setSelectedOrder(null)} size="lg" centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title>Sipariş Detayı: #{selectedOrder?.orderCode}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {selectedOrder && (
                        <>
                            {/* İPTAL TALEBİ PANELİ */}
                            {selectedOrder.orderStatus === 'cancel_pending' && (
                                <Alert variant="danger" className="border-0 shadow-sm mb-4">
                                    <div className="d-flex align-items-center mb-2">
                                        <ExclamationTriangle size={24} className="me-2" />
                                        <h5 className="mb-0 fw-bold">Bu sipariş için iptal talebi var!</h5>
                                    </div>
                                    <p className="mb-3"><strong>Müşterinin Belirttiği Neden:</strong> {selectedOrder.cancel.reason || "Neden belirtilmemiş."}</p>
                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => approveCancelOrder(selectedOrder._id, 'cancelled')}
                                            disabled={updating}
                                        >
                                            <CheckCircle className="me-1" /> İptali Onayla (Siparişi İptal Et)
                                        </Button>
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={() => updateOrderStatus(selectedOrder._id, 'processing')}
                                            disabled={updating}
                                        >
                                            <XCircle className="me-1" /> Talebi Reddet (İşleme Devam Et)
                                        </Button>
                                    </div>
                                </Alert>
                            )}

                            {/* İPTAL EDİLMİŞSE NEDENİ GÖSTER */}
                            {selectedOrder.orderStatus === 'cancelled' && selectedOrder.cancel.reason && (
                                <Alert variant="light" className="border mb-4">
                                    <InfoCircle className="me-2" />
                                    <strong>İptal Nedeni:</strong> {selectedOrder.cancel.reason}
                                </Alert>
                            )}

                            <Row className="mb-4">
                                <Col md={6}>
                                    <h6 className="text-muted small fw-bold text-uppercase mb-3">Müşteri & Teslimat</h6>
                                    <div className="p-3 bg-light rounded shadow-sm">
                                        <div className="fw-bold">{selectedOrder.firstName} {selectedOrder.lastName}</div>
                                        <div className="small">{selectedOrder.email} | {selectedOrder.phone}</div>
                                        <hr />
                                        <div className="small text-muted">{selectedOrder.shippingInfo.address}</div>
                                        <div className="small text-muted">{selectedOrder.shippingInfo.district} / {selectedOrder.shippingInfo.city}</div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <h6 className="text-muted small fw-bold text-uppercase mb-3">Sipariş Durumu Güncelle</h6>
                                    <div className="p-3 bg-light rounded shadow-sm">
                                        <Form.Group className="mb-3">
                                            <Form.Select
                                                value={newStatus}
                                                onChange={(e) => setNewStatus(e.target.value)}
                                                disabled={updating || selectedOrder.orderStatus === 'cancel_pending'}
                                            >
                                                <option value="processing">İşleniyor</option>
                                                <option value="shipped">Kargoya Verildi</option>
                                                <option value="delivered">Teslim Edildi</option>
                                                <option value="cancelled">Siparişi İptal Et</option>
                                            </Form.Select>
                                        </Form.Group>
                                        <Button
                                            variant="primary"
                                            className="w-100"
                                            disabled={updating || selectedOrder.orderStatus === 'cancel_pending'}
                                            onClick={() => updateOrderStatus(selectedOrder._id, newStatus)}
                                        >
                                            {updating ? 'Güncelleniyor...' : 'Durumu Güncelle'}
                                        </Button>
                                    </div>
                                </Col>
                            </Row>

                            <h6 className="text-muted small fw-bold text-uppercase mb-3">Ürünler ({selectedOrder.cart.length})</h6>
                            <Table responsive className="border small">
                                <thead className="table-light">
                                    <tr>
                                        <th>Ürün Adı</th>
                                        <th className="text-center">Adet</th>
                                        <th className="text-end">Birim Fiyat</th>
                                        <th className="text-end">Toplam</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.cart.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.name} <br /><small className="text-muted">{item.category}</small></td>
                                            <td className="text-center">{item.quantity}</td>
                                            <td className="text-end">{item.price.toLocaleString('tr-TR')} TL</td>
                                            <td className="text-end fw-bold">{(item.price * item.quantity).toLocaleString('tr-TR')} TL</td>
                                        </tr>
                                    ))}
                                    <tr className="table-light">
                                        <td colSpan="3" className="text-end fw-bold text-uppercase">Genel Toplam</td>
                                        <td className="text-end fw-bold text-primary" style={{ fontSize: '1.1rem' }}>
                                            {selectedOrder.totalAmount.toLocaleString('tr-TR')} TL
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setSelectedOrder(null)}>Kapat</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AdminOrdersPage;