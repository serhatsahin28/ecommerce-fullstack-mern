import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState({
    ad: '',
    soyad: '',
    email: '',
    password: '',
    telefon: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Backend'den gelen veride eksik alan varsa boş string ata
        setUser({
          ad: res.data.ad || '',
          soyad: res.data.soyad || '',
          email: res.data.email || '',
          password: '',           // Şifreyi boş bırak, güvenlik için
          telefon: res.data.telefon || ''
        });
        console.log('Profil verileri:', res.data);
      } catch (err) {
        console.error('Profil verileri alınamadı:', err);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setUser(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/profile/update', user, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert('Bilgiler güncellendi.');
    } catch (err) {
      alert('Güncelleme sırasında bir hata oluştu.');
      console.error('Update error:', err);
    }
  };

  return (
  <Container className="py-5" style={{ maxWidth: '600px' }}>
    <Card className="shadow-sm">
      <Card.Body>
        <h4 className="mb-4 text-center text-danger">Profile Information</h4>
        <Form onSubmit={handleUpdate}>
          <Row className="mb-3">
            <Col>
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="ad"
                value={user.ad}
                onChange={handleChange}
                required
              />
            </Col>
            <Col>
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="soyad"
                value={user.soyad}
                onChange={handleChange}
                required
              />
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={user.password}
              onChange={handleChange}
              placeholder="New password (optional)"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="tel"
              name="telefon"
              value={user.telefon}
              onChange={handleChange}
            />
          </Form.Group>

          <Button variant="danger" type="submit" className="w-100">
            Update
          </Button>
        </Form>
      </Card.Body>
    </Card>
  </Container>
);

};

export default Profile;
