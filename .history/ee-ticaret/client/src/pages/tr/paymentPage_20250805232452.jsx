import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner, Card, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Önceki adımdaki CSS dosyasını import ettiğinizden emin olun
// import './YourStyles.css';

const PaymentPage = () => {
  // --- STATE VE FONKSİYONLAR (DEĞİŞİKLİK YOK) ---
  // Mevcut state'leriniz ve fonksiyonlarınız (useEffect, handleChange, handleSubmit vb.) 
  // olduğu gibi kalıyor. Bu sayede mevcut mantığınız bozulmaz.
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
  const saveOrderToDatabase = async (paymentResponse) => { /* ... Mevcut kodunuz ... */ };
  const handleSubmit = async (e) => { /* ... Mevcut kodunuz ... */ 
      e.preventDefault();
      setLoading(true);
      setError('');
      // ... Tüm validasyon ve API çağrı mantığınız burada ...
      // Başarılı olursa:
      // setShowRegistrationModal(true);
      // Başarısız olursa:
      // setError('...');
      // setLoading(false);
  };
  const handleRegistrationChoice = (choice) => { /* ... Mevcut kodunuz ... */ };
  const totalPrice = calculateTotal();

  // --- YENİLENMİŞ VE PROFESYONEL ARAYÜZ (JSX) ---
  return (
    <div className="payment-page-container">
      <Container>
        <h2 className="text-center mb-4 mb-lg-5">Güvenli Ödeme</h2>

        <Row>
          {/* === SOL SÜTUN: Ödeme Formu === */}
          <Col lg={7}>
            <Card className="payment-card">
              <Card.Header>Kart Bilgileri</Card.Header>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                
                {/* Ödeme formunu bir ID ile işaretliyoruz */}
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

          {/* === SAĞ SÜTUN: Sipariş Özeti ve Adres === */}
          <Col lg={5}>
            {/* Büyük ekranda bu sütunun sabit kalmasını sağlar */}
            <div style={{ position: 'sticky', top: '20px' }}>
              
              {/* --- YENİ: Sipariş Özeti Kartı --- */}
              <Card className="payment-card">
                <Card.Header>Sipariş Özeti</Card.Header>
                <Card.Body>
                  {cart.map((item, index) => {
                    const price = item.price || item.fiyat || 0;
                    const quantity = item.quantity || item.adet || 1;
                    return (
                      <div key={index} className="summary-item">
                        <div className="summary-product-details">
                          <span className="summary-product-name">{item.name || item.title || 'Ürün'}</span>
                          <span className="summary-product-quantity">Adet: {quantity}</span>
                        </div>
                        <span className="summary-product-price">
                          {(price * quantity).toFixed(2)} TL
                        </span>
                      </div>
                    );
                  })}
                  
                  {/* Toplam Fiyat Bölümü */}
                  <div className="totals-section">
                    <div className="total-row">
                      <span>Ara Toplam</span>
                      <span>{totalPrice.toFixed(2)} TL</span>
                    </div>
                    <div className="total-row">
                      <span>Kargo</span>
                      <span className="text-success">Ücretsiz</span>
                    </div>
                    <hr className="my-2" />
                    <div className="total-row grand-total">
                      <span>TOPLAM</span>
                      <span>{totalPrice.toFixed(2)} TL</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* --- YENİ: Adres Bilgisi Kartı --- */}
              {guestInfo && (
                <Card className="payment-card">
                  <Card.Header>Teslimat Adresi</Card.Header>
                  <Card.Body>
                    <p className="mb-1"><strong>{guestInfo.ad} {guestInfo.soyad}</strong></p>
                    <p className="text-muted mb-0">
                      {guestInfo.adres_detay}<br />
                      {guestInfo.ilce} / {guestInfo.sehir}
                    </p>
                  </Card.Body>
                </Card>
              )}

              {/* Ödeme butonu, formu dışarıdan tetiklemek için form="payment-form" ID'sini kullanır */}
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
                    `Ödemeyi Tamamla (${totalPrice.toFixed(2)} TL)`
                  )}
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
      
      {/* Modal kısmı aynı kalıyor, çünkü mantığı doğru */}
      <Modal show={showRegistrationModal} onHide={() => {}} centered backdrop="static" keyboard={false}>
          {/* ... Mevcut Modal kodunuz ... */}
      </Modal>
    </div>
  );
};

export default PaymentPage;