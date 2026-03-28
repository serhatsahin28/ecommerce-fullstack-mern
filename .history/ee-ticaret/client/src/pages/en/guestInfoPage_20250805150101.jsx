// src/pages/en/GuestInfoPage.jsx
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
      'firstName', 'lastName', 'email', 'phone',
      'addressDetail', 'city', 'district', 'postalCode'
    ];

    const missing = requiredFields.filter((field) => !formData[field]);
    if (missing.length > 0) {
      setTouchedFields((prev) => {
        const updated = { ...prev };
        missing.forEach((field) => (updated[field] = true));
        return updated;
      });
      setFormError('Please fill in all required fields.');
      return;
    }

    setFormError('');
    localStorage.setItem('guestInfo', JSON.stringify(formData));
    navigate('/en/pay');
  };

  const renderInput = (label, name, type = 'text', as = 'input') => (
    <Form.Group className="mb-3" controlId={`form-${name}`}>
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
        This field is required.
      </Form.Control.Feedback>
    </Form.Group>
  );

  return (
    <Container className="py-5">
      <h2 className="mb-4">Guest Information</h2>
      {formError && <Alert variant="danger">{formError}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>{renderInput('First Name', 'firstName')}</Col>
          <Col md={6}>{renderInput('Last Name', 'lastName')}</Col>
        </Row>
        <Row>
          <Col md={6}>{renderInput('Email', 'email', 'email')}</Col>
          <Col md={6}>{renderInput('Phone', 'phone')}</Col>
        </Row>

        <h5 className="mt-4">Address Information</h5>
        {renderInput('Address Detail', 'addressDetail', 'text', 'textarea')}

        <Row>
          <Col md={4}>{renderInput('City', 'city')}</Col>
          <Col md={4}>{renderInput('District', 'district')}</Col>
          <Col md={4}>{renderInput('Postal Code', 'postalCode')}</Col>
        </Row>

        <div className="d-flex justify-content-end mt-3">
          <Button type="submit" variant="primary">Continue</Button>
        </div>
      </Form>
    </Container>
  );
};

export default GuestInfoPage;
