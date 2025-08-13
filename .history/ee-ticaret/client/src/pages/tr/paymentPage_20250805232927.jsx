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
    } else if (name === 'expireMonth' || name === 'expireYear' || name === 'cvc') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= (name === 'cvc' ? 4 : (name === 'expireYear' ? 4 : 2))) {
        setCard((prev) => ({ ...prev, [name]: numericValue }));
      }
    } else {
      setCard((prev) => ({ ...prev, [name]: value }));
    }
  };

  const calculateTotal = () => cart.reduce((acc, item) => acc + (item.price || item.fiyat || 0) * (item.quantity || item.adet || 1), 0);

  const saveOrderToDatabase = async (paymentResponse) => {
    // Örnek: API ile ödeme kaydı ve sipariş bilgisi gönderme
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Burada ödeme işlemi ve validasyon yapılacak
      // Örnek:
      // const response = await axios.post('/api/payment', { card, cart, guestInfo });
      // if (response.success) setShowRegistrationModal(true);

      setShowRegistrationModal(true); // demo amaçlı
    } catch (err) {
      setError('Ödeme işlemi başarısız oldu. Lütfen tekrar deneyiniz.');
    }
    setLoading(false);
  };

  const handleRegistrationChoice = (choice) => {
    // Modal seçim işlemleri
  };

  const totalPrice = calculateTotal();

  return (
    <div className="payment-page-container">
      <Container>
        <h2 className="text-center mb-4 mb-lg-5">Güvenli Ödeme</h2>

        <Row>
          {/* Sol sütun: Ödeme Formu */}
          <Col lg={7}>
            <Card className="payment-card">
              <Card.Header>Kart Bilgileri</Card.Header>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form id="payment-form" onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Kart Üzerindeki İsim</Form.Label>
                    <Form.Control type="text" name="cardHolderName" value={card.cardHolderName} onChange={handleChange} required />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Kart Numarası</Form.Label>
                    <Form.Control type="text" name="cardNumber" value={card.cardNumber} onChange={handleChange} placeholder="XXXX XXXX XXXX XXXX" required />
                  </Form.Group>
                  <Row>
                    <Col md={4} xs={6} className="mb-3 mb-md-0">
                      <Form.Label>Son Kul. Ay</Form.Label>
                      <Form.Control type="text" name="expireMonth" value={card.expireMonth} onChange={handleChange} placeholder="AA" maxLength="2" required />
                    </Col>
                    <Col md={4} xs={6} className="mb-3 mb-md-0">
                      <Form.Label>Son Kul. Yıl</Form.Label>
                      <Form.Control type="text" name="expireYear" value={card.expireYear} onChange={handleChange} placeholder="YYYY" maxLength="4" required />
                    </Col>
                    <Col md={4} xs={12} className="mt-3 mt-md-0">
                      <Form.Label>CVC</Form.Label>
                      <Form.Control type="text" name="cvc" value={card.cvc} onChange={handleChange} placeholder="123" maxLength="4" required />
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Sağ sütun: Sepet Özeti ve Adres */}
          <Col lg={5}>
            <div style={{ position: 'sticky', top: '20px' }}>
              {/* Sipariş Özeti */}
              <Card className="payment-card mb-4">
                <Card.Header>Sipariş Özeti</Card.Header>
                <Card.Body>
                  {cart.length === 0 && <p>Sepetiniz boş.</p>}
                  {cart.map((item, index) => {
                    const price = item.price || item.fiyat || 0;
                    const quantity = item.quantity || item.adet || 1;
                    const itemTotal = price * quantity;
                    return (
                      <div key={index} className="summary-item d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <div><strong>{item.name || item.title || 'Ürün'}</strong></div>
                          <div>Adet: {quantity}</div>
                        </div>
                        <div>{itemTotal.toFixed(2)} TL</div>
                      </div>
                    );
                  })}

                  <hr />

                  <div className="totals-section">
                    <div className="d-flex justify-content-between">
                      <strong>Ara Toplam:</strong>
                      <strong>{totalPrice.toFixed(2)} TL</strong>
                    </div>
                    <div className="d-flex justify-content-between text-success">
                      <span>Kargo:</span>
                      <span>Ücretsiz</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between fs-5 fw-bold">
                      <span>TOPLAM:</span>
                      <span>{totalPrice.toFixed(2)} TL</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Teslimat Adresi */}
              {guestInfo ? (
                <Card className="payment-card mb-4">
                  <Card.Header>Teslimat Adresi</Card.Header>
                  <Card.Body>
                    <p className="mb-1"><strong>{guestInfo.ad} {guestInfo.soyad}</strong></p>
                    <p className="mb-1">{guestInfo.adres_detay}</p>
                    <p>{guestInfo.ilce} / {guestInfo.sehir}</p>
                    {guestInfo.telefon && <p>Telefon: {guestInfo.telefon}</p>}
                  </Card.Body>
                </Card>
              ) : (
                <Alert variant="warning">Teslimat adresi bilgisi bulunamadı.</Alert>
              )}

              {/* Ödeme Butonu */}
              <div className="d-grid">
                <Button
                  type="submit"
                  form="payment-form"
                  variant="primary"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" />
                      <span className="ms-2">Ödeme İşleniyor...</span>
                    </>
                  ) : (
                    <>Ödemeyi Tamamla ({totalPrice.toFixed(2)} TL)</>
                  )}
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Modal */}
      <Modal show={showRegistrationModal} onHide={() => {}} centered backdrop="static" keyboard={false}>
        {/* Modal içeriğiniz */}
      </Modal>
    </div>
  );
};

export default PaymentPage;
