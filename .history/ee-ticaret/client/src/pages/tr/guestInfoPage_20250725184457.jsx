// src/pages/tr/GuestInfoPage.jsx
import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const GuestInfoPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ad: '',
    soyad: '',
    email: '',
    telefon: '',
    tcKimlikNo: '',
    adres_detay: '',
    sehir: '',
    ilce: '',
    posta_kodu: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basit doğrulama
    const requiredFields = [
      'ad', 'soyad', 'email', 'telefon',
      'tcKimlikNo', 'adres_detay', 'sehir', 'ilce', 'posta_kodu'
    ];

    const missing = requiredFields.filter((field) => !formData[field]);
    if (missing.length > 0) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    // localStorage'a geçici misafir verisi kaydet
    localStorage.setItem('guestInfo', JSON.stringify(formData));

    // Ödeme adımına geç
    navigate('/tr/odeme');
  };

  return (
    <Container className="py-5">
      <h2 className="mb-4">Misafir Bilgileri</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Ad</Form.Label>
              <Form.Control
                type="text"
                name="ad"
                value={formData.ad}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Soyad</Form.Label>
              <Form.Control
                type="text"
                name="soyad"
                value={formData.soyad}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Telefon</Form.Label>
              <Form.Control
                type="text"
                name="telefon"
                value={formData.telefon}
                onChange={handleChange}
                placeholder="+905551112233"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>T.C. Kimlik No</Form.Label>
              <Form.Control
                type="text"
                name="tcKimlikNo"
                value={formData.tcKimlikNo}
                onChange={handleChange}
                maxLength={11}
              />
            </Form.Group>
          </Col>
        </Row>

        <h5 className="mt-4">Adres Bilgisi</h5>

        <Form.Group className="mb-3">
          <Form.Label>Adres Detayı</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            name="adres_detay"
            value={formData.adres_detay}
            onChange={handleChange}
          />
        </Form.Group>

        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Şehir</Form.Label>
              <Form.Control
                type="text"
                name="sehir"
                value={formData.sehir}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>İlçe</Form.Label>
              <Form.Control
                type="text"
                name="ilce"
                value={formData.ilce}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Posta Kodu</Form.Label>
              <Form.Control
                type="text"
                name="posta_kodu"
                value={formData.posta_kodu}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex justify-content-end mt-3">
          <Button type="submit" variant="primary">
            Devam Et
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default GuestInfoPage;
