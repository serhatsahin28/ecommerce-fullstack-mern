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

  // Simülasyon: Gerçek projede kullanıcı bilgileri backend'den çekilir
 useEffect(() => {
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token'); // JWT varsa
      const res = await axios.get('http://localhost:5000/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUser(res.data);
    } catch (err) {
      console.error("Profil verileri alınamadı:", err);
    }
  };

  fetchUserData();
}, []);


  const handleChange = (e) => {
    setUser((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };


  
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Gerçek projede bu endpoint'e gönderilir
      await axios.put('http://localhost:5000/profile/update', user);
      alert('Bilgiler güncellendi.');
    } catch (err) {
      alert('Güncelleme sırasında bir hata oluştu.');
    }
  };

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

console.log("Kullanıcı Bilgisi:", user);

  return (
    <Container className="py-5" style={{ maxWidth: '600px' }}>
      <Card className="shadow-sm">
        <Card.Body>
          <h4 className="mb-4 text-center text-danger">Profil Bilgileri</h4>
          <Form onSubmit={handleUpdate}>
            <Row className="mb-3">
              <Col>
                <Form.Label>Ad</Form.Label>
                <Form.Control
                  type="text"
                  name="ad"
                  value={user.ad}
                  onChange={handleChange}
                  required
                />
              </Col>
              <Col>
                <Form.Label>Soyad</Form.Label>
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
              <Form.Label>Şifre</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={user.password}
                onChange={handleChange}
                placeholder="Yeni şifre (isteğe bağlı)"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Telefon</Form.Label>
              <Form.Control
                type="tel"
                name="telefon"
                value={user.telefon}
                onChange={handleChange}
              />
            </Form.Group>

            <Button variant="danger" type="submit" className="w-100">
              Güncelle
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profile;
