import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const ProfileTR = () => {
  const [kullanici, setKullanici] = useState({
    ad: '',
    soyad: '',
    email: '',
    sifre: '',
    telefon: ''
  });

  useEffect(() => {
    const kullaniciBilgileriniGetir = async () => {
      try {
        const token = localStorage.getItem('token');
        const yanit = await axios.get('http://localhost:5000/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setKullanici({
          ad: yanit.data.ad || '',
          soyad: yanit.data.soyad || '',
          email: yanit.data.email || '',
          sifre: '',
          telefon: yanit.data.telefon || ''
        });

        console.log('Kullanıcı verisi:', yanit.data);
      } catch (err) {
        console.error('Profil verisi alınamadı:', err);
      }
    };

    kullaniciBilgileriniGetir();
  }, []);

  const handleDegisim = (e) => {
    setKullanici((onceki) => ({
      ...onceki,
      [e.target.name]: e.target.value
    }));
  };

  const bilgileriGuncelle = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/profile/update', kullanici, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert('Profil bilgileri başarıyla güncellendi.');
    } catch (err) {
      alert('Güncelleme sırasında bir hata oluştu.');
      console.error('Güncelleme hatası:', err);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: '600px' }}>
      <Card className="shadow-sm">
        <Card.Body>
          <h4 className="mb-4 text-center text-danger">Profil Bilgileri</h4>
          <Form onSubmit={bilgileriGuncelle}>
            <Row className="mb-3">
              <Col>
                <Form.Label>Ad</Form.Label>
                <Form.Control
                  type="text"
                  name="ad"
                  value={kullanici.ad}
                  onChange={handleDegisim}
                  required
                />
              </Col>
              <Col>
                <Form.Label>Soyad</Form.Label>
                <Form.Control
                  type="text"
                  name="soyad"
                  value={kullanici.soyad}
                  onChange={handleDegisim}
                  required
                />
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>E-posta</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={kullanici.email}
                onChange={handleDegisim}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Yeni Şifre</Form.Label>
              <Form.Control
                type="password"
                name="sifre"
                value={kullanici.sifre}
                onChange={handleDegisim}
                placeholder="Yeni şifre (zorunlu değil)"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Telefon</Form.Label>
              <Form.Control
                type="tel"
                name="telefon"
                value={kullanici.telefon}
                onChange={handleDegisim}
              />
            </Form.Group>

            <Button variant="danger" type="submit" className="w-100">
              Bilgileri Güncelle
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ProfileTR;
