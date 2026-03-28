import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const PaymentPage = () => {
  const [card, setCard] = useState({
    cardHolderName: '',
    cardNumber: '',
    expireMonth: '',
    expireYear: '',
    cvc: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCard((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const guestInfo = JSON.parse(localStorage.getItem('guestInfo') || '{}');
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const price = cart.reduce((acc, item) => acc + item.fiyat * item.adet, 0);
console.log(item);
    try {
      const res = await axios.post('http://localhost:5000/pay', {
        ...guestInfo,
        sepet: cart,
        price,
        card
      });

      setSuccess('Ödeme başarılı!');
      localStorage.removeItem('cart');
    } catch (err) {
      setError('Ödeme başarısız. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <h2>Ödeme Bilgileri</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Kart Üzerindeki İsim</Form.Label>
          <Form.Control type="text" name="cardHolderName" onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Kart Numarası</Form.Label>
          <Form.Control type="text" name="cardNumber" onChange={handleChange} required />
        </Form.Group>
        <Row>
          <Col md={6}>
            <Form.Label>Son Kullanma Ay</Form.Label>
            <Form.Control type="text" name="expireMonth" onChange={handleChange} required />
          </Col>
          <Col md={6}>
            <Form.Label>Son Kullanma Yıl</Form.Label>
            <Form.Control type="text" name="expireYear" onChange={handleChange} required />
          </Col>
        </Row>
        <Form.Group className="mb-3 mt-3">
          <Form.Label>CVC</Form.Label>
          <Form.Control type="text" name="cvc" onChange={handleChange} required />
        </Form.Group>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? <Spinner size="sm" animation="border" /> : 'Ödemeyi Tamamla'}
        </Button>
      </Form>
    </Container>
  );
};

export default PaymentPage;
