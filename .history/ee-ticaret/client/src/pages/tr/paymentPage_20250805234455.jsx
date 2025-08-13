import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner, Card, Modal, InputGroup, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PaymentPage = () => {
  const navigate = useNavigate();

  // --- MEVCUT STATE'LERİNİZ OLDUĞU GİBİ KORUNUYOR ---
  const [card, setCard] = useState({
    cardHolderName: '',
    cardNumber: '',
    expireMonth: '',
    expireYear: '',
    cvc: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Önceki sayfadan gelen adres bilgisini tutar
  const [deliveryInfo, setDeliveryInfo] = useState(null); 
  const [cart, setCart] = useState([]);

  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [orderCode, setOrderCode] = useState('');

  // --- useEffect FONKSİYONU, ADRESİ DE ALACAK ŞEKİLDE DÜZENLENDİ ---
  useEffect(() => {
    // Hem kayıtlı kullanıcı ('userAddress') hem de misafir ('guestInfo') adresini okur.
    const storedAddress = localStorage.getItem('userAddress') || localStorage.getItem('guestInfo');
    const storedCart = localStorage.getItem('cart');
    
    if (storedAddress) {
      setDeliveryInfo(JSON.parse(storedAddress));
    }
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  // --- TÜM FONKSİYONLARINIZ OLDUĞU GİBİ KORUNUYOR ---
  // Bu bölümdeki kodların hiçbiri değiştirilmedi.
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cardNumber') {
      const formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      if (formattedValue.length <= 19) setCard((prev) => ({ ...prev, [name]: formattedValue }));
    } else if (name === 'expireMonth' || name === 'expireYear' || name === 'cvc') {
      const numericValue = value.replace(/\D/g, '');
      const maxLength = name === 'cvc' ? 4 : (name === 'expireYear' ? 4 : 2);
      if (numericValue.length <= numericValue) setCard((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setCard((prev) => ({ ...prev, [name]: value }));
    }
  };
  
  const calculateTotal = () => {
    if (!cart) return 0;
    return cart.reduce((acc, item) => acc + (item.price || item.fiyat || 0) * (item.quantity || item.adet || 1), 0);
  };
  
  const saveOrderToDatabase = async (paymentResponse) => { /* Orijinal kodunuz */ };
  const handleSubmit = async (e) => { /* Orijinal kodunuz */ };
  const handleRegistrationChoice = (choice) => { /* Orijinal kodunuz */ };
  
  const totalPrice = calculateTotal();

  // --- SADECE BOOTSTRAP İLE TASARLANMIŞ, PROFESYONEL VE TAM ARAYÜZ ---
  return (
    <div className="bg-light py-5 min-vh-100">
      <Container>
        <h2 className="text-center mb-5 fw-bold">Güvenli Ödeme</h2>

        <Row>
          {/* === SOL SÜTUN: Kart ve Adres Bilgileri === */}
          <Col lg={7} className="mb-4 mb-lg-0">
            {/* YENİ: ADRES DETAY KARTI */}
            {deliveryInfo && (
              <Card className="shadow-sm border-0 rounded-3 mb-4">
                <Card.Header as="h5" className="bg-white border-bottom-0 py-3 px-4">
                  Teslimat Adresi
                </Card.Header>
                <ListGroup variant="flush">
                  <ListGroup.Item className="d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="fw-bold">Alıcı</div>
                      {deliveryInfo.ad ? `${deliveryInfo.ad} ${deliveryInfo.soyad}` : deliveryInfo.adres_ismi}
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="fw-bold">Adres</div>
                      {deliveryInfo.adres_detay}
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="fw-bold">İlçe / Şehir</div>
                      {deliveryInfo.ilce}, {deliveryInfo.sehir}
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="fw-bold">Posta Kodu</div>
                      {deliveryInfo.posta_kodu}
                    </div>
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            )}

            <Card className="shadow-sm border-0 rounded-3">
              <Card.Header as="h5" className="bg-white border-bottom-0 py-3 px-4">Kart Bilgileri</Card.Header>
              <Card.Body className="p-4">
                {error && <Alert variant="danger">{error}</Alert>}
                <Form id="payment-form" onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Kart Üzerindeki İsim</Form.Label>
                    <Form.Control size="lg" type="text" name="cardHolderName" value={card.cardHolderName} onChange={handleChange} required />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Kart Numarası</Form.Label>
                    <Form.Control size="lg" type="text" name="cardNumber" value={card.cardNumber} onChange={handleChange} placeholder="XXXX XXXX XXXX XXXX" required />
                  </Form.Group>
                  <Row>
                    <Col md={6} className="mb-3 mb-md-0">
                      <Form.Label>Son Kullanma Tarihi</Form.Label>
                      <InputGroup>
                        <Form.Control size="lg" name="expireMonth" value={card.expireMonth} onChange={handleChange} placeholder="AA" maxLength="2" required />
                        <InputGroup.Text>/</InputGroup.Text>
                        <Form.Control size="lg" name="expireYear" value={card.expireYear} onChange={handleChange} placeholder="YYYY" maxLength="4" required />
                      </InputGroup>
                    </Col>
                    <Col md={6}>
                      <Form.Label>CVC</Form.Label>
                      <Form.Control size="lg" type="text" name="cvc" value={card.cvc} onChange={handleChange} placeholder="123" maxLength="4" required />
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* === SAĞ SÜTUN: Sipariş Özeti === */}
          <Col lg={5}>
            <div className="position-sticky" style={{ top: '20px' }}>
              <Card className="shadow-sm border-0 rounded-3">
                <Card.Header as="h5" className="bg-white border-bottom-0 py-3 px-4">Sipariş Özeti</Card.Header>
                <Card.Body className="p-4">
                  {cart && cart.length > 0 ? (
                    cart.map((item, index) => {
                      const price = item.price || item.fiyat || 0;
                      const quantity = item.quantity || item.adet || 1;
                      return (
                        <div key={item.id || index} className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <p className="fw-semibold mb-0">{item.name || item.title || 'Ürün'}</p>
                            <small className="text-muted">Adet: {quantity}</small>
                          </div>
                          <p className="fw-bold text-nowrap ms-3">{(price * quantity).toFixed(2)} TL</p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-muted text-center my-3">Sepetinizde ürün bulunmuyor.</p>
                  )}
                  
                  {cart && cart.length > 0 && (
                    <>
                      <hr className="my-3" />
                      <div className="d-flex justify-content-between"><p className="mb-2">Ara Toplam</p><p className="mb-2">{totalPrice.toFixed(2)} TL</p></div>
                      <div className="d-flex justify-content-between"><p className="mb-2">Kargo</p><p className="mb-2 text-success">Ücretsiz</p></div>
                      <div className="d-flex justify-content-between fw-bold fs-5 mt-3 pt-3 border-top"><p>TOPLAM</p><p>{totalPrice.toFixed(2)} TL</p></div>
                    </>
                  )}
                </Card.Body>
              </Card>
              <div className="d-grid mt-4">
                <Button type="submit" form="payment-form" variant="primary" size="lg" disabled={loading || !cart || cart.length === 0}>
                  {loading ? (<><Spinner as="span" animation="border" size="sm" /> <span className="ms-2">Ödeme İşleniyor...</span></>) : `Ödemeyi Tamamla (${totalPrice.toFixed(2)} TL)`}
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
      
      {/* Orijinal Modal yapınız korunuyor */}
      <Modal show={showRegistrationModal} onHide={() => {}} centered backdrop="static" keyboard={false}>
         {/* ... Orijinal Modal kodunuz ... */}
      </Modal>
    </div>
  );
};

export default PaymentPage;