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

  useEffect(() => {
    const storedGuestInfo = localStorage.getItem('guestInfo');
    const storedCart = localStorage.getItem('cart');
    if (storedGuestInfo) setGuestInfo(JSON.parse(storedGuestInfo));
    if (storedCart) setCart(JSON.parse(storedCart));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cardNumber') {
      const formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      if (formattedValue.length <= 19) setCard(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }
    if (name === 'expireMonth') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 2 && (numericValue === '' || (+numericValue >= 1 && +numericValue <= 12)))
        setCard(prev => ({ ...prev, [name]: numericValue }));
      return;
    }
    if (name === 'expireYear') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 4) setCard(prev => ({ ...prev, [name]: numericValue }));
      return;
    }
    if (name === 'cvc') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 4) setCard(prev => ({ ...prev, [name]: numericValue }));
      return;
    }
    setCard(prev => ({ ...prev, [name]: value }));
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => {
      const price = item.price || item.fiyat || 0;
      const quantity = item.quantity || item.adet || 1;
      return acc + price * quantity;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');

    if (!guestInfo || cart.length === 0) {
      setError('Misafir bilgileri veya sepet boş.');
      setLoading(false); return;
    }

    if (!card.cardHolderName.trim()) {
      setError('Kart üzerindeki isim zorunludur.');
      setLoading(false); return;
    }

    const cardNumberDigits = card.cardNumber.replace(/\D/g, '');
    if (cardNumberDigits.length !== 16) {
      setError('Kart numarası 16 haneli olmalıdır.');
      setLoading(false); return;
    }

    if (!card.expireMonth || +card.expireMonth < 1 || +card.expireMonth > 12) {
      setError('Geçerli bir ay giriniz (01-12).');
      setLoading(false); return;
    }

    if (!card.expireYear || card.expireYear.length !== 4) {
      setError('Geçerli bir yıl giriniz (YYYY).');
      setLoading(false); return;
    }

    if (!card.cvc || card.cvc.length < 3) {
      setError('CVC kodu en az 3 haneli olmalıdır.');
      setLoading(false); return;
    }

    const totalPrice = calculateTotal();

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
      const paymentResponse = await axios.post('http://localhost:5000/pay', paymentData);
      if (paymentResponse.data.success) {
        setPaymentId(paymentResponse.data.paymentId);
        setCard({ cardHolderName: '', cardNumber: '', expireMonth: '', expireYear: '', cvc: '' });
        setShowRegistrationModal(true);
      } else {
        setError(paymentResponse.data.message || 'Ödeme başarısız.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Ödeme başarısız.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationChoice = (choice) => {
    setShowRegistrationModal(false);
    if (choice === 'register') {
      localStorage.setItem('registrationInfo', JSON.stringify(guestInfo));
      navigate('/tr/register/afterPay');
    } else {
      localStorage.removeItem('cart'); localStorage.removeItem('guestInfo');
      navigate('/');
    }
  };

  const totalPrice = calculateTotal();

  return (
    <Container className="py-5">
      <Row className="g-4">
        <Col lg={5}>
          {guestInfo && (
            <Card className="shadow-sm mb-4">
              <Card.Header><h5 className="mb-0">Müşteri Bilgileri</h5></Card.Header>
              <Card.Body>
                <p className="mb-1"><strong>Ad Soyad:</strong> {guestInfo.ad} {guestInfo.soyad}</p>
                <p className="mb-1"><strong>Email:</strong> {guestInfo.email}</p>
                <p className="mb-1"><strong>Telefon:</strong> {guestInfo.telefon}</p>
                <p className="mb-1"><strong>Adres:</strong> {guestInfo.adres_detay}, {guestInfo.ilce}, {guestInfo.sehir}</p>
                <p className="mb-0"><strong>Posta Kodu:</strong> {guestInfo.posta_kodu}</p>
              </Card.Body>
            </Card>
          )}
          {cart.length > 0 && (
            <Card className="shadow-sm">
              <Card.Header><h5 className="mb-0">Sepet Özeti</h5></Card.Header>
              <Card.Body>
                {cart.map((item, index) => (
                  <div key={index} className="d-flex justify-content-between border-bottom py-2 small">
                    <div>
                      <div><strong>{item.name || item.title || 'Ürün'}</strong></div>
                      <div className="text-muted">{item.category || 'Genel'} | Adet: {item.quantity || 1}</div>
                    </div>
                    <div>{((item.price || 0) * (item.quantity || 1)).toFixed(2)} TL</div>
                  </div>
                ))}
                <div className="d-flex justify-content-between mt-3">
                  <strong>Toplam:</strong>
                  <strong>{totalPrice.toFixed(2)} TL</strong>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col lg={7}>
          <Card className="shadow-sm">
            <Card.Header><h5 className="mb-0">Ödeme Bilgileri</h5></Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Kart Üzerindeki İsim *</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="cardHolderName" 
                    value={card.cardHolderName}
                    onChange={handleChange} 
                    placeholder="John Doe"
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Kart Numarası *</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="cardNumber" 
                    value={card.cardNumber}
                    onChange={handleChange} 
                    placeholder="1234 5678 9012 3456"
                    required 
                  />
                  <Form.Text className="text-muted">Test kartı: 5528 7900 0000 0008</Form.Text>
                </Form.Group>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ay *</Form.Label>
                      <Form.Control type="text" name="expireMonth" value={card.expireMonth} onChange={handleChange} placeholder="12" maxLength="2" required />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Yıl *</Form.Label>
                      <Form.Control type="text" name="expireYear" value={card.expireYear} onChange={handleChange} placeholder="2030" maxLength="4" required />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>CVC *</Form.Label>
                      <Form.Control type="text" name="cvc" value={card.cvc} onChange={handleChange} placeholder="123" maxLength="4" required />
                    </Form.Group>
                  </Col>
                </Row>

                <Button type="submit" variant="primary" size="lg" className="w-100" disabled={loading}>
                  {loading ? (<><Spinner size="sm" animation="border" className="me-2" />İşleniyor...</>) : `Ödemeyi Tamamla (${totalPrice.toFixed(2)} TL)`}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showRegistrationModal} onHide={() => {}} centered backdrop="static" keyboard={false}>
        <Modal.Header><Modal.Title>Ödeme Başarılı! 🎉</Modal.Title></Modal.Header>
        <Modal.Body>
          <Alert variant="success" className="mb-3">
            <strong>Tebrikler!</strong> Ödemeniz başarıyla tamamlandı.<br />
            <small>İşlem ID: {paymentId}</small>
            {orderCode && (<><br /><small>Sipariş Kodu: {orderCode}</small></>)}
          </Alert>
          <p>Hesap oluşturmak ister misiniz?</p>
          <ul className="text-muted small">
            <li>Sipariş geçmişinizi görüntüleyebilirsiniz</li>
            <li>Daha hızlı alışveriş yapabilirsiniz</li>
            <li>Özel indirimlerden haberdar olabilirsiniz</li>
          </ul>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button variant="primary" size="lg" onClick={() => handleRegistrationChoice('register')} className="me-3">Hesap Oluştur</Button>
          <Button variant="outline-secondary" size="lg" onClick={() => handleRegistrationChoice('continue')}>Devam Et</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PaymentPage;
