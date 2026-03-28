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

  const [touchedFields, setTouchedFields] = useState({});
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
  };

  const isEmpty = (field) => touchedFields[field] && !formData[field];

  const handleSubmit = (e) => {
    e.preventDefault();

    const requiredFields = [
      'ad', 'soyad', 'email', 'telefon',
      'tcKimlikNo', 'adres_detay', 'sehir', 'ilce', 'posta_kodu'
    ];

    const missing = requiredFields.filter((field) => !formData[field]);
    if (missing.length > 0) {
      setTouchedFields((prev) => {
        const updated = { ...prev };
        missing.forEach((field) => (updated[field] = true));
        return updated;
      });
      setFormError('Lütfen eksik alanları doldurun.');
      return;
    }

    localStorage.setItem('guestInfo', JSON.stringify(formData));
    navigate('/tr/odeme');
  };

  const renderInput = (label, name, type = 'text', as = 'input') => (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <Form.Control
        as={as}
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        isInvalid={isEmpty(name)}
      />
      <Form.Control.Feedback type="invalid">
        Bu alan zorunludur.
      </Form.Control.Feedback>
    </Form.Group>
  );

  return (
    <Container className="py-5">
      <h2 className="mb-4">Misafir Bilgileri</h2>
      {formError && <Alert variant="danger">{formError}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>{renderInput('Ad', 'ad')}</Col>
          <Col md={6}>{renderInput('Soyad', 'soyad')}</Col>
        </Row>
        <Row>
          <Col md={6}>{renderInput('Email', 'email', 'email')}</Col>
          <Col md={6}>{renderInput('Telefon', 'telefon')}</Col>
        </Row>
       

        <h5 className="mt-4">Adres Bilgisi</h5>
        {renderInput('Adres Detayı', 'adres_detay', 'text', 'textarea')}

        <Row>
          <Col md={4}>{renderInput('Şehir', 'sehir')}</Col>
          <Col md={4}>{renderInput('İlçe', 'ilce')}</Col>
          <Col md={4}>{renderInput('Posta Kodu', 'posta_kodu')}</Col>
        </Row>

        <div className="d-flex justify-content-end mt-3">
          <Button type="submit" variant="primary">Devam Et</Button>
        </div>
      </Form>
    </Container>
  );
};

export default GuestInfoPage;
