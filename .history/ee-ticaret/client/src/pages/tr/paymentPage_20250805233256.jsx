import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner, Card, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Önceki adımdaki CSS dosyasını import ettiğinizden emin olun
// import './YourStyles.css';

const PaymentPage = () => {
  const navigate = useNavigate();
  
  // --- STATE'LERİNİZ OLDUĞU GİBİ KORUNUYOR ---
  const [card, setCard] = useState({
    cardHolderName: '',
    cardNumber: '',
    expireMonth: '',
    expireYear: '',
    cvc: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Önceki sayfalardan gelen veriler için state'ler
  const [deliveryInfo, setDeliveryInfo] = useState(null); // Hem misafir hem kayıtlı kullanıcı adresini tutar
  const [cart, setCart] = useState([]);

  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [orderCode, setOrderCode] = useState('');

  // --- VERİLERİ LOCALSTORAGE'DAN ÇEKME ---
  useEffect(() => {
    // Önceki sayfada kaydedilen adres ve sepet bilgilerini al
    const storedUserAddress = localStorage.getItem('userAddress');
    const storedGuestInfo = localStorage.getItem('guestInfo');
    const storedCart = localStorage.getItem('cart'); // CartContext'ten veya misafir bilgisinden gelen sepet

    if (storedUserAddress) {
      setDeliveryInfo(JSON.parse(storedUserAddress));
      console.log("Kayıtlı kullanıcı adresi yüklendi:", JSON.parse(storedUserAddress));
    } else if (storedGuestInfo) {
      setDeliveryInfo(JSON.parse(storedGuestInfo));
      console.log("Misafir kullanıcı bilgisi yüklendi:", JSON.parse(storedGuestInfo));
    }
    
    if (storedCart) {
      setCart(JSON.parse(storedCart));
      console.log("Sepet bilgisi yüklendi:", JSON.parse(storedCart));
    }
  }, []);

  // --- FONKSİYONLARINIZ OLDUĞU GİBİ KORUNUYOR ---
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
  
  // Orijinal kodunuzdaki API çağrı fonksiyonları
  const saveOrderToDatabase = async (paymentResponse) => { /* ... Orijinal kodunuz ... */ };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // ... Orijinal kodunuzdaki tüm validasyon ve API çağrı mantığınız buraya ...
    // Örnek bir simülasyon:
    console.log("Ödeme işlemi başlatıldı...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    setShowRegistrationModal(true); // Başarılı olunca modalı göster
    setLoading(false);
  };
  
  const handleRegistrationChoice = (choice) => { /* ... Orijinal kodunuz ... */ };
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
            <div style={{ position: 'sticky', top: '20px' }}>
              
              <Card className="payment-card">
                <Card.Header>Sipariş Özeti</Card.Header>
                <Card.Body>
                  {cart.length > 0 ? (
                    cart.map((item, index) => {
                      const price = item.price || item.fiyat || 0;
                      const quantity = item.quantity || item.adet || 1;
                      return (
                        <div key={item.id || index} className="summary-item">
                          <div className="summary-product-details">
                            <span className="summary-product-name">{item.name || item.title || 'Ürün'}</span>
                            <span className="summary-product-quantity">Adet: {quantity}</span>
                          </div>
                          <span className="summary-product-price">{(price * quantity).toFixed(2)} TL</span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-muted text-center my-3">Sepetinizde ürün bulunmuyor.</p>
                  )}
                  
                  {cart.length > 0 && (
                    <div className="totals-section">
                      <div className="total-row"><span>Ara Toplam</span><span>{totalPrice.toFixed(2)} TL</span></div>
                      <div className="total-row"><span>Kargo</span><span className="text-success">Ücretsiz</span></div>
                      <hr className="my-2" />
                      <div className="total-row grand-total"><span>TOPLAM</span><span>{totalPrice.toFixed(2)} TL</span></div>
                    </div>
                  )}
                </Card.Body>
              </Card>

              {deliveryInfo && (
                <Card className="payment-card">
                  <Card.Header>Teslimat Adresi</Card.Header>
                  <Card.Body>
                    <p className="mb-1"><strong>{deliveryInfo.ad ? `${deliveryInfo.ad} ${deliveryInfo.soyad}` : deliveryInfo.adres_ismi}</strong></p>
                    <p className="text-muted mb-0">
                      {deliveryInfo.adres_detay}<br />
                      {deliveryInfo.ilce} / {deliveryInfo.sehir}<br />
                      Posta Kodu: {deliveryInfo.posta_kodu}
                    </p>
                  </Card.Body>
                </Card>
              )}

              <div className="d-grid">
                <Button type="submit" form="payment-form" variant="primary" size="lg" disabled={loading || cart.length === 0}>
                  {loading ? (
                    <><Spinner as="span" animation="border" size="sm" /> <span className="ms-2">Ödeme İşleniyor...</span></>
                  ) : `Ödemeyi Tamamla (${totalPrice.toFixed(2)} TL)`}
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
      
      {/* Modal kısmı aynı kalıyor */}
      <Modal show={showRegistrationModal} onHide={() => {}} centered backdrop="static" keyboard={false}>
          {/* ... Orijinal Modal kodunuz ... */}
      </Modal>
    </div>
  );
};

export default PaymentPage;