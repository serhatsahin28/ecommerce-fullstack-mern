import React, { useState, useEffect } from 'react';
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
  const [guestInfo, setGuestInfo] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // localStorage'dan misafir ve sepet bilgisi oku
    const storedGuestInfo = localStorage.getItem('guestInfo');
    const storedCart = localStorage.getItem('cart');
    if (storedGuestInfo) setGuestInfo(JSON.parse(storedGuestInfo));
    if (storedCart) setCart(JSON.parse(storedCart));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCard((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!guestInfo || cart.length === 0) {
      setError('Misafir bilgileri veya sepet boş. Lütfen tekrar deneyin.');
      setLoading(false);
      return;
    }

    // total fiyat hesaplama
    const totaPprice = cart.reduce((acc, item) => acc + (item.price || item.fiyat) * (item.quantity || item.adet), 0);
    try {
      const res = await axios.post('http://localhost:5000/pay', {
        guestInfo,
        sepet: cart,
        price,
        card
      });

      setSuccess('Ödeme başarılı!');
      localStorage.removeItem('cart');
      localStorage.removeItem('guestInfo');
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
