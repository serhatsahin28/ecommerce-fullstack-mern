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
      if (formattedValue.length <= 19) setCard((prev) => ({ ...prev, [name]: formattedValue }));
      return;
    }
    if (name === 'expireMonth') {
      const numeric = value.replace(/\D/g, '');
      if (numeric.length <= 2 && (!numeric || (+numeric >= 1 && +numeric <= 12))) {
        setCard((prev) => ({ ...prev, [name]: numeric }));
      }
      return;
    }
    if (name === 'expireYear') {
      const numeric = value.replace(/\D/g, '');
      if (numeric.length <= 4) setCard((prev) => ({ ...prev, [name]: numeric }));
      return;
    }
    if (name === 'cvc') {
      const numeric = value.replace(/\D/g, '');
      if (numeric.length <= 4) setCard((prev) => ({ ...prev, [name]: numeric }));
      return;
    }

    setCard((prev) => ({ ...prev, [name]: value }));
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
        email: guestInfo.email,
        firstName: guestInfo.ad || guestInfo.name || '',
        lastName: guestInfo.soyad || guestInfo.surname || '',
        phone: guestInfo.telefon || guestInfo.phone || '',
        cart: cart.map(item => ({
          product_id: item.id || item.product_id,
          name: item.name || item.title || 'Ürün',
          category: item.category_title || item.category || 'Genel',
          price: item.price || item.fiyat || 0,
          quantity: item.quantity || item.adet || 1
        })),
        totalAmount: calculateTotal(),
        shippingInfo: {
          address: guestInfo.adres_detay || guestInfo.address || '',
          city: guestInfo.sehir || guestInfo.city || '',
          district: guestInfo.ilce || guestInfo.district || '',
          postalCode: guestInfo.posta_kodu || guestInfo.zipCode || '',
          notes: guestInfo.notlar || guestInfo.notes || ''
        },
        payment: {
          method: 'iyzico',
          status: 'success',
          iyzicoReference: paymentResponse.paymentId || paymentResponse.conversationId,
          date: new Date()
        }
      };

      const orderResponse = await axios.post('http://localhost:5000/orders', orderData);
      if (orderResponse.data.success) {
        setOrderCode(orderResponse.data.orderCode);
        return orderResponse.data;
      } else {
        throw new Error(orderResponse.data.message || 'Sipariş kaydedilemedi');
      }
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

    if (!guestInfo || cart.length === 0) {
      setError('Misafir bilgileri veya sepet boş.');
      setLoading(false);
      return;
    }

    const cardNumberDigits = card.cardNumber.replace(/\D/g, '');
    if (!card.cardHolderName.trim()) return setError('Kart üzerindeki isim zorunludur.'), setLoading(false);
    if (cardNumberDigits.length !== 16) return setError('Kart numarası 16 haneli olmalıdır.'), setLoading(false);
    if (!card.expireMonth || +card.expireMonth < 1 || +card.expireMonth > 12) return setError('Geçerli bir ay giriniz (01-12).'), setLoading(false);
    if (!card.expireYear || card.expireYear.length !== 4) return setError('Geçerli bir yıl giriniz (YYYY).'), setLoading(false);
    if (!card.cvc || card.cvc.length < 3) return setError('CVC en az 3 haneli olmalıdır.'), setLoading(false);

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
        await saveOrderToDatabase(paymentResponse.data);
        setPaymentId(paymentResponse.data.paymentId);
        setCard({ cardHolderName: '', cardNumber: '', expireMonth: '', expireYear: '', cvc: '' });
        setSuccess('');
        setShowRegistrationModal(true);
      } else {
        setError(paymentResponse.data.message || 'Ödeme başarısız.');
      }
    } catch (err) {
      console.error('API Hatası:', err);
      setError(err.response?.data?.message || err.response?.data?.detail || 'Ödeme başarısız.');
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
            <Card className="mb-4">
              <Card.Header>
                <h5>Sepet Özeti</h5>
              </Card.Header>
              <Card.Body>
                {cart.map((item, index) => {
                  const price = item.price || item.fiyat || 0;
                  const quantity = item.quantity || item.adet || 1;
                  return (
                    <div key={index} className="d-flex justify-content-between">
                      <span>{item.name || item.title || 'Ürün'} (x{quantity})</span>
                      <span>{(price * quantity).toFixed(2)} TL</span>
                    </div>
                  );
                })}
                <hr />
                <div className="d-flex justify-content-between">
                  <strong>Toplam: {totalPrice.toFixed(2)} TL</strong>
                </div>
              </Card.Body>
            </Card>
          )}

          {error && <Alert variant="danger">{error}</Alert>}
          {success && !showRegistrationModal && <Alert variant="success">{success}</Alert>}

          <Card>
            <Card.Body>
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
                      <Form.Control
                        type="text"
                        name="expireMonth"
                        value={card.expireMonth}
                        onChange={handleChange}
                        placeholder="12"
                        maxLength="2"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Yıl *</Form.Label>
                      <Form.Control
                        type="text"
                        name="expireYear"
                        value={card.expireYear}
                        onChange={handleChange}
                        placeholder="2030"
                        maxLength="4"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>CVC *</Form.Label>
                      <Form.Control
                        type="text"
                        name="cvc"
                        value={card.cvc}
                        onChange={handleChange}
                        placeholder="123"
                        maxLength="4"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button type="submit" variant="primary" size="lg" className="w-100" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner size="sm" animation="border" className="me-2" />
                      İşleniyor...
                    </>
                  ) : (
                    `Ödemeyi Tamamla (${totalPrice.toFixed(2)} TL)`
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showRegistrationModal} onHide={() => {}} centered backdrop="static" keyboard={false}>
        <Modal.Header>
          <Modal.Title>Ödeme Başarılı! 🎉</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="success" className="mb-3">
            <strong>Tebrikler!</strong> Ödemeniz başarıyla tamamlandı.
            <br />
            <small>İşlem ID: {paymentId}</small>
            {orderCode && (
              <>
                <br />
                <small>Sipariş Kodu: {orderCode}</small>
              </>
            )}
          </Alert>
          <p>Gelecekteki siparişlerinizi takip edebilmek için hesap oluşturmak ister misiniz?</p>
          <ul className="text-muted small">
            <li>Sipariş geçmişinizi görüntüleyebilirsiniz</li>
            <li>Daha hızlı alışveriş yapabilirsiniz</li>
            <li>Özel indirimlerden haberdar olabilirsiniz</li>
          </ul>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button
            variant="primary"
            size="lg"
            onClick={() => handleRegistrationChoice('register')}
            className="me-3"
          >
            Hesap Oluştur
          </Button>
          <Button variant="outline-secondary" size="lg" onClick={() => handleRegistrationChoice('continue')}>
            Devam Et
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PaymentPage;
