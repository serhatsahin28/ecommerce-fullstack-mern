import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner, Card, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PaymentPage = () => {
  const navigate = useNavigate();
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
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [orderCode, setOrderCode] = useState('');
  const [showSaveCardModal, setShowSaveCardModal] = useState(false);

  useEffect(() => {
    const storedGuestInfo = localStorage.getItem('guestInfo');
    const storedCart = localStorage.getItem('cart');
    if (storedGuestInfo) setGuestInfo(JSON.parse(storedGuestInfo));
    if (storedCart) setCart(JSON.parse(storedCart));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'cardNumber') val = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    if (name === 'expireMonth') val = value.replace(/\D/g, '').slice(0, 2);
    if (name === 'expireYear') val = value.replace(/\D/g, '').slice(0, 4);
    if (name === 'cvc') val = value.replace(/\D/g, '').slice(0, 4);
    setCard(prev => ({ ...prev, [name]: val }));
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => {
      const price = item.price || item.fiyat || 0;
      const quantity = item.quantity || item.adet || 1;
      return acc + price * quantity;
    }, 0);
  };

  const saveOrderToDatabase = async (paymentResponse) => {
    try {
      const orderData = {
        userId: null,
        email: guestInfo?.email,
        firstName: guestInfo?.ad || guestInfo?.name || '',
        lastName: guestInfo?.soyad || guestInfo?.surname || '',
        phone: guestInfo?.telefon || guestInfo?.phone || '',
        cart: cart.map(item => ({
          product_id: item.id || item.product_id,
          name: item.name || item.title || 'Ürün',
          category: item.category_title || item.category || 'Genel',
          price: item.price || item.fiyat || 0,
          quantity: item.quantity || item.adet || 1
        })),
        totalAmount: calculateTotal(),
        shippingInfo: {
          address: guestInfo?.adres_detay || guestInfo?.address || '',
          city: guestInfo?.sehir || guestInfo?.city || '',
          district: guestInfo?.ilce || guestInfo?.district || '',
          postalCode: guestInfo?.posta_kodu || guestInfo?.zipCode || '',
          notes: guestInfo?.notlar || guestInfo?.notes || ''
        },
        payment: {
          method: 'iyzico',
          status: 'success',
          iyzicoReference: paymentResponse.paymentId || paymentResponse.conversationId,
          date: new Date()
        }
      };

      const orderResponse = await axios.post(`${import.meta.env.VITE_API_URL}/orders', orderData);
      if (orderResponse.data.success) {
        setOrderCode(orderResponse.data.orderCode);
        return orderResponse.data;
      }
      throw new Error(orderResponse.data.message || 'Sipariş kaydedilemedi');
    } catch (error) {
      console.error('Sipariş kaydetme hatası:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const totalPrice = calculateTotal();
    const cardNumberDigits = card.cardNumber.replace(/\D/g, '');

    if (!guestInfo || cart.length === 0 || !card.cardHolderName || cardNumberDigits.length !== 16) {
      setError('Bilgilerinizi kontrol edin.');
      setLoading(false);
      return;
    }

    const paymentData = {
      ad: guestInfo.ad || guestInfo.name || '',
      soyad: guestInfo.soyad || guestInfo.surname || '',
      email: guestInfo.email || '',
      telefon: guestInfo.telefon || guestInfo.phone || '',
      adres_detay: guestInfo.adres_detay || guestInfo.address || '',
      sehir: guestInfo.sehir || guestInfo.city || '',
      posta_kodu: guestInfo.posta_kodu || guestInfo.zipCode || '',
      sepet: cart.map(item => ({
        product_id: item.id || item.product_id,
        translations: item.translations || { tr: { title: item.name || item.title || 'Ürün' } },
        category_title: item.category_title || item.category || 'Genel',
        price: item.price || item.fiyat || 0,
        quantity: item.quantity || item.adet || 1
      })),
      totalPrice,
      card: {
        cardHolderName: card.cardHolderName.trim(),
        cardNumber: cardNumberDigits,
        expireMonth: card.expireMonth.padStart(2, '0'),
        expireYear: card.expireYear,
        cvc: card.cvc
      }
    };

    try {
      const paymentResponse = await axios.post(`${import.meta.env.VITE_API_URL}/pay', paymentData);
      if (paymentResponse.data.success) {
        await saveOrderToDatabase(paymentResponse.data);
        setPaymentId(paymentResponse.data.paymentId);
        setShowSaveCardModal(true);
      } else setError(paymentResponse.data.message || 'Ödeme başarısız.');
    } catch {
      setError('Ödeme başarısız. Tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCardChoice = (choice) => {
    setShowSaveCardModal(false);
    if (choice === 'save') {
      setShowRegistrationModal(true);
    } else {
      localStorage.removeItem('cart');
      localStorage.removeItem('guestInfo');
      navigate('/');
    }
  };

  const handleRegistrationChoice = (choice) => {
    setShowRegistrationModal(false);
    if (choice === 'register') {
      localStorage.setItem('registrationInfo', JSON.stringify(guestInfo));
      navigate('/tr/register/afterPay');
    } else {
      localStorage.removeItem('cart');
      localStorage.removeItem('guestInfo');
      navigate('/');
    }
  };

  const totalPrice = calculateTotal();

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <h2 className="mb-4">Ödeme Bilgileri</h2>

          {cart.length > 0 && (
            <Card className="mb-4 shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Sepet Özeti</h5>
              </Card.Header>
              <Card.Body>
                {cart.map((item, index) => (
                  <div key={index} className="d-flex justify-content-between border-bottom py-2">
                    <span>{item.name || item.title || 'Ürün'} <small className="text-muted">x{item.quantity || item.adet || 1}</small></span>
                    <span>{((item.price || item.fiyat || 0) * (item.quantity || item.adet || 1)).toFixed(2)} TL</span>
                  </div>
                ))}
                <div className="mt-3 text-muted">
                  <small>
                    {guestInfo?.adres_detay}, {guestInfo?.ilce} / {guestInfo?.sehir}
                  </small>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <strong>Toplam:</strong>
                  <strong>{totalPrice.toFixed(2)} TL</strong>
                </div>
              </Card.Body>
            </Card>
          )}

          {error && <Alert variant="danger">{error}</Alert>}
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Kart Üzerindeki İsim *</Form.Label>
                  <Form.Control type="text" name="cardHolderName" value={card.cardHolderName} onChange={handleChange} placeholder="John Doe" required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Kart Numarası *</Form.Label>
                  <Form.Control type="text" name="cardNumber" value={card.cardNumber} onChange={handleChange} placeholder="1234 5678 9012 3456" required />
                </Form.Group>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ay *</Form.Label>
                      <Form.Control type="text" name="expireMonth" value={card.expireMonth} onChange={handleChange} placeholder="12" required />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Yıl *</Form.Label>
                      <Form.Control type="text" name="expireYear" value={card.expireYear} onChange={handleChange} placeholder="2030" required />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>CVC *</Form.Label>
                      <Form.Control type="text" name="cvc" value={card.cvc} onChange={handleChange} placeholder="123" required />
                    </Form.Group>
                  </Col>
                </Row>

                <Button type="submit" variant="primary" size="lg" className="w-100" disabled={loading}>
                  {loading ? <Spinner size="sm" animation="border" className="me-2" /> : `Ödemeyi Tamamla (${totalPrice.toFixed(2)} TL)`}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Kart Kaydet Modal */}
      <Modal show={showSaveCardModal} centered backdrop="static" keyboard={false}>
        <Modal.Header>
          <Modal.Title>Kart Kaydet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Ödemeniz başarılı. Kart bilgilerinizi kaydetmek ister misiniz?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => handleSaveCardChoice('skip')}>Kaydetmeden Devam Et</Button>
          <Button variant="primary" onClick={() => handleSaveCardChoice('save')}>Kaydet</Button>
        </Modal.Footer>
      </Modal>

      {/* Kayıt Olma Seçeneği Modal */}
      <Modal show={showRegistrationModal} centered backdrop="static" keyboard={false}>
        <Modal.Header>
          <Modal.Title>Ödeme Başarılı! 🎉</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="success" className="mb-3">
            <strong>Tebrikler!</strong> Ödemeniz tamamlandı.
            <br />
            <small>İşlem ID: {paymentId}</small>
            {orderCode && (
              <>
                <br />
                <small>Sipariş Kodu: {orderCode}</small>
              </>
            )}
          </Alert>
          <p>Hesap oluşturup siparişlerinizi takip etmek ister misiniz?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => handleRegistrationChoice('skip')}>Kaydetmeden Devam Et</Button>
          <Button variant="primary" onClick={() => handleRegistrationChoice('register')}>Kaydet ve Devam Et</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PaymentPage;
