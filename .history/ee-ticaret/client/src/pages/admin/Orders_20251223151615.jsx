import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Spinner, Alert, Badge, InputGroup, Form, Modal, Button } from 'react-bootstrap';
import { Search } from 'react-bootstrap-icons';
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
            setError(null);
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/admin/ordersAll', {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            if (!res.ok) throw new Error('Siparişler yüklenemedi');
            const data = await res.json();
            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const fullName = `${order.firstName} ${order.lastName}`.toLowerCase();
        const matchesSearch =
            fullName.includes(searchTerm.toLowerCase()) ||
            order.orderCode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || order.orderStatus === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        const statusMap = {
            processing: { variant: 'warning', text: 'İşleniyor' },
            shipped: { variant: 'info', text: 'Kargoya Verildi' },
            delivered: { variant: 'success', text: 'Teslim Edildi' },
            cancelled: { variant: 'danger', text: 'İptal Edildi' }
        };
        const s = statusMap[status] || { variant: 'secondary', text: status };
        return <Badge bg={s.variant}>{s.text}</Badge>;
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

            // Frontend tarafında da güncelle
            setOrders(prev => prev.map(o => o._id === selectedOrder._id ? { ...o, orderStatus: newStatus } : o));
            setSelectedOrder(prev => ({ ...prev, orderStatus: newStatus }));

            alert('Sipariş durumu güncellendi!');
        } catch (err) {
            alert(err.message);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <Container className="my-4">
            <Row className="mb-4 align-items-center">
                <Col md={6}><h2>Siparişler</h2></Col>
                <Col md={6}>
                    <InputGroup>
                        <InputGroup.Text><Search /></InputGroup.Text>
                        <Form.Control
                            placeholder="Sipariş ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Form.Select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{ maxWidth: '200px' }}
                        >
                            <option value="all">Tüm Durumlar</option>
                            <option value="processing">İşleniyor</option>
                            <option value="shipped">Kargoya Verildi</option>
                            <option value="delivered">Teslim Edildi</option>
                            <option value="cancelRequest">İptal Talebi</option>
                            <option value="cancelled">İptal Edildi</option>
                        </Form.Select>
                    </InputGroup>
                </Col>
            </Row>

            {loading ? (
                <div className="text-center py-5"><Spinner animation="border" /></div>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : (
                <div className="table-responsive">
                    <Table bordered hover>
                        <thead className="table-light">
                            <tr>
                                <th>Sipariş No</th>
                                <th>Müşteri</th>
                                <th>Email</th>
                                <th>Telefon</th>
                                <th>Durum</th>
                                <th>Toplam Tutar</th>
                                <th>Oluşturulma Tarihi</th>
                                <th>Ürün Sayısı</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => (
                                <tr key={order._id} style={{ cursor: 'pointer' }} onClick={() => setSelectedOrder(order)}>
                                    <td>{order.orderCode}</td>
                                    <td>{order.firstName} {order.lastName}</td>
                                    <td>{order.email}</td>
                                    <td>{order.phone}</td>
                                    <td>{getStatusBadge(order.orderStatus)}</td>
                                    <td>{order.totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td>{order.cart.length}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}

            <Modal show={!!selectedOrder} onHide={() => setSelectedOrder(null)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Sipariş Detayları - {selectedOrder?.orderCode}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedOrder && (
                        <>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <h6>Müşteri Bilgileri</h6>
                                    <p><strong>{selectedOrder.firstName} {selectedOrder.lastName}</strong></p>
                                    <p>{selectedOrder.email}</p>
                                    <p>{selectedOrder.phone}</p>
                                </Col>
                                <Col md={6}>
                                    <h6>Adres</h6>
                                    <p>{selectedOrder.shippingInfo.address}</p>
                                    <p>{selectedOrder.shippingInfo.district}, {selectedOrder.shippingInfo.city}</p>
                                    <p>{selectedOrder.shippingInfo.postalCode}</p>
                                    {selectedOrder.shippingInfo.notes && <p>Not: {selectedOrder.shippingInfo.notes}</p>}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <h6>Ödeme</h6>
                                    <p>Yöntem: {selectedOrder.payment.method}</p>
                                    <p>Durum: {selectedOrder.payment.status}</p>
                                    <p>Tarih: {new Date(selectedOrder.payment.date).toLocaleDateString()}</p>
                                </Col>
                                <Col md={6}>
                                    <h6>Kargo Durumu</h6>
                                    <Form.Select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        disabled={updating}
                                    >
                                        <option value="processing">İşleniyor</option>
                                        <option value="shipped">Kargoya Verildi</option>
                                        <option value="delivered">Teslim Edildi</option>
                                        <option value="cancelRequest">İptal Talebi</option>
                                        <option value="cancelled">İptal Edildi</option>
                                    </Form.Select>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <h6>Ürünler</h6>
                                    <Table bordered>
                                        <thead>
                                            <tr>
                                                <th>Ürün Adı</th>
                                                <th>Kategori</th>
                                                <th>Adet</th>
                                                <th>Birim Fiyat</th>
                                                <th>Toplam</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.cart.map(item => (
                                                <tr key={item._id}>
                                                    <td>{item.name}</td>
                                                    <td>{item.category}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>{item.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</td>
                                                    <td>{(item.price * item.quantity).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </Col>
                            </Row>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setSelectedOrder(null)}>Kapat</Button>
                    <Button variant="primary" onClick={handleUpdateStatus}>
                        {updating ? 'Güncelleniyor...' : 'Güncelle'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AdminOrdersPage;
