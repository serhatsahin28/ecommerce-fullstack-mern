import React, { useState, useEffect } from 'react';
import { Table, Container, Row, Col, Form, InputGroup, Spinner, Alert, Badge, Button } from 'react-bootstrap';
import { Search } from 'react-bootstrap-icons';
import 'bootstrap/dist/css/bootstrap.min.css';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token'); // opsiyonel: auth varsa
      const res = await fetch('http://localhost:5000/admin/userAll', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!res.ok) throw new Error('Kullanıcılar yüklenemedi');

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const fullName = `${u.ad} ${u.soyad}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || u.durum === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <Container className="my-4">
      <Row className="mb-4 align-items-center">
        <Col md={6}>
          <h2>Kullanıcılar</h2>
        </Col>
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text><Search /></InputGroup.Text>
            <Form.Control
              placeholder="Kullanıcı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Form.Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ maxWidth: '200px' }}
            >
              <option value="all">Tüm Durumlar</option>
              <option value="aktif">Aktif</option>
              <option value="pasif">Pasif</option>
            </Form.Select>
          </InputGroup>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <div className="table-responsive">
          <Table bordered hover>
            <thead className="table-light">
              <tr>
                <th>Ad Soyad</th>
                <th>Email</th>
                <th>Telefon</th>
                <th>Rol</th>
                <th>Durum</th>
                <th>Kayıt Tarihi</th>
                <th>Son Giriş</th>
                <th>Adres Sayısı</th>
                <th>Favoriler</th>
                <th>Sepet</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id}>
                  <td>{user.ad} {user.soyad}</td>
                  <td>{user.email}</td>
                  <td>{user.telefon}</td>
                  <td>{user.rol}</td>
                  <td>
                    <Badge bg={user.durum === 'aktif' ? 'success' : 'secondary'}>
                      {user.durum}
                    </Badge>
                  </td>
                  <td>{new Date(user.kayit_tarihi).toLocaleDateString()}</td>
                  <td>{user.son_giris ? new Date(user.son_giris).toLocaleDateString() : '-'}</td>
                  <td>{user.adresler.length}</td>
                  <td>{user.favoriler.length}</td>
                  <td>{user.sepet.length}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default UsersPage;
