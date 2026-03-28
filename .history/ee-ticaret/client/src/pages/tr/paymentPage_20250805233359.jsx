import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner, Card, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PaymentPage = () => {
  const navigate = useNavigate();

  // Kart bilgileri
  const [card, setCard] = useState({
    cardHolderName: '',
    cardNumber: '',
    expireMonth: '',
    expireYear: '',
    cvc: ''
  });

  // Durumlar
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [guestInfo, setGuestInfo] = useState(null);
  const [cart, setCart] = useState([]);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  // Ödeme sonrası (örnek)
  const [paymentId, setPaymentId] = useState('');
  const [orderCode, setOrderCode] = useState('');

  // Sayfa yüklendiğinde localStorage'dan verileri al
  useEffect(() => {
    const storedGuestInfo = localStorage.getItem('guestInfo');
    const storedCart = localStorage.getItem('cart');
    if (storedGuestInfo) setGuestInfo(JSON.parse(storedGuestInfo));
    if (storedCart) setCart(JSON.parse(storedCart));
  }, []);

  // Kart formu input değişimi
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cardNumber') {
      // Kart numarasını 4'erli bloklara ayır ve sayı olmayanları temizle
      const formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      if (formattedValue.length <= 19) setCard((prev) => ({ ...prev, [name]: formattedValue }));
    } else if (name === 'expireMonth' || name === 'expireYear' || name === 'cvc') {
      const numericValue = value.replace(/\D/g, '');
      const maxLen = name === 'cvc' ? 4 : (name === 'expireYear' ? 4 : 2);
      if (numericValue.length <= maxLen) {
        setCard((prev) => ({ ...prev, [name]: numericValue }));
      }
    } else {
      setCard((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Sepetteki toplam fiyatı hesapla
  const calculateTotal = () =>
    cart.reduce((acc, item) => acc + (item.price || item.fiyat || 0) * (item.quantity || item.adet || 1), 0);

  // Ödeme formu submit işlemi
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basit örnek validasyon
    if (!card.cardHolderName || !card.cardNumber || !card.expireMonth || !card.expireYear || !card.cvc) {
      setError('Lütfen tüm kart bilgilerini eksiksiz doldurun.');
      setLoading(false);
      return;
    }

    if (cart.length === 0) {
      setError('Sepetiniz boş.');
      setLoading(false);
      return;
    }

    try {
      // Ödeme işlemi için API çağrısı (örnek)
      // const response = await axios.post('/api/payment', { card, cart, guestInfo });

      // Başarılı ödeme sonrası modal aç
      // setPaymentId(response.data.paymentId);
      // setOrderCode(response.data.orderCode);
      setShowRegistrationModal(true); // Demo amaçlı doğrudan açıyoruz
    } catch (err) {
      setError('Ödeme işlemi başarısız oldu. Lütfen tekrar deneyin.');
    }
    setLoading(false);
  };

  // Modal içindeki seçim işlemleri
  const handleRegistrationChoice = (choice) => {
    setShowRegistrationModal(false);
    if (choice === 'register') {
      navigate('/register');
    } else if (choice === 'guest') {
      navigate('/guest-order-summary');
    }
  };

  const totalPrice = calculateTotal();

  return (
    <div className="payment-page-container" style={{ padding: '2rem 0' }}>
      <Container>
        <h2 className="text-center mb-5">Güvenli Ödeme</h2>

        <Row>
          {/* Ödeme Formu */}
          <Col lg={7}>
            <Card className="payment-card">
              <Card.Header>Kart Bilgileri</Card.Header>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form id="payment-form" onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="cardHolderName">
                    <Form.Label>Kart Üzerindeki İsim</Form.Label>
                    <Form.Control
                      type="text"
                      name="cardHolderName"
                      value={card.cardHolderName}
                      onChange={handleChange}
                      placeholder="Adınız Soyadınız"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="cardNumber">
                    <Form.Label>Kart Numarası</Form.Label>
                    <Form.Control
                      type="text"
                      name="cardNumber"
                      value={card.cardNumber}
                      onChange={handleChange}
                      placeholder="XXXX XXXX XXXX XXXX"
                      maxLength={19}
                      required
                    />
                  </Form.Group>

                  <Row>
                    <Col md={4} xs={6} className="mb-3 mb-md-0">
                      <Form.Label>Son Kullanma Ayı</Form.Label>
                      <Form.Control
                        type="text"
                        name="expireMonth"
                        value={card.expireMonth}
                        onChange={handleChange}
                        placeholder="AA"
                        maxLength={2}
                        required
                      />
                    </Col>

                    <Col md={4} xs={6} className="mb-3 mb-md-0">
                      <Form.Label>Son Kullanma Yılı</Form.Label>
                      <Form.Control
                        type="text"
                        name="expireYear"
                        value={card.expireYear}
                        onChange={handleChange}
                        placeholder="YYYY"
                        maxLength={4}
                        required
                      />
                    </Col>

                    <Col md={4} xs={12}>
                      <Form.Label>CVC</Form.Label>
                      <Form.Control
                        type="text"
                        name="cvc"
                        value={card.cvc}
                        onChange={handleChange}
                        placeholder="123"
                        maxLength={4}
                        required
                      />
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Sipariş Özeti ve Adres */}
          <Col lg={5}>
            <div style={{ position: 'sticky', top: '20px' }}>
              {/* Sipariş Özeti */}
              <Card className="payment-card mb-4">
                <Card.Header>Sipariş Özeti</Card.Header>
                <Card.Body>
                  {cart.length === 0 && <p>Sepetiniz boş.</p>}
                  {cart.map((item, idx) => {
                    const price = item.price || item.fiyat || 0;
                    const quantity = item.quantity || item.adet || 1;
                    return (
                      <div
                        key={idx}
                        className="d-flex justify-content-between align-items-center mb-2"
                        style={{ borderBottom: '1px solid #eee', paddingBottom: '8px' }}
                      >
                        <div>
                          <div><strong>{item.name || item.title || 'Ürün'}</strong></div>
                          <div>Adet: {quantity}</div>
                        </div>
                        <div>{(price * quantity).toFixed(2)} TL</div>
                      </div>
                    );
                  })}

                  <hr />

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

      {/* Ödeme sonrası modal */}
      <Modal show={showRegistrationModal} onHide={() => {}} centered backdrop="static" keyboard={false}>
        <Modal.Header>
          <Modal.Title>Ödeme Başarılı</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Ödemeniz başarıyla alındı!</p>
          <p>Ödeme ID: <strong>{paymentId || '123456'}</strong></p>
          <p>Sipariş Kodu: <strong>{orderCode || 'ABCDEF'}</strong></p>
          <p>Üyelik oluşturmak ister misiniz?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => handleRegistrationChoice('guest')}>
            Misafir Olarak Devam Et
          </Button>
          <Button variant="primary" onClick={() => handleRegistrationChoice('register')}>
            Üye Ol
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PaymentPage;
